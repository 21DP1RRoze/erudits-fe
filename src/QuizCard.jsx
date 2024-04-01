import { useEffect, useState } from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';
import ConfirmationMessage from './ConfirmationMessage';

const InstanceCard = ({ quiz, updateInstanceCards, updateQuizzes }) => {

    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        async function fetchData() {
            await API.get('/user').then(() => {
                setLoggedIn(true);
            }).catch(() => {
                setLoggedIn(false);
            });
        }
        fetchData();
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




    return (
        <div className="col-lg-4">
            {showConfirmation && <ConfirmationMessage message={"Are you sure you want to delete this quiz?"} onConfirm={deleteQuiz}/>}
            <div className="glass card mb-3">
                <div className="card-body">
                    <h5 className="card-title">{quiz.title}</h5>
                    <p className="card-text">{quiz.description}</p>
                    <button onClick={() => { createQuizInstance(quiz.id) }} className="urbanist p-1 ps-3 pe-3 btn-action">Atvērt</button>
                    <i className="fa-solid fa-pen-to-square editInstanceButton" onClick={() => navigate(`/questioncreator/${quiz.id}`)}></i>
                    <i onClick={() => setShowConfirmation(true)} className='deleteQuiz fa-regular fa-trash-can'></i>
                </div>
            </div>
        </div>
    )
}

export default InstanceCard;