import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';

const QuestionCreator = () => {

    const [cardList, setCardList] = useState([]);
    const [quiz, setQuiz] = useState(false);


    const { id } = useParams()


    useEffect(() => {
        API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);

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
        const [selectedOptionOne, setSelectedOptionOne] = useState(true);

        return (
            <div className='questionCardContainer mb-3 glass'>

                <form className="questionForm">

                    <input value="option1" onClick={() => setSelectedOptionOne(true)} checked={selectedOptionOne} id={"multipleChoice" + cardList.length} name="questionType" type="radio" />
                    <label htmlFor={"multipleChoice" + cardList.length}>Multiple choice</label>
                    <input value="option2" onClick={() => setSelectedOptionOne(false)} checked={!selectedOptionOne} name="questionType" id={"openAnswer" + cardList.length} type="radio" />
                    <label htmlFor={"openAnswer" + cardList.length}>Open answer</label><br />
                    <input placeholder="Question" type="text"></input>
                    <div className="answersChoice" style={{ display: (selectedOptionOne) ? 'block' : 'none' }}>
                        <input placeholder="answer 1" type="text" />
                        <input placeholder="answer 2" type="text" /><br />
                        <input placeholder="answer 3" type="text" />
                        <input placeholder="answer 4" type="text" />
                    </div>
                    <div className="answersText" style={{ display: (!selectedOptionOne) ? 'block' : 'none' }}>
                        <input placeholder="Open answer.." disabled />
                    </div>
                    <button>Sumbit!!1</button>
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

                    <p>answer: {Answer.text}</p>
                )
                });
                return (
                    <div>
                        <h1>question: {Question.text}</h1>
                        <button>add new answer</button>
                        { Answers }
                    </div>
                )
        });

        return (
            <div className='questionCardContainer mb-3 glass'>

                <form className="questionForm">

                    {/* <input value="option1" onClick={() => setSelectedOptionOne(true)} checked={selectedOptionOne} id={"multipleChoice" + cardList.length} name="questionType" type="radio" />
                <label htmlFor={"multipleChoice" + cardList.length}>Multiple choice</label>
                <input value="option2" onClick={() => setSelectedOptionOne(false)} checked={!selectedOptionOne} name="questionType" id={"openAnswer" + cardList.length} type="radio" /> */}
                    {/* <label htmlFor={"openAnswer" + cardList.length}>Open answer</label><br /> */}
                    <input placeholder={QuestionGroup.title} type="text"></input>
                    <button onClick={() => storeNewQuestion(QuestionGroup.id)}>add new question</button>

                    {Questions}
                    {/* <div className="answersChoice"> 
                    <input placeholder={QuestionGroup.title} type="text" />
                    <input placeholder="answer 2" type="text" /><br />
                    <input placeholder="answer 3" type="text" />
                    <input placeholder="answer 4" type="text" />
                </div> */}
                    <div className="answersText">
                        <input placeholder="Open answer.." disabled/>
                    </div>
                    <button>Sumbit!!1</button>
                </form>
            </div>)
        });
    }

    return (
        <div className="content css-selector">

        <div className="instance-container questionPageContainer glass">
            {quiz.data && <div><h1>TITLE IS NAHUJ {quiz.data.title}</h1></div>}
            <button className="addGroupButton glass pt-2 pb-2" onClick={storeNewQuestionGroup}>Add question group +</button>
            {QuestionGroups}
            {cardList}
        </div>
    </div>
);
}

export default QuestionCreator;