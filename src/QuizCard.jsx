import {useEffect, useState} from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';

const InstanceCard = ({ quiz, updateInstanceCards }) => {

    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect (() => {
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




    return (
        <div className="col-lg-4">
            <div className="glass card mb-3">
                <div className="card-body">
                    <h5 className="card-title">{quiz.title}</h5>
                    <p className="card-text">{quiz.description}</p>
                    <button onClick={() => {createQuizInstance(quiz.id)} } className="urbanist p-1 ps-3 pe-3 btn-action">Atvērt</button>
                    {loggedIn && <i className="fa-solid fa-pen-to-square editInstanceButton" onClick={() => navigate(`/questioncreator/${quiz.id}`)}></i>}
                </div>
            </div>
        </div>
    )
}

export default InstanceCard;