import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';

const GameView = () => {
    const [quiz, setQuiz] = useState(false);

    const [questionGroupState, setQuestionGroupState] = useState([]);
    const [ready, setReady] = useState(false);
    const [quizReady, setQuizReady] = useState(false);

    const { id } = useParams()

    useEffect(() => {
        API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
            setQuestionGroupState(response.data.data);
        });

    }, [id]);



    return (
        <div className="gameViewContainer">
            {!quizReady && <div className="playerName glass">
                <div className="playerNameContainer">
                <h1 className="title">Jūs pievienojāties viktorīnai "null"</h1>
                <h2 className="title mt-3" style={{fontSize: "20pt"}}>Lūdzu, ievadiet komandas nosaukumu:</h2>
                <input placeholder="Komandas nosaukums" className="mt-4 playerNameInput"type="text"/><br/>
                <button onClick={() => setReady(true)} disabled={(ready) ? true : false} className="readyButton readyButtonAnimation p-2 ps-4 pe-4 mt-5 mb-4">Esmu gatavs spēlēt!</button> <br/>
                {/* spinner */}
                {ready && <div>
                <div class="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
                <h5 className="title" style={{fontSize: "15pt"}}>Lūdzu, gaidiet spēles sākumu!</h5>
                </div>}
                </div>
            </div>}

            
            {quizReady && <div className="content gameView">

                <div className="questionContainer">
                    <div className="previousButton">{'<'}</div>
                    <div className="questionInfo">
                        <div className="clock me-5"><i className="fa-regular fa-clock fa-2x me-2" style={{ color: "#f2e9e4" }}></i><span>9:59</span></div>
                        <div className="questionsLeft ms-5"><span>1/10</span><i className="ms-2 fa-solid fa-check fa-2x" style={{ color: "#f2e9e4" }}></i></div>
                    </div>
                    <span className="questionText">This is a question.</span>
                    <div className="nextButton">{'>'}</div>
                </div>
                <div className="answerContainer">
                    <div className="answer answer1"><span className="answerNumber">1</span><span className="answerOptionText">This is an answer.</span></div>
                    <div className="answer answer2"><span className="answerNumber">2</span><span className="answerOptionText">This is an answer.</span></div>
                    <div className="answer answer3"><span className="answerNumber">3</span><span className="answerOptionText">This is an answer.</span></div>
                    <div className="answer answer4"><span className="answerNumber">4</span><span className="answerOptionText">This is an answer.</span></div>


                </div>
            </div>}
        </div>
    );
}


export default GameView;