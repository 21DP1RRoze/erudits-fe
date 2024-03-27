import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from './axiosApi';

const QuestionCreator = () => {

    const [quiz, setQuiz] = useState(false);

    const [questionGroupState, setQuestionGroupState] = useState([]);

    const { id } = useParams()

    useEffect(() => {
        API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
            setQuestionGroupState(response.data.data);
        });

    }, [id]);

    const storeNewQuestionGroup = async () => {
        await API.post('/question-groups', {
            quiz_id: id,
        }).then((response) => {
            setQuiz(prevQuiz => {
                const updatedQuizData = {
                    ...prevQuiz.data,
                    question_groups: [
                        ...prevQuiz.data.question_groups,
                        response.data.data
                    ]
                };

                return { ...prevQuiz, data: updatedQuizData };
            });
            setQuestionGroupState(prevState => {
                const updatedQuestionGroups = [
                    ...prevState.question_groups,
                    response.data.data
                ];

                return { ...prevState, question_groups: updatedQuestionGroups };
            });
        });
    }

    const deleteQuestionGroup = async (questionGroupId) => {
        await API.delete(`/question-groups/${questionGroupId}`).then(() => {
            setQuiz(prevQuiz => {
                const updatedQuizData = {
                    ...prevQuiz.data,
                    question_groups: prevQuiz.data.question_groups.filter(group => group.id !== questionGroupId) // Remove deleted group
                };

                return { ...prevQuiz, data: updatedQuizData };
            });

            setQuestionGroupState(prevState => {
                const updatedQuestionGroups = prevState.question_groups.filter(group => group.id !== questionGroupId); // Remove deleted group

                return { ...prevState, question_groups: updatedQuestionGroups };
            });
        });
    }

    const storeNewQuestion = async (questionGroupId) => {
        await API.post('/questions', {
            question_group_id: questionGroupId,
        }).then((response) => {
            const newQuestion = response.data.data;

            setQuiz(prevQuiz => {
                const updatedQuizData = {
                    ...prevQuiz.data, // Copy existing quiz data
                    question_groups: prevQuiz.data.question_groups.map(group => {
                        if (group.id === questionGroupId) { // Check if this is the group to update
                            return {
                                ...group, // Copy existing question group data
                                questions: [...group.questions, newQuestion] // Add new question
                            };
                        }
                        return group; // Return unmodified for other groups
                    })
                };

                return { ...prevQuiz, data: updatedQuizData }; // Return the updated quiz object
            });
            setQuestionGroupState(prevState => {
                const updatedQuestionGroups = prevState.question_groups.map(group => {
                    if (group.id === questionGroupId) {
                        return {
                            ...group,
                            questions: [...group.questions, newQuestion]
                        };
                    }
                    return group;
                });
                return { ...prevState, question_groups: updatedQuestionGroups };
            });
        });
    }

    const deleteQuestion = async (questionId, questionGroupId) => {
        await API.delete(`/questions/${questionId}`).then(() => {
            setQuiz(prevQuiz => {
                const updatedQuizData = {
                    ...prevQuiz.data, // Copy existing quiz data
                    question_groups: prevQuiz.data.question_groups.map(group => {
                        if (group.id === questionGroupId) { // Check if this is the group to update
                            return {
                                ...group, // Copy existing question group data
                                questions: group.questions.filter(question => question.id !== questionId) // Remove deleted question
                            };
                        }
                        return group; // Return unmodified for other groups
                    })
                };

                return { ...prevQuiz, data: updatedQuizData }; // Return the updated quiz object
            });
            setQuestionGroupState(prevState => {
                const updatedQuestionGroups = prevState.question_groups.map(group => {
                    if (group.id === questionGroupId) {
                        return {
                            ...group,
                            questions: group.questions.filter(question => question.id !== questionId) // Remove deleted question
                        };
                    }
                    return group;
                });
                return { ...prevState, question_groups: updatedQuestionGroups };
            });
        });

    }

    const saveQuiz = async () => {
        await API.post(`/quizzes/${id}/save`, questionGroupState).then(() => {
            alert('Quiz successfully saved!');
        }).catch((error) => {
            alert('Something went wrong.. check the console for more information.');
            console.log(error);
        });
    }



    const QuestionGroups = useMemo(() => {


        if (!quiz) return null;
        return quiz.data.question_groups.map(function (QuestionGroup, groupIndex) {
            let Questions;
            Questions = QuestionGroup.questions.map(function (Question, questionIndex) {
                let Answers;
                Answers = Question.answers.map(function (Answer, answerIndex) {
                    const answerId = `answer_${groupIndex}_${questionIndex}_${answerIndex}`;
                    return (
                        <div key={answerId} className="answerOne">
                            <label className="checkContainer" htmlFor={"correctAnswerRadio1" + answerId}>
                                <span>is correct?</span>
                                <input className="ms-2 me-2 required correctAnswerRadio" id={"correctAnswerRadio1" + answerId} type="radio" name={`correctAnswer_${groupIndex}_${questionIndex}`} />
                            </label>
                            <br />
                            <textarea
                                placeholder="Answer Text" className="answerText me-3 mb-3" value={Answer.text}
                                onChange={(event) => {
                                    const newText = event.target.value;
                                    setQuestionGroupState(prevState => {
                                        prevState.question_groups[groupIndex].questions[questionIndex].answers[answerIndex].text = newText;
                                        return { ...prevState }; // Return a new object to trigger re-render
                                    });
                                }} />
                        </div>
                    )
                });
                const questionId = `question_${groupIndex}_${questionIndex}`;
                return (
                    <div key={questionId}>
                        <label className="me-5 checkContainer" htmlFor={"multipleChoice" + questionId}>
                            <input checked={!Question.is_open_answer} className="me-1" id={"multipleChoice" + questionId} name={"questionType" + questionId} type="radio"
                                onChange={(event) => {
                                    let newBool = !event.target.checked;
                                    setQuestionGroupState(prevState => {
                                        prevState.question_groups[groupIndex].questions[questionIndex].is_open_answer = newBool;
                                        return { ...prevState }; // Return a new object to trigger re-render
                                    });
                                }} />
                            <span>Multiple choice</span></label>
                        <label className="checkContainer" htmlFor={"openAnswer" + questionId}>
                            <input checked={Question.is_open_answer} className="me-1" name={"questionType" + questionId} id={"openAnswer" + questionId} type="radio"
                                onChange={(event) => {
                                    let newBool = event.target.checked;
                                    setQuestionGroupState(prevState => {
                                        prevState.question_groups[groupIndex].questions[questionIndex].is_open_answer = newBool;
                                        return { ...prevState }; // Return a new object to trigger re-render
                                    });
                                }} />
                            <span>Open answer</span>
                        </label><br />

                        <input className="questionBox mt-3 p-2 mb-2" placeholder="Question" value={Question.text}
                            onChange={(event) => {
                                const newText = event.target.value;
                                setQuestionGroupState(prevState => {
                                    prevState.question_groups[groupIndex].questions[questionIndex].text = newText;
                                    return { ...prevState }; // Return a new object to trigger re-render
                                });
                            }} type="text"></input><br />
                        <label htmlFor="imageUpload" className="p-1 ps-2 pe-2 formButton">Upload image</label><br />
                        <input id="imageUpload" accept="image/*" className="mt-1 imageUpload" type="file" />

                        <div className="answerContainer mt-3" style={{ display: (!Question.is_open_answer) ? 'grid' : 'none' }}>
                            {Answers}
                        </div>
                        <div className="answersText mt-3" style={{ display: (Question.is_open_answer) ? 'block' : 'none' }}>
                            The player will write their answer.
                        </div>
                        <i onClick={() => deleteQuestion(Question.id, QuestionGroup.id)} className='p-2 deleteQuestionButton fa-regular fa-trash-can'></i>

                        <hr />
                    </div>
                )
            });
            const questionGroupId = `questionGroup_${groupIndex}`;
            
            return (
                <>
                    <div key={questionGroupId} id={"questionGroup" + questionGroupId} className='questionCardContainer mb-3 glass'>

                        <form className="questionForm">
                            <div className="pt-4 pb-4 mb-2 glass questionGroupInfo" style={{ background: 'none' }}>
                                <i onClick={() => deleteQuestionGroup(QuestionGroup.id)} className='p-2 deleteButton fa-regular fa-trash-can'></i>

                                <input className="questionGroupTitle" type="text" placeholder="Question Group Title" value={QuestionGroup.title}
                                    onChange={(event) => {
                                        const newText = event.target.value;
                                        setQuestionGroupState(prevState => {
                                            prevState.question_groups[groupIndex].title = newText;
                                            return { ...prevState }; // Return a new object to trigger re-render
                                        });
                                    }} />
                            </div>
                            {Questions}
                            <button className='p-1 ps-2 pe-2 glass formButton mb-3' onClick={(event) => { event.preventDefault(); storeNewQuestion(QuestionGroup.id) }}>Add question +</button>
                        </form>
                    </div>

                </>
            )
        });
    }, [quiz, questionGroupState]);

    return (
        <div className="content css-selector">

            {quiz.data && <div className="instance-container questionPageContainer glass">
                <div className="quizInfo glass questionGroupInfo pt-4 pb-4 mb-2">
                    <input placeholder="Quiz Title" className="quizTitle questionGroupTitle"
                        value={questionGroupState.title}
                        onChange={(event) => {
                            const newText = event.target.value;
                            setQuestionGroupState(() => {
                                questionGroupState.title = newText;
                                return { ...questionGroupState }; // Return a new object to trigger re-render
                            });
                        }} />
                </div>
                {/* <h1 onClick={() => console.log(questionGroupState)}>click to log</h1> */}


                {QuestionGroups}
                <button className="addGroupButton glass pt-2 pb-2" onClick={storeNewQuestionGroup}>Add question group
                    +
                </button>
                <button className="addGroupButton glass pt-2 pb-2 mt-2" onClick={saveQuiz}>Submit</button>

            </div>}

            


        </div>
    );
}

export default QuestionCreator;