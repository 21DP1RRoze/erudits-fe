const GameView = () => {
    return (
        <div className="content gameView">
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
                <div className="answer answer1"><span className="answerNumber">1</span><span className="answerText">This is an answer.</span></div>
                <div className="answer answer2"><span className="answerNumber">2</span><span className="answerText">This is an answer.</span></div>
                <div className="answer answer3"><span className="answerNumber">3</span><span className="answerText">This is an answer.</span></div>
                <div className="answer answer4"><span className="answerNumber">4</span><span className="answerText">This is an answer.</span></div>


            </div>
        </div>
    );
}


export default GameView;