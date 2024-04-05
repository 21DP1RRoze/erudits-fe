import { useEffect, useState } from 'react';
import API from './axiosApi';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationMessage from './ConfirmationMessage';

const InstanceCard = ({ quiz, updateInstanceCards, updateQuizzes, id }) => {

    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [description, setDescription] = useState();
    const [title, setTitle] = useState();


    useEffect(() => {
        setDescription(quiz.description);
        setTitle(quiz.title);
    }, []);

    const createQuizInstance = async (quizId) => {
        await API.post(`/quiz-instances`, {
            quiz_id: quizId,
        }).then((response) => {
            updateInstanceCards();
        }).catch((errors) => {
            alert(`Something went wrong. Check the console for errors.`);
            console.log(errors);
        });
    }
    const deleteQuiz = async (choice) => {
        setShowConfirmation(false);
        if (choice) {
            await API.delete(`/quizzes/${quiz.id}`).then(() => {
                updateInstanceCards();
                updateQuizzes();
            }).catch((errors) => {
                alert(`Something went wrong. Check the console for errors.`);
                console.log(errors);
            });

        }
    }

    async function saveQuiz() {
        await API.post(`/quizzes/${id}/savetitledescription`, {title: title, description: description}).then(() => {
        }).catch((error) => {
            alert('Something went wrong.. check the console for more information.');
            console.log(error);
        });
    }

    return (
        <div className="col-lg-4">
            {showConfirmation && <ConfirmationMessage message={"Are you sure you want to delete this quiz?"} onConfirm={deleteQuiz}/>}
            <div className="glass card mb-3">
                <div className="card-body">
                    <input className="card-title" value={title} onChange={(e) => setTitle(e.target.value) || saveQuiz()}/>
                    <textarea onChange={(e) => setDescription(e.target.value) || saveQuiz()} value={description} className="card-description" />
                    <button onClick={() => { createQuizInstance(quiz.id) }} className="urbanist p-1 ps-3 pe-3 btn-action">Atvērt</button>
                    <i className="fa-solid fa-pen-to-square editInstanceButton" onClick={() => navigate(`/questioncreator/${quiz.id}`)}></i>
                    <i onClick={() => setShowConfirmation(true)} className='deleteQuiz fa-regular fa-trash-can'></i>
                </div>
            </div>
        </div>
    )
}

export default InstanceCard;