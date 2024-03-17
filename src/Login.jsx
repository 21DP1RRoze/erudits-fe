import API from './axiosApi.js';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/login', {
            username: inputUsername,
            password: inputPassword,
        }).then(async (response) => {
            const token = response.data.token;
            localStorage.setItem("loginToken", token);
            navigate("/");
        }).catch((error) => {
            alert(error.response.data.message);
        })
    }

    return (
        <>
            <h1>ロギン！</h1>
            <div className="form">
                <form onSubmit={handleSubmit} className="loginForm">
                    <input placeholder="username" value={inputUsername} required onChange={(e) => setInputUsername(e.target.value)} type="text" /> <br/>
                    <input placeholder="password" value={inputPassword} required onChange={(e) => setInputPassword(e.target.value)} type="password" /> <br/>
                    <button type="submit">Login</button>

                </form>
            </div>
        </>
    );
}

export default Login;
