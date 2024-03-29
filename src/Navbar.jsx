import API from './axiosApi';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import SignIn from './SignIn';

const Navbar = () => {
    const navigate = useNavigate();

    const logout = async () => {
        await API.post('/logout');
        localStorage.removeItem("loginToken");
        window.location.reload();
    }

    // click to show thing
    const [isOpen, setIsOpen] = useState(true);
    const ref = useRef(null);
    const refNavbar = useRef(null);

    const togglePopup = () => {
        if (!isOpen) {
            ref.current.style.display = 'none';
            setIsOpen(true);
        }else{
            ref.current.style.display = 'block';
            setIsOpen(false);
        }
    }

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
            <div ref={ref} className="showPopup" style={{display: "none"}}>
                        <SignIn/>
            </div>
            <div className="navBarActivator" onMouseEnter={() => {refNavbar.current.style.bottom = 0}} onMouseLeave={() => {refNavbar.current.style.bottom = '-60px'}}>
                <div ref={refNavbar} className="nav-container row p-2 ps-5 pe-5" >
                    <div className="credits col-2">
                        darbu taisīja es un viņš
                    </div>
                    <div className="col-8"></div>
                    <div className="authentification col-2">
                        <i className="fa-solid fa-x me-4 fa-2x navbar-action p-1" style={{display : (loggedIn ? 'block' : 'none')}} onClick={logout}></i>
                        <i className="fa-solid fa-right-to-bracket fa-2x navbar-action p-1" style={{display : (!loggedIn ? 'block' : 'none')}} onClick={togglePopup}></i>
                        
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;