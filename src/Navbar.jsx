import API from './axiosApi';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import SignIn from './SignIn';

const Navbar = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const logout = async () => {
        await API.post('/logout');
        localStorage.removeItem("loginToken");
        window.location.reload();
    }

    // click to show thing
    const [isOpen, setIsOpen] = useState(true);

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
        <>
          {showLogin && <SignIn setShowLogin={setShowLogin}/>}
        <div className="slidingContainer" onClick={() => (show ? setShow(false) : setShow(true))} style={{left: (show ? '8.5%' : '13%')}}>
          
            <div className="pullTab">
            <i className="fa-solid fa-caret-left arrow"></i>
            </div>
            {!loggedIn ? <i onClick={()=> setShowLogin(true)}className="loginButton fa-solid fa-unlock"></i> :
            <i onClick={logout}className="loginButton fa-regular fa-circle-xmark"></i>}
        </div>
        </>
    );
}

export default Navbar;