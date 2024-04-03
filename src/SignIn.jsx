import API from './axiosApi.js';
import {useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({setShowLogin}) => {
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputPasswordConfirmation, setInputPasswordConfirmation] = useState('');
    const [toggleLoginView, setToggleLoginView] = useState(true);

    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        await API.post('/login', {
            username: inputUsername,
            password: inputPassword,
        }).then(async (response) => {
            const token = response.data.token;
            localStorage.setItem("loginToken", token);
            alert("Successfully logged in!")
            window.location.reload();
        }).catch((error) => {
            alert(error.response.data.message);
        })
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        await API.post('/register', {
            username: inputUsername,
            password: inputPassword,
            password_confirmation: inputPasswordConfirmation,
        }).then(() => {
            alert("Successfully signed up!")
        }).catch((error) => {
            alert(error.response.data.message);
        })
    }



    return (
        <>
        <div onClick={() => setShowLogin(false)} className="loginBackground glass"></div>
            {toggleLoginView && <div className="loginContainer">
                <div className="loginInfoText p-3">
                    <form onSubmit={handleLoginSubmit}>
                    <div className="closeButton mt-0 mb-2"><i onClick={() => setShowLogin(false)} className="fa-solid fa-xmark"></i></div>
                    <h5 className="m-0 mb-4">Please log in to create and modify quizzes.</h5>
                    <input onChange={(e)=> setInputUsername(e.target.value)} value={inputUsername} className="userInput mb-4 p-1 ps-3" placeholder="username" type="text"></input>
                    <input onChange={(e)=> setInputPassword(e.target.value)} value={inputPassword} className="userInput mb-4 p-1 ps-3" placeholder="password" type="password"></input><br/>
                    <button onClick={handleLoginSubmit} className="btn-action p-1 ps-5 pe-5 mb-2">Login</button>
                    <p className="m-0 mb-1">or</p>
                    <p className="switchLogin" onClick={() => setToggleLoginView(false)}>create an account</p>
                    </form>
                </div>
            </div>}
            {!toggleLoginView && <div className="registerContainer">
                <div className="loginInfoText p-3">
                    <form onSubmit={handleRegisterSubmit}>
                    <div className="closeButton mt-0 mb-2"><i onClick={() => setShowLogin(false)} className="fa-solid fa-xmark"></i></div>
                    <h5 className="m-0 mb-4">Please sign up to create and modify quizzes.</h5>
                    <input onChange={(e)=> setInputUsername(e.target.value)} value={inputUsername} className="userInput mb-4 p-1 ps-3" placeholder="username" type="text"></input>
                    <input onChange={(e)=> setInputPassword(e.target.value)} value={inputPassword} className="userInput mb-4 p-1 ps-3" placeholder="password" type="password"></input>
                    <input onChange={(e)=> setInputPasswordConfirmation(e.target.value)} value={inputPasswordConfirmation} className="userInput mb-4 p-1 ps-3" placeholder="confirm password" type="password"></input><br/>

                    <button onClick={handleRegisterSubmit} className="btn-action p-1 ps-5 pe-5 mb-2">Sign up</button>
                    <p className="m-0 mb-1">or</p>
                    <p className="switchLogin" onClick={() => setToggleLoginView(true)}>log in</p>
                    </form>
                </div>
            </div>}
        </>
    );
}

export default Register;
