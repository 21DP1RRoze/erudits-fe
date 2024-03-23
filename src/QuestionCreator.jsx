import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';

const QuestionCreator = () => {

    const [cardList, setCardList] = useState([]);
    const [quiz, setQuiz] = useState(false);
    const [selectedOptionOne, setSelectedOptionOne] = useState(true);

    const [questionGroupState, setQuestionGroupState] = useState([]);
    // const [questionsState, setQuestionsState] = useState([]);
    // const [answersState, setAnswersState] = useState([]);



    const { id } = useParams()


    useEffect(() => {
        API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
            setQuestionGroupState(response.data.data.question_groups);
        });
        
    }, []);

    const storeNewQuestionGroup = async () => {
        await API.post('/question-groups', {
            quiz_id: id,
        });
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }

    const deleteQuestionGroup = async (questionGroupId) => {
        await API.destroy(`/question-groups/${questionGroupId}`);
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }

    const storeNewQuestion = async (questionGroupId) => {
        await API.post('/question', {
            question_group_id: questionGroupId,
        });
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }

    const deleteQuestion = async (questionId) => {
        await API.delete(`/question/${questionId}`);
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }

    const storeNewAnswer = async (questionId) => {
        await API.post('/answer', {
            question_id: questionId,
        });
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }

    const deleteAnswer = async (answerId) => {
        await API.delete(`/answer/${answerId}`);
        await API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
        });
    }


    const QuestionCard = () => {

        return (
            <div className='questionCardContainer p-3 mb-3 glass'>

                    <form className="questionForm">

                        <label className="me-5 checkContainer" htmlFor={"multipleChoice" + cardList.length}>
                            <input className="me-1" value="option1" onClick={() => setSelectedOptionOne(true)} checked={selectedOptionOne} id={"multipleChoice" + cardList.length} name="questionType" type="radio" />
                            <span>Multiple choice</span></label>
                        <label className="checkContainer" htmlFor={"openAnswer" + cardList.length}>
                            <input className="me-1" value="option2" onClick={() => setSelectedOptionOne(false)} checked={!selectedOptionOne} name="questionType" id={"openAnswer" + cardList.length} type="radio" />
                            <span>Open answer</span>
                        </label><br />
                        <input className="questionBox mt-3 p-2 mb-2" placeholder="Question..." type="text"></input>
                        <br/>
                        <label for="imageUpload" className="p-1 ps-2 pe-2 label-imageUpload">Upload image</label><br/>
                        <input id="imageUpload" accept="image/*"className="mt-1 imageUpload" type="file"/>
                        <div className="answerContainer mt-3" style={{ display: (selectedOptionOne) ? 'grid' : 'none' }}>
                            {/* answer windows with is correct? checkmark */}
                            <div className="answerOne">
                                <label className="checkContainer" htmlFor={"correctAnswerRadio1" + cardList.length}>
                                    <span>is correct?</span>
                                    <input className="ms-2 me-2 correctAnswerRadio" id={"correctAnswerRadio1" + cardList.length} type="radio" name="correctAnswer"  />
                                </label>
                                <br/>
                                <textarea className="answerText me-3 mb-3" placeholder="answer 1" type="text" />
                            </div>
                            <div className="answerTwo">
                                <label className="checkContainer" htmlFor={"correctAnswerRadio2" + cardList.length}>
                                    <input className="ms-2 me-2 correctAnswerRadio" id={"correctAnswerRadio2" + cardList.length} type="radio" name="correctAnswer" />
                                    <span>is correct?</span>
                                </label>
                                <br/>
                                <textarea className="answerText mb-3" placeholder="answer 2" type="text" />

                            </div>
                            <div className="answerThree">
                                <label className="checkContainer" htmlFor={"correctAnswerRadio3" + cardList.length}>
                                    <span>is correct?</span>
                                    <input className="ms-2 me-2 correctAnswerRadio" id={"correctAnswerRadio3" + cardList.length} type="radio" name="correctAnswer" />
                                </label><br/>
                                <textarea className="answerText me-3" placeholder="answer 3" type="text" />

                            </div>
                            <div className="answerFour">
                                <label className="checkContainer" htmlFor={"correctAnswerRadio4" + cardList.length}>
                                    <input className="ms-2 me-2 correctAnswerRadio" id={"correctAnswerRadio4" + cardList.length} type="radio" name="correctAnswer" />
                                    <span>is correct?</span>
                                </label><br/>
                                <textarea className="answerText" placeholder="answer 4" type="text" />

                            </div>


                        </div>
                        <div className="answersText mt-3" style={{ display: (!selectedOptionOne) ? 'block' : 'none' }}>
                            The player will write their answer.
                        </div>
                        <button className='formButton mt-3'>Submit</button>
                    </form>
                </div>
        );
    }

    const onAddBtnClick = () => {
        setCardList(cardList.concat(<QuestionCard key={cardList.length} />))
    }
    let QuestionGroups;
    if (quiz) {
        QuestionGroups = quiz.data.question_groups.map(function (QuestionGroup) {
            let Questions;
            Questions = QuestionGroup.questions.map(function (Question) {
                let Answers;
                Answers = Question.answers.map(function (Answer) {
                    return (

                       
                        <div className="answerOne">
                                <label className="checkContainer" htmlFor={"correctAnswerRadio1" + cardList.length}>
                                    <span>is correct?</span>
                                    <input className="ms-2 me-2 correctAnswerRadio" id={"correctAnswerRadio1" + cardList.length} type="radio" name="correctAnswer"  />
                                </label>
                                <br/>
                                <textarea className="answerText me-3 mb-3" placeholder={Answer.text} type="text" />
                            </div>
                    )
                });
                return (
                    <div>
                         <label className="me-5 checkContainer" htmlFor={"multipleChoice" + cardList.length}>
                            <input className="me-1" value="option1" onClick={() => setSelectedOptionOne(true)} checked={selectedOptionOne} id={"multipleChoice" + cardList.length} name="questionType" type="radio" />
                            <span>Multiple choice</span></label>
                        <label className="checkContainer" htmlFor={"openAnswer" + cardList.length}>
                            <input className="me-1" value="option2" onClick={() => setSelectedOptionOne(false)} checked={!selectedOptionOne} name="questionType" id={"openAnswer" + cardList.length} type="radio" />
                            <span>Open answer</span>
                        </label><br />

                        <input className="questionBox mt-3 p-2 mb-2" placeholder={Question.text} type="text"></input><br/>
                        <label for="imageUpload" className="p-1 ps-2 pe-2 formButton">Upload image</label><br/>
                        <input id="imageUpload" accept="image/*"className="mt-1 imageUpload" type="file"/>
                       
                        <div className="answerContainer mt-3" style={{ display: (selectedOptionOne) ? 'grid' : 'none' }}>
                        {Answers}
                        </div>
                        <hr/>
                    </div>
                )
            });

            return (
                <div className='questionCardContainer mb-3 glass'>

                    <form className="questionForm">

                        {Questions}
                       <button className='p-1 ps-2 pe-2 glass formButton mb-3'>Add question +</button>
                    </form>
                </div>)
        });
    }

    return (
        <div className="content css-selector">

            <div className="instance-container questionPageContainer glass">
                {quiz.data && <div><h1>TITLE IS {quiz.data.title}</h1></div>}
                <h1 onClick={() => console.log(questionGroupState[0].questions[0].text)}>click to log</h1>

                <button className="addGroupButton glass pt-2 pb-2" onClick={onAddBtnClick}>Add question group +</button>


                {QuestionGroups}
                {cardList}
                
            </div>



        </div>
    );
}

export default QuestionCreator;