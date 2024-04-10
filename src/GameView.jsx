import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';
import ConfirmationMessage from './ConfirmationMessage';
import Countdown from './Countdown';

const GameView = () => {
    const [quiz, setQuiz] = useState(false);
    const [quizInstance, setQuizInstance] = useState(false);

    const [ready, setReady] = useState(false);
    const [quizReady, setQuizReady] = useState(false);
    const [player, setPlayer] = useState({ playerName: '', playerPoints: 0, playerIsDisqualified: false, playerIsTiebreaker: false, questionedAt: null, answeredAt: null });
    const [playerActive, setPlayerActive] = useState(true)
    const [currentQuestionGroup, setCurrentQuestionGroup] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [playerAnswers, setPlayerAnswers] = useState({});
    const [doneCounting, setDoneCounting] = useState(false);
    const [tiebreakerQuestion, setTiebreakerQuestion] = useState(false);
    const [tiebreakerAnswer, setTiebreakerAnswer] = useState(false);
    //timer
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(1);
    const [isActive, setIsActive] = useState(false);


    const { id } = useParams()

    useEffect(() => {
        const playerId = localStorage.getItem("playerId");
        if (playerId != null) {
            API.get(`/players/${playerId}`).then((response) => {
                setReady(true);
                setIsWaiting(true);
                setPlayer({
                    id: response.data.data.id,
                    playerName: '',
                    playerPoints: 0,
                    playerIsDisqualified: false,
                    playerIsTiebreaker: false,
                    questionedAt: null,
                    answeredAt: null
                })
            }).catch((error) => {
                localStorage.removeItem("playerId");
            });
        }
    },[])

    useEffect(() => {
        API.get(`/quiz-instances/${id}`).then((response) => {
            setQuiz(response.data.data.quiz);
            setQuizInstance({
                id: response.data.data.id,
                isPublic: response.data.data.is_public,
                isActive: response.data.data.is_active,
                activeQuestionGroup: response.data.data.active_question_group,
                activeQuestionGroupStart: response.data.data.active_question_group_start,
                hasQuestionGroupEnded: response.data.data.has_question_group_ended
            })
        });

        
    }, [id]);

    useEffect(() => {
        if(quizReady && ready) {
            if (quizInstance.activeQuestionGroupStart) {
                const timeLeft = (Math.floor(currentQuestionGroup.answer_time) * 60000) - (new Date() - new Date(quizInstance.activeQuestionGroupStart))
                const minutes= Math.floor(timeLeft / 60000)
                const seconds = parseInt(((timeLeft % 60000) / 1000).toFixed(0))

                setMinutes(minutes);
                setSeconds(seconds);
            } else {
                setMinutes(Math.floor(currentQuestionGroup.answer_time));
            }
        }
    },[currentQuestionGroup?.answer_time, quizReady, ready, quizInstance])

    const savePlayer = async () => {
        await API.post(`/players`, { quiz_instance_id: id, name: player.playerName, points: player.playerPoints, is_disqualified: player.playerIsDisqualified }).then((response) => {
            localStorage.setItem("playerId", response.data.data.id);
            setReady(true);
            setIsWaiting(true);
            setPlayer({...player, id: response.data.data.id});
        }).catch((error) => {
            alert('Something went wrong.. check the console for more information.');
            console.log(error);
        });
    }

    const userFinishQuiz = (choice) => {
        setShowConfirmation(false);
        if (choice) {
            API.post(`/players/${player.id}/deactivate`);
            setPlayerActive(false);
            setIsActive(false);
            setIsWaiting(true);
            setCurrentQuestion(0);
            setDoneCounting(false)
        }
    }

    const fetchData = () => {
        setTimeout(() => {
            let waiting = true
            API.get(`/quiz-instances/${id}/poll-group/${player.id}`).then((response) => {
                if(response.data.status !== undefined) {
                    fetchData()
                    return ;
                }

                if(!player.playerIsDisqualified && response.data.is_disqualified) {
                    setPlayer(prevState => ({
                        ...prevState,
                        playerIsDisqualified: true
                    }));
                    console.log(123)
                    return ;
                }
                if(!player.playerIsTiebreaker && response.data.is_tiebreaking) {
                    setPlayer(prevState => ({
                        ...prevState,
                        playerIsTiebreaker: true
                    }));
                    console.log(1)
                    return ;
                }

                if(!player.playerIsTiebreaker && response.data.data.active_question_group.is_additional) {
                    fetchData()
                    console.log('Ha bļe')
                    return ;
                }

                // Tiebreaker round
                if(player.playerIsTiebreaker && response.data.data.active_question_group.is_additional &&
                    currentQuestionGroup?.id !== response.data.data.active_question_group.id) {
                    getRandomTiebreakerQuestion();
                    setCurrentQuestionGroup(response.data.data.active_question_group)
                    setIsWaiting(false)
                    setQuizReady(true)
                    waiting = false
                    console.log('beidzu pollingu')
                    return ;
                }

                // Normal round
                if(!player.playerIsTiebreaker && !response.data.data.active_question_group.is_additional &&
                currentQuestionGroup?.id !== response.data.data.active_question_group.id) {
                    setCurrentQuestionGroup(response.data.data.active_question_group)
                    setIsWaiting(false)
                    setQuizReady(true)
                    waiting = false
                    console.log('normāls raunds')
                    return ;
                }

                // Normal check to see if programmer is autistic
                if(player.playerIsTiebreaker && !response.data.data.active_question_group.is_additional) {
                    console.log('Tiebreaker status has not been reset by autist')
                }

                // if(!response.data.data?.active_question_group) {
                //     console.log('cav1')
                //     return ;
                // }
                // else if(response.data.data.active_question_group.id === currentQuestionGroup?.id) {
                //     console.log('cav')
                //     return ;
                // } else {
                //     // If the player is tiebreaking and the question group is not additional, continue
                //     // There is literally no use of this check, but I'm keeping it here
                //     if (player.playerIsTiebreaker && !response.data.data.active_question_group.is_additional) {
                //         console.log('Nav noņemts tie breaker status')
                //         return ;
                //     };
                //     // If the player is not tiebreaking and the question group is additional, continue
                //     if (!player.playerIsTiebreaker && response.data.data.active_question_group.is_additional) {
                //         console.log('Nav noņemts tie breaker status')
                //     } else {
                //         waiting = false
                //         setCurrentQuestionGroup(response.data.data.active_question_group)
                //         setIsWaiting(false)
                //         setQuizReady(true)
                //         console.log('Esmu elså')
                //     };
                // }
                console.log(waiting)
                if (isWaiting && waiting) {
                    console.log("skipots viss bļe")
                    fetchData()
                }
            });
        }, 1000)
    }

    useEffect(() => {
        // If there is a question group active, but player has already completed it, continue
        if (currentQuestionGroup != null) {
            if (playerActive) return
        }
        if (!ready) return;
        const pollingInterval = 1000; // 1 second in milliseconds
        // const pollInterval = setTimeout(() => {
        //     // BIJA POLLS
        //     fetchData()
        //     console.log(123)
        // }, pollingInterval);
        // return () => clearInterval(pollInterval);
        fetchData()
        console.log('Daunis', [currentQuestionGroup, ready, playerActive, player.playerIsDisqualified, player.playerIsTiebreaker, id, player.id, player.playerIsTiebreaker]);
    }, [currentQuestionGroup, ready, playerActive, player.playerIsDisqualified, id, player.id, player.playerIsTiebreaker, tiebreakerAnswer]);

    //
    // useEffect(() => {
    //     fetchData()
    // }, [player.id]);

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
        setIsActive(true);
		setDoneCounting(true);
        setIsWaiting(false);

        setPlayer(prevState => ({
            ...prevState,
            questionedAt: new Date().toISOString()
        }));

        if (player.playerIsTiebreaker) {
            setPlayer(prevState => ({
                ...prevState,
                questionedAt: new Date().toISOString()
            }));
        }
	}

    const Questions = useMemo(() => {
        const previousQuestion = () => {
            if (currentQuestion !== 0) {
                setCurrentQuestion(currentQuestion => currentQuestion - 1);
            }
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
        if (!currentQuestionGroup) return null;
        if (!isActive) return null;
        return currentQuestionGroup.questions.map(function (Question) {
			let Answers;
			if (!Question.is_open_answer) {
				Answers = Question.answers.map(function (Answer, answerIndex) {
					return (
						<button
							key={answerIndex}
                            disabled={playerAnswers[Question.id] === Answer.id}
							onClick={() => {
                                if(playerAnswers[Question.id] === Answer.id) return;
								saveAnswers(Question.id, Answer.id) && setPlayerAnswers({
								...playerAnswers,
								[Question.id]: Answer.id
								});
							}}
							className="answer"
							>
							<span className="answerOptionText">{Answer.text}</span>
						</button>
					)
				})
			} else if (Question.is_open_answer) {
                let tempAnswerArray = [{id: 0}]
                Answers = tempAnswerArray.map(function() {
                    return (
                        <label className="manualAnswer">
                            <p>{Question.guidelines}</p>
                            <input
                                onChange={(e) => {
                                    setPlayerAnswers({ ...playerAnswers, [Question.id]: e.target.value });
                                }}
                                onBlur={(e) => {
                                    saveOpenAnswers(Question.id, e.target.value);
                                }}
                                value={playerAnswers[Question.id] || ''}
                                type="text"
                            />
                        </label>
                    )
                })
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
							<img src={Question.image} className="questionImage mb-2" alt=''/><br/>
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
    }, [currentQuestionGroup, isActive, currentQuestion, player.id, minutes, seconds, playerAnswers]);

	const CurrentActiveQuestion = useMemo(() => {
		if (Questions === null) return false;
		if (currentQuestion === null) return false;
		return Questions[currentQuestion];
	}, [Questions, currentQuestion])

    const getRandomTiebreakerQuestion = async () => {
        await API.get(`/quiz-instances/${id}/get-random-tiebreaker-question`).then((response) => {
            setTiebreakerQuestion(() => {
                return response.data.data;
            });
        });
    }

    const TiebreakerQuestion = useMemo(() => {
        const saveTiebreakerAnswer = async (currentQuestionId, currentAnswerId) => {
            await API.post(`/answers/set-tiebreaker-answer`, {
                player_id: player.id,
                question_id: currentQuestionId,
                answer_id: currentAnswerId,
                questioned_at: player.questionedAt,
                answered_at: new Date().toISOString(),
            })
        }
        if (!tiebreakerQuestion) return null;
        let Answers = tiebreakerQuestion.answers.map(function (Answer, answerIndex) {
            return (
                <button
                    key={answerIndex}
                    onClick={() => {
                        setTiebreakerAnswer(Answer);
                        setShowConfirmation(true);
                        setIsWaiting(true);
                    }}
                    className="answer"
                >
                    <span className="answerOptionText">{Answer.text}</span>
                </button>
            )
        })
        return (
            <>
                <div className="questionContainer">
                    <div className="questionInfo">
                        <div className="questionsLeft ms-5"><span>1/1</span><i className="ms-2 fa-solid fa-check fa-2x" style={{ color: "#f2e9e4" }}></i></div>
                    </div>
                    <div className="p-3 tieBreakerQuestion">
                        <span className="questionText">{tiebreakerQuestion.text}</span>
                    </div>
                </div>
                <div className="answerContainer">
                    {Answers}
                </div>
            </>
        )
    }, [tiebreakerQuestion]);

    const userFinishTiebreakerQuiz = (choice) => {
        setShowConfirmation(false);
        if (choice) {
            // Set answeredAt timestamp
            setPlayer(prevState => ({
                ...prevState,
                answeredAt: new Date().toISOString()
            }));
            API.post(`/answers/set-tiebreaker-answer`, {
                player_id: player.id,
                question_id: tiebreakerQuestion.id,
                answer_id: tiebreakerAnswer.id,
                questioned_at: player.questionedAt,
                answered_at: new Date().toISOString(),
            });
            setIsActive(false);
            setIsWaiting(true);
            setCurrentQuestion(0);
            setDoneCounting(false)
            setPlayerActive(false);
        }
    }

    return (
        <>
            <div className="gameViewContainer">
            {player.playerIsDisqualified && <div className='disqualified p-2'>Komanda diskvalificēta</div>}
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
                        <h1 className="title">{quiz.title}</h1>
                        <h2 className="title mt-3" style={{ fontSize: "20pt" }}>Lūdzu, ievadiet komandas nosaukumu:</h2>
                        <input disabled={(ready)} onChange={(e) =>
                            setPlayer({ ...player, playerName: e.target.value })} value={player.playerName}
                            placeholder="Komandas nosaukums" className="mt-4 playerNameInput" type="text" /><br />
                        <button onClick={() => savePlayer()} disabled={(ready)} className="readyButton readyButtonAnimation p-2 ps-4 pe-4 mt-5 mb-4">Esmu gatavs spēlēt!</button> <br />
                       
                    </div>
                </div>}

                {isWaiting && <div className="waiting glass">
                    <div className="waitingContainer">
                        <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                        <h5 className="title" style={{ fontSize: "20pt" }}>Lūdzu, gaidiet spēles turpinājumu!</h5>
                    </div>
                </div>}

                {(
                    (quizReady && ready && quiz && !isWaiting && currentQuestionGroup.is_additional && player.playerIsTiebreaker) ||
                    (quizReady && ready && quiz && !isWaiting && !currentQuestionGroup.is_additional && !player.playerIsTiebreaker)
                ) && <Countdown done={finishCountdown}/>}

                {quizReady && ready && quiz && !isWaiting && doneCounting && !currentQuestionGroup.is_additional &&
                    <div className="content gameView">
                    {showConfirmation && <ConfirmationMessage message="Iesniegt atbildes?" onConfirm={userFinishQuiz} />}
                    {Questions && CurrentActiveQuestion}
                    </div>
                }
                
                {quizReady && ready && quiz && !isWaiting && doneCounting && player.playerIsTiebreaker && !player.playerIsDisqualified &&
                    <div className="content gameView">
                        {showConfirmation &&
                            <ConfirmationMessage message="Iesniegt atbildes?" onConfirm={userFinishTiebreakerQuiz}/>}
                        {TiebreakerQuestion}
                    </div>
                }
            </div>
        </>
    );
}


export default GameView;