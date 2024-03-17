import API from './axiosApi.js';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputPasswordConfirmation, setInputPasswordConfirmation] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.post('/register', {
            username: inputUsername,
            password: inputPassword,
            password_confirmation: inputPasswordConfirmation,
        }).then(() => {
            navigate('/login')
        }).catch((error) => {
            alert(error.response.data.message);
        })
    }

    return (
        <>
            <h1>レジスター！</h1>
            <div className="form">
                <form onSubmit={handleSubmit} className="registerForm">
                    <input placeholder="username" value={inputUsername} required onChange={(e) => setInputUsername(e.target.value)} type="text" /> <br/>
                    <input placeholder="password" value={inputPassword} required onChange={(e) => setInputPassword(e.target.value)} type="password" /> <br/>
                    <input placeholder="confirm password" value={inputPasswordConfirmation} required onChange={(e) => setInputPasswordConfirmation(e.target.value)} type="password" /> <br/>
                    <button type="submit">Sign up</button>

                </form>
            </div>
        </>
    );
}

export default Register;
