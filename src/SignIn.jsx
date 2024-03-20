import API from './axiosApi.js';
import {useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputPasswordConfirmation, setInputPasswordConfirmation] = useState('');
    const [toggleLoginView, setToggleLoginView] = useState(false);

    const refLogin = useRef(null);
    const refRegister = useRef(null);


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

    const toggleLogin = () => {
        if (toggleLoginView) {
            refLogin.current.style.display = 'block';
            refRegister.current.style.display='none';
            setToggleLoginView(false);
        } else {
            refLogin.current.style.display = 'none';
            refRegister.current.style.display='block';
            setToggleLoginView(true);
        }
    }

    return (
        <>
            <div ref={refRegister} className="register-container" style={{display: "none"}}>
            <div className="login-body">
            <h2>Register</h2>
            <div className="form">
                <form onSubmit={handleRegisterSubmit} className="loginForm">
                    <input className="p-1 mb-3" placeholder="username" value={inputUsername} required onChange={(e) => setInputUsername(e.target.value)} type="text" /> <br/>
                    <input className="p-1 mb-3" placeholder="password" value={inputPassword} required onChange={(e) => setInputPassword(e.target.value)} type="password" /> <br/>
                    <input className="p-1 mb-3" placeholder="confirm password" value={inputPasswordConfirmation} required onChange={(e) => setInputPasswordConfirmation(e.target.value)} type="password" /> <br/>
                    <button className="btn btn-primary me-4" type="submit">Sign up</button>
                    <a className="ms-5 loginViewToggle" onClick={toggleLogin}>Log in</a>

                </form>
                </div>
            </div>
            </div>
            
            <div ref={refLogin} className="login-container">
            <div className="login-body">
                <h2>Login</h2>
                <div className="form">
                    <form onSubmit={handleLoginSubmit} className="loginForm">
                        <input className="p-1 mb-3" placeholder="username" value={inputUsername} required onChange={(e) => setInputUsername(e.target.value)} type="text" /> <br/>
                        <input className="p-1 mb-3" placeholder="password" value={inputPassword} required onChange={(e) => setInputPassword(e.target.value)} type="password" /> <br/>
                        <button className="btn btn-primary me-4" type="submit">Login</button>
                        <a className="ms-5 loginViewToggle" onClick={toggleLogin}>Sign up</a>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

export default Register;
