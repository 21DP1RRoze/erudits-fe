import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';
import AdminView from './AdminView';
import ConfirmationMessage from './ConfirmationMessage';

const GameView = () => {
    const [quiz, setQuiz] = useState(false);

    const [questionGroupState, setQuestionGroupState] = useState([]);
    const [ready, setReady] = useState(false);
    const [quizReady, setQuizReady] = useState(true);
    const [player, setPlayer] = useState({playerName: '', playerPoints: 0, playerIsDisqualified: false});
    const [loggedIn, setLoggedIn] = useState(false);
    const [adminView, setAdminView] = useState(false);
    const [currentQuestionGroup, setCurrentQuestionGroup] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [playerAnswers, setPlayerAnswers] = useState({});

    const { id } = useParams()

    useEffect(() => {
        API.get('/user').then(async (response) => {
            setLoggedIn(true);
        }).catch(() => {
            setLoggedIn(false);
        })
        API.get(`/quiz-instances/${id}`).then((response) => {
            setQuiz(response.data.data.quiz);
            setQuestionGroupState(response.data.data.quiz);
        });
        

    }, [id]);

    const savePlayer = async () => {
        await API.post(`/players`, {quiz_instance_id: id, name: player.playerName, points: player.playerPoints, is_disqualified: player.playerIsDisqualified}).then(() => {
            setReady(true)
        }).catch((error) => {
            alert('Something went wrong.. check the console for more information.');
            console.log(error);
        });
    }

    const nextQuestion = () => {
        if(quiz.question_groups[currentQuestionGroup].questions.length-1 === currentQuestion) {
            setShowConfirmation(true)
        } else {
            setCurrentQuestion(currentQuestion+1);
        }
    }
    
    const userFinishQuiz = (choice) => {
        setShowConfirmation(false);
        if(choice) {
            setIsWaiting(true);
        }
    } 

    const previousQuestion = () => {
        if (currentQuestion != 0) {
            setCurrentQuestion(currentQuestion-1);
        }
    }
    

    
    return (
        <>
        {adminView && <AdminView instanceId = {id}/>}
        {!adminView && <div className="gameViewContainer">
            
            {!ready && <div className="playerName glass">
                {loggedIn && <div onClick={() => setAdminView(true)} className="homeButton"><i className="fa-solid fa-gear fa-2x p-3"></i></div>}
                <div className="playerNameContainer">
                    <h1 className="title">Jūs pievienojāties viktorīnai '{questionGroupState.title}'</h1>
                    <h2 className="title mt-3" style={{ fontSize: "20pt" }}>Lūdzu, ievadiet komandas nosaukumu:</h2>
                    <input disabled={(ready) ? true : false} onChange={(e) => 
                        setPlayer({...player, playerName: e.target.value})} value={player.playerName} 
                        placeholder="Komandas nosaukums" className="mt-4 playerNameInput" type="text" /><br />
                    <button onClick={() => savePlayer()} disabled={(ready) ? true : false} className="readyButton readyButtonAnimation p-2 ps-4 pe-4 mt-5 mb-4">Esmu gatavs spēlēt!</button> <br />
                    {/* spinner */}
                    {ready && <div>
                        <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                        <h5 className="title" style={{ fontSize: "15pt" }}>Lūdzu, gaidiet spēles sākumu!</h5>
                    </div>}
                </div>
            </div>}

            {isWaiting && <div className="playerName glass">
                <div className="playerNameContainer">
                        <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                        <h5 className="title" style={{ fontSize: "20pt" }}>Lūdzu, gaidiet spēles turpinājumu!</h5>
                </div>
            </div>}

            {quizReady && ready && quiz && !isWaiting && <div className="content gameView">
                {/* <h1 onClick={() => console.log(playerAnswers)}>click to log</h1> */}
                {showConfirmation && <ConfirmationMessage message="Iesniegt atbildes?" onConfirm={userFinishQuiz}/>}

                <div className="questionContainer">
                    <div className="previousButton" onClick={() => previousQuestion()}>{'<'}</div>
                    <div className="questionInfo">
                        <div className="clock me-5"><i className="fa-regular fa-clock fa-2x me-2" style={{ color: "#f2e9e4" }}></i><span></span></div>
                        <div className="questionsLeft ms-5"><span>{currentQuestion+1}/{quiz.question_groups[currentQuestionGroup].questions.length}</span><i className="ms-2 fa-solid fa-check fa-2x" style={{ color: "#f2e9e4" }}></i></div>
                    </div>
                    <div className="question">
                        <span className="questionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].text}</span>
                    </div>
                    <div className="nextButton" onClick={() => nextQuestion()}>{'>'}</div>
                </div>
                <div className="answerContainer">
                    <div onClick={(e) => setPlayerAnswers({...playerAnswers, [`${currentQuestionGroup}_${currentQuestion}`] : 0})} value={0} disabled={playerAnswers[`${currentQuestionGroup}_${currentQuestion}`] === 0} className="answer answer1"><span className="answerOptionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].answers[0].text}</span></div>
                    <div onClick={(e) => setPlayerAnswers({...playerAnswers, [`${currentQuestionGroup}_${currentQuestion}`] : 1})} value={1} disabled={playerAnswers[`${currentQuestionGroup}_${currentQuestion}`] === 1} className="answer answer2"><span className="answerOptionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].answers[1].text}</span></div>
                    <div onClick={(e) => setPlayerAnswers({...playerAnswers, [`${currentQuestionGroup}_${currentQuestion}`] : 2})} value={2} disabled={playerAnswers[`${currentQuestionGroup}_${currentQuestion}`] === 2} className="answer answer3"><span className="answerOptionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].answers[2].text}</span></div>
                    <div onClick={(e) => setPlayerAnswers({...playerAnswers, [`${currentQuestionGroup}_${currentQuestion}`] : 3})} value={3} disabled={playerAnswers[`${currentQuestionGroup}_${currentQuestion}`] === 3} className="answer answer4"><span className="answerOptionText">{quiz.question_groups[currentQuestionGroup].questions[currentQuestion].answers[3].text}</span></div>

                </div>
            </div>}
        </div>}
        </>
    );
}


export default GameView;