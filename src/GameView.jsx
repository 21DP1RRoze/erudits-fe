import { useEffect, useRef, useState } from 'react';
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
    const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0);
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
    },[quizReady, ready])

    const savePlayer = async () => {
        await API.post(`/players`, { quiz_instance_id: id, name: player.playerName, points: player.playerPoints, is_disqualified: player.playerIsDisqualified }).then((response) => {
            setReady(true);
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
        if (quiz.question_groups[currentQuestionGroup].questions.length - 1 === currentQuestion) {
            setShowConfirmation(true)
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }
    }

    const userFinishQuiz = (choice) => {
        setShowConfirmation(false);
        if (choice) {
            setIsWaiting(true);
        }
    }

    const previousQuestion = () => {
        if (currentQuestion !== 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    }
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
                {!quizReady && <div className="playerName">
                    <div className="playerNameContainer">
                    {/* <h1 onClick={() => console.log(playerAnswers)}>click to log</h1> */}

                        <h1 className="title">{quiz.title}</h1>
                        <h2 className="title mt-3" style={{ fontSize: "20pt" }}>Lūdzu, ievadiet komandas nosaukumu:</h2>
                        <input disabled={(ready)} onChange={(e) =>
                            setPlayer({ ...player, playerName: e.target.value })} value={player.playerName}
                            placeholder="Komandas nosaukums" className="mt-4 playerNameInput" type="text" /><br />
                        <button onClick={() => savePlayer()} disabled={(ready)} className="readyButton readyButtonAnimation p-2 ps-4 pe-4 mt-5 mb-4">Esmu gatavs spēlēt!</button> <br />
                        {/* spinner */}
                        {ready && <div>
                            <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                            <h5 onClick={()=> {setQuizReady(true)}}className="title" style={{ fontSize: "15pt" }}>Lūdzu, gaidiet spēles sākumu!</h5>
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

                    <div className="questionContainer">
                        <div className="previousButton" onClick={() => previousQuestion()}>{'<'}</div>
                        <div className="questionInfo">
                            <div className="clock me-5"><i className="fa-regular fa-clock fa-2x me-2" style={{ color: "#f2e9e4" }}></i><span>{formatTime(minutes)}:{formatTime(seconds)}</span></div>
                            <div className="questionsLeft ms-5"><span>{currentQuestion + 1}/{quiz.question_groups[currentQuestionGroup].questions.length}</span><i className="ms-2 fa-solid fa-check fa-2x" style={{ color: "#f2e9e4" }}></i></div>
                        </div>
                        <div className="p-3 question">
                            <img src={quiz.question_groups[currentQuestionGroup].questions[currentQuestion].image} className="questionImage mb-2" /><br/>
                            <span className="questionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].text}</span>
                        </div>
                        <div className="nextButton" onClick={() => nextQuestion()}>{'>'}</div>
                    </div>
                    {/* <h1 onClick={() => console.log(playerAnswers)}>click to log</h1> */}

                    {!quiz.question_groups[currentQuestionGroup].questions[currentQuestion].is_open_answer &&
                        <div className="answerContainer">
                        {quiz.question_groups[currentQuestionGroup].questions[currentQuestion].answers.map((answer, index) => (
                          <div
                            key={index}
                            onClick={(e) => {
                              saveAnswers(
                                quiz.question_groups[currentQuestionGroup].questions[currentQuestion].id,
                                answer.id
                              ) && setPlayerAnswers({
                                ...playerAnswers,
                                [quiz.question_groups[currentQuestionGroup].questions[currentQuestion].id]: answer.id
                              });
                            }}
                            disabled={playerAnswers[quiz.question_groups[currentQuestionGroup].questions[currentQuestion].id] === answer.id}
                            className="answer"
                          >
                            <span className="answerOptionText">{answer.text}</span>
                          </div>
                        ))}
                      </div>}
                    {quiz.question_groups[currentQuestionGroup].questions[currentQuestion].is_open_answer &&
                        <label className="manualAnswer">
                            <p>{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].guidelines}</p>
                            <input onChange={(e) => saveOpenAnswers(quiz.question_groups[currentQuestionGroup].questions[currentQuestion].id, e.target.value) && setPlayerAnswers({ ...playerAnswers, [quiz.question_groups[currentQuestionGroup].questions[currentQuestion].id]: e.target.value })} value={playerAnswers[`${currentQuestionGroup}_${currentQuestion}`]} type="text"></input>
                        </label>}
                </div>}
            </div>
        </>
    );
}


export default GameView;