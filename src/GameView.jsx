import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';
import AdminView from './AdminView';
import ConfirmationMessage from './ConfirmationMessage';
import Countdown from './Countdown';

const GameView = () => {
    const [quiz, setQuiz] = useState(false);

    const [ready, setReady] = useState(false);
    const [quizReady, setQuizReady] = useState(false);
    const [player, setPlayer] = useState({ playerName: '', playerPoints: 0, playerIsDisqualified: false });
    const [currentQuestionGroup, setCurrentQuestionGroup] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [playerAnswers, setPlayerAnswers] = useState({});
    const [doneCounting, setDoneCounting] = useState(false);
    //timer
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(1);
    const [isActive, setIsActive] = useState(false);


    const { id } = useParams()

    useEffect(() => {
        API.get(`/quiz-instances/${id}`).then((response) => {
            setQuiz(response.data.data.quiz);
        });

        
    }, [id]);

    useEffect(() => {
        if(quizReady && ready) {
            setMinutes(Math.floor(quiz.question_groups[currentQuestionGroup].answer_time));
            
        }
    },[ready])

    const savePlayer = async () => {
        await API.post(`/players`, { quiz_instance_id: id, name: player.playerName, points: player.playerPoints, is_disqualified: player.playerIsDisqualified }).then((response) => {
            setReady(true);
            setIsWaiting(true);
            setPlayer({...player, id: response.data.data.id});
        }).catch((error) => {
            alert('Something went wrong.. check the console for more information.');
            console.log(error);
        });
    }

    const saveAnswers = async (currentQuestionId, currentAnswerId) => {
        await API.post(`/answers/set-selected-answer`, { player_id: player.id, question_id: currentQuestionId, answer_id: currentAnswerId})
      }

    const saveOpenAnswers = async (currentQuestionId, answer) => {
        await API.post(`/answers/set-open-answer`, { player_id: player.id, question_id: currentQuestionId, answer: answer})
    }

    const nextQuestion = () => {
        if (currentQuestionGroup.questions.length - 1 === currentQuestion) {
            setShowConfirmation(true)
        } else {
            setCurrentQuestion(currentQuestion => currentQuestion + 1);
        }
    }

    const userFinishQuiz = (choice) => {
        API.post(`/players/${player.id}/deactivate`);
        setShowConfirmation(false);
        if (choice) {
            setIsWaiting(true);
        }
    }

    const previousQuestion = () => {
        if (currentQuestion !== 0) {
            setCurrentQuestion(currentQuestion => currentQuestion - 1);
        }
    }

    useEffect(() => {
        if (currentQuestionGroup != null) return;
        if (!ready) return;
        const pollingInterval = 1000; // 1 second in milliseconds
        const pollInterval = setInterval(() => {
            API.get(`quiz-instances/${id}/poll-group`).then((response) => {
                setCurrentQuestionGroup(response.data.data.active_question_group)
                setIsWaiting(false)
                setQuizReady(true)
            });

        }, pollingInterval);
        return () => clearInterval(pollInterval);
    }, [currentQuestionGroup, ready]);


    //timer courtesy of chatgpt
    useEffect(() => {
        let intervalId;
    
        if (isActive && (minutes > 0 || seconds > 0)) {
          intervalId = setInterval(() => {
            if (seconds === 0 && minutes !== 0) {
              setSeconds(59);
              setMinutes(prevMinutes => prevMinutes - 1);
            } else if (seconds !== 0) {
              setSeconds(prevSeconds => prevSeconds - 1);
            }
          }, 1000);
        }
        if(minutes === 0 && seconds === 0) {
            setIsWaiting(true);
            setIsActive(false);
        }
        
		return () => clearInterval(intervalId);
	}, [isActive, minutes, seconds]);

	const formatTime = (time) => {
		return time < 10 ? `0${time}` : time;
	};

	const finishCountdown = () => {
		setDoneCounting(true);
		setIsActive(true);
	}

    const Questions = useMemo(() => {
        if (!currentQuestionGroup) return null;
        return currentQuestionGroup.questions.map(function (Question, questionIndex) {
			let Answers;
			if (!Question.is_open_answer) {
				Answers = Question.answers.map(function (Answer, answerIndex) {
					return (
						<div
							key={answerIndex}
							onClick={(e) => {
								saveAnswers(Question.id, Answer.id) && setPlayerAnswers({
								...playerAnswers,
								[Question.id]: Answer.id
								});
							}}
							disabled={playerAnswers[Question.id] === Answer.id}
							className="answer"
							>
							<span className="answerOptionText">{Answer.text}</span>
						</div>
					)
				})
			} else {
				Answers = () => {
					return (
						<label className="manualAnswer">
							<p>{Question.guidelines}</p>
							<input onChange={(e) => saveOpenAnswers(Question.id, e.target.value) && setPlayerAnswers({ ...playerAnswers, [Question.id]: e.target.value })} value={playerAnswers[Question.id]} type="text"></input>
						</label>
					)
				}
			}

			return (
				<>
					<div className="questionContainer">
						<div className="previousButton" onClick={() => previousQuestion()}>{'<'}</div>
						<div className="questionInfo">
							<div className="clock me-5"><i className="fa-regular fa-clock fa-2x me-2" style={{ color: "#f2e9e4" }}></i><span>{formatTime(minutes)}:{formatTime(seconds)}</span></div>
							<div className="questionsLeft ms-5"><span>{currentQuestion + 1}/{currentQuestionGroup.questions.length}</span><i className="ms-2 fa-solid fa-check fa-2x" style={{ color: "#f2e9e4" }}></i></div>
						</div>
						<div className="p-3 question">
							<img src={Question.image} className="questionImage mb-2" /><br/>
							<span className="questionText">{Question.text}</span>
						</div>
						<div className="nextButton" onClick={() => nextQuestion()}>{'>'}</div>
					</div>
					<div className="answerContainer">
						{Answers}
					</div>

				</>
			)
		});
    }, [currentQuestionGroup, currentQuestion, playerAnswers, minutes, seconds, previousQuestion, nextQuestion, saveAnswers, saveOpenAnswers]);

	const CurrentActiveQuestion = useMemo(() => {
		if (Questions === null) return false;
		if (currentQuestion === null) return false;
		return Questions[currentQuestion];
	}, [Questions, currentQuestion])

    return (
        <>
            <div className="gameViewContainer">
                <div className="eruditsBG">
                    <div className="layer1"></div>
                    <div className="layer2"></div>
                    <div className="layer3"></div>
                    <div className="layer4"></div>
                    <div className="layer5"></div>
                    <div className="layer6"></div>
                    <div className="layer7"></div>
                    <div className="layer8"></div>
                    <div className="layer9"></div>
                    <div className="layer10"></div>
                    <div className="layer11"></div>
                    <div className="layer12"></div>
                    <div className="layer13"></div>
                </div>
                {!ready && <div className="playerName">
                    <div className="playerNameContainer">
                        <h1 className="title">{quiz.title}</h1>
                        <h2 className="title mt-3" style={{ fontSize: "20pt" }}>Lūdzu, ievadiet komandas nosaukumu:</h2>
                        <input disabled={(ready)} onChange={(e) =>
                            setPlayer({ ...player, playerName: e.target.value })} value={player.playerName}
                            placeholder="Komandas nosaukums" className="mt-4 playerNameInput" type="text" /><br />
                        <button onClick={() => savePlayer()} disabled={(ready)} className="readyButton readyButtonAnimation p-2 ps-4 pe-4 mt-5 mb-4">Esmu gatavs spēlēt!</button> <br />
                        {/* spinner */}
                        {ready && <div>
                            <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                            <h5 className="title" style={{ fontSize: "15pt" }}>Lūdzu, gaidiet spēles sākumu!</h5>
                        </div>}
                    </div>
                </div>}

                {isWaiting && <div className="waiting glass">
                    <div className="waitingContainer">
                        <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                        <h5 className="title" style={{ fontSize: "20pt" }}>Lūdzu, gaidiet spēles turpinājumu!</h5>
                    </div>
                </div>}

                {quizReady && ready && quiz && !isWaiting && <Countdown done={finishCountdown}/>}

                {quizReady && ready && quiz && !isWaiting && doneCounting && <div className="content gameView">
                    {showConfirmation && <ConfirmationMessage message="Iesniegt atbildes?" onConfirm={userFinishQuiz} />}
                    {Questions && CurrentActiveQuestion}
                </div>}
            </div>
        </>
    );
}


export default GameView;