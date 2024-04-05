import { useEffect, useState } from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';

const InstanceCard = ({ instance, loggedIn, updateInstanceCards }) => {

    const navigate = useNavigate();

    const deactivate = async () => {
        await API.delete(`/quiz-instances/${instance.id}`).then(() => {
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
                    <h5 className="card-title">{instance.quiz.title}</h5>
                    <p className="card-text">{instance.quiz.description}</p>
                    <button onClick={() => navigate(`/gamepage/${instance.id}`)} className="urbanist p-1 ps-3 pe-3 me-4 btn-action">{loggedIn ? "Administrēt" : "Pieslēgties"}</button>
                    {loggedIn && <i onClick={deactivate} className="editInstanceButton fa-solid fa-xmark"></i>}
                </div>
            </div>
        </div>
    )
}

export default InstanceCard;