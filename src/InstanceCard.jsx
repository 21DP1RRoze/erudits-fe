import {useEffect, useState} from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';

const InstanceCard = ({ instance }) => {

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



    return (
        <div className="col-lg-4">
            <div className="glass card mb-3">
                <div className="card-body">
                    <h5 className="card-title">{instance.quiz.title}</h5>
                    <p className="card-text">{instance.quiz.description}</p>
                    <button onClick={() => navigate(`/game/${instance.id}`)} className="urbanist p-1 ps-3 pe-3 btn-action">Pieslēgties</button>
                    {loggedIn && <i className="fa-solid fa-pen-to-square editInstanceButton" ></i>}
                </div>
            </div>
        </div>
    )
}

export default InstanceCard;