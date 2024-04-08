import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './axiosApi';
import ConfirmationMessage from './ConfirmationMessage';

const QuestionCreator = () => {

    const [quiz, setQuiz] = useState(false);

    const [questionGroupState, setQuestionGroupState] = useState([]);

    const [showConfirmationQuestion, setShowConfirmationQuestion] = useState(false);
    const [showConfirmationGroup, setShowConfirmationGroup] = useState(false);

    const [idToDelete, setIdToDelete] = useState({ groupID: null, questionID: null });

    const [hasTiebreaker, setHasTiebreaker] = useState(false);

    const navigate = useNavigate();

    const { id } = useParams()

    useEffect(() => {
        API.get(`/quizzes/${id}`).then((response) => {
            setQuiz(response.data);
            setQuestionGroupState(response.data.data);
        });

    }, [id]);

    const storeNewQuestionGroup = async (additional) => {
        await API.post('/question-groups', {
            quiz_id: id,
            is_additional: additional,
            title: (additional ? "TIEBREAKER" : "")
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

    const deleteQuestionGroup = async (choice, questionGroupId) => {
        setShowConfirmationGroup(false);
        if (choice) {
            (quiz.data.question_groups.id === [questionGroupId].is_additional) ? setHasTiebreaker(false) : setHasTiebreaker(true); // so only one tiebreaker question group can exist at a time
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

    const deleteQuestion = async (choice, questionGroupId, questionId) => {
        setShowConfirmationQuestion(false);
        if (choice) {
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
            //set defaults so there isnt a null
            QuestionGroup.answer_time = QuestionGroup.answer_time || 1;
            QuestionGroup.disqualify_amount = QuestionGroup.disqualify_amount || 0;
            QuestionGroup.points = QuestionGroup.points || 1;
            Questions = QuestionGroup.questions.map(function (Question, questionIndex) {
                let Answers;
                Answers = Question.answers.map(function (Answer, answerIndex) {
                    const answerId = `answer_${groupIndex}_${questionIndex}_${answerIndex}`;
                    return (
                        <div key={answerId} className="answerOne">
                            <label className="checkContainer" htmlFor={`correctAnswer_${groupIndex}_${questionIndex}_${answerId}`}>
                                <span>is correct?</span>
                                <input
                                    onChange={(event) => {
                                        const newChecked = event.target.checked;
                                        setQuestionGroupState(prevState => {
                                            const updatedState = { ...prevState };
                                            updatedState.question_groups[groupIndex].questions[questionIndex].answers.forEach((answer, idx) => {
                                                answer.is_correct = idx === answerIndex && newChecked; //i don't even know but it works
                                            });
                                            return updatedState;
                                        });
                                    }}
                                    checked={Answer.is_correct} className="ms-2 me-2 correctAnswerRadio" id={`correctAnswer_${groupIndex}_${questionIndex}_${answerId}`} type="radio" name={`correctAnswer_${groupIndex}_${questionIndex}`} />
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
                        <form>
                            {/* Display the uploaded image */}
                            {Question.image && (
                                <img src={Question.image} />
                            )}

                            {/* Label for the file input */}
                            <label htmlFor="imageUpload" className="p-1 ps-2 pe-2 formButton">
                                Upload image
                            </label>
                            <br />

                            {/* File input */}
                            <input
                                onChange={(e) => {
                                    const newImage = e.target.files[0].name;
                                        setQuestionGroupState((prevState) => {
                                            prevState.question_groups[groupIndex].questions[
                                                questionIndex
                                            ].image = "/images/"+newImage;
                                            return { ...prevState }; // Return a new object to trigger re-render
                                        });
                                    
                                }}
                                id="imageUpload"
                                accept="image/*"
                                className="mt-1 imageUpload"
                                type="file"
                            />
                        </form>


                        <div className="answerContainer mt-3" style={{ display: (!Question.is_open_answer) ? 'grid' : 'none' }}>
                            {Answers}
                        </div>
                        <div className="answersText mt-4" style={{ display: (Question.is_open_answer) ? 'block' : 'none' }}>
                            <input onChange={(event) => {
                                const newText = event.target.value;
                                setQuestionGroupState(prevState => {
                                    prevState.question_groups[groupIndex].questions[questionIndex].guidelines = newText;
                                    return { ...prevState }; // Return a new object to trigger re-render
                                });
                            }} value={Question.guidelines} className="inputGuideLines mb-3" type="text" placeholder='Input guidelines for the player'></input><br />
                            The player will write their answer.
                        </div>
                        <i onClick={() => (setIdToDelete({ groupID: QuestionGroup.id, questionID: Question.id })) || setShowConfirmationQuestion(true)} className='p-2 deleteQuestionButton fa-regular fa-trash-can'></i>
                        <hr />
                    </div>
                )
            });
            const questionGroupId = `questionGroup_${groupIndex}`;
            if (QuestionGroup.is_additional) {
                setHasTiebreaker(true);
            }

            return (


                <>
                    <div key={questionGroupId} id={"questionGroup" + questionGroupId} className='questionCardContainer mb-3 glass'>

                        <form className="questionForm">

                            <div className="pt-4 pb-4 mb-2 glass questionGroupInfo mb-3" style={{ background: (QuestionGroup.is_additional ? '#fff7d1' : 'none') }}>
                                <div className="groupDetails">
                                    <div className="quizTime"
                                    ><i className="fa-regular fa-clock fa-2x me-2"></i>
                                        <select onChange={(event) => {
                                            const newTime = parseInt(event.target.value);
                                            setQuestionGroupState(prevState => {
                                                prevState.question_groups[groupIndex].answer_time = newTime;
                                                return { ...prevState }; // Return a new object to trigger re-render
                                            });
                                        }} value={questionGroupState.question_groups[groupIndex].answer_time} className="timeSelect dropDown" name="time">
                                            <option value={1}>01:00</option>
                                            <option value={5}>05:00</option>
                                            <option value={10}>10:00</option>
                                            <option value={15}>15:00</option>
                                            <option value={20}>20:00</option>
                                        </select>
                                    </div>
                                    <div className="playerDisqualifications">
                                        <i className="fa-solid fa-user-large-slash me-2" style={{ fontSize: "22pt" }}></i>
                                        <select onChange={(event) => {
                                            const newDisq = parseInt(event.target.value);
                                            setQuestionGroupState(prevState => {
                                                prevState.question_groups[groupIndex].disqualify_amount = newDisq;
                                                return { ...prevState }; // Return a new object to trigger re-render
                                            });
                                        }} value={questionGroupState.question_groups[groupIndex].disqualify_amount} className="disqualificationSelect dropDown" name="disq">
                                            <option value={0}>0</option>
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                            <option value={3}>3</option>
                                            <option value={4}>4</option>
                                            <option value={5}>5</option>
                                        </select>

                                    </div>
                                    <div className="questionPoints">
                                        <select className="timeSelect dropDown" name="points"
                                            onChange={(event) => {
                                                const newPoints = parseInt(event.target.value);
                                                setQuestionGroupState(prevState => {
                                                    prevState.question_groups[groupIndex].points = newPoints;
                                                    return { ...prevState }; // Return a new object to trigger re-render
                                                });
                                            }} value={questionGroupState.question_groups[groupIndex].points}>
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                            <option value={3}>3</option>
                                            <option value={4}>4</option>
                                            <option value={5}>5</option>
                                        </select>
                                        <i className="fa-solid fa-bullseye ms-2" style={{ fontSize: "22pt" }}></i>
                                    </div>
                                </div>
                                <i onClick={() => (setIdToDelete({ groupID: QuestionGroup.id })) || setShowConfirmationGroup(true)} className='p-2 deleteButton fa-regular fa-trash-can'></i>

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
            {showConfirmationQuestion && <ConfirmationMessage message="Are you sure you want to delete this question？" QuestionId={idToDelete.questionID} QuestionGroupId={idToDelete.groupID} onConfirm={deleteQuestion} />}
            {showConfirmationGroup && <ConfirmationMessage message="Are you sure you want to delete this question group？" QuestionGroupId={idToDelete.groupID} onConfirm={deleteQuestionGroup} />}

            {!quiz.data && <div className="creatorLoader">
                <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
            </div>}
            <div onClick={() => navigate("/")} className="homeButton"><i className="fa-solid fa-house fa-2x p-3"></i></div>
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
                <h1 onClick={() => console.log(questionGroupState)}>click to log</h1>


                {QuestionGroups}
                <div className="addGroup">
                    <button className="addGroupButton btn-action pt-2 pb-2" onClick={() => storeNewQuestionGroup(false)}>Add question group + </button>
                    <button disabled={hasTiebreaker} className="addTieBreakerButton btn-action pt-2 pb-2" onClick={() => storeNewQuestionGroup(true)}>Tiebreaker +</button>
                    <button className="mt-3 submitQuestionsButton btn-action pt-2 pb-2 mt-2" onClick={saveQuiz}>Submit</button>
                </div>

            </div>}




        </div>
    );
}

export default QuestionCreator;