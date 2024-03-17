import API from './axiosApi';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';


import Login from './Login';

const Navbar = () => {
    const navigate = useNavigate();

    const logout = async () => {
        await API.post('/logout');
        localStorage.removeItem("loginToken");
        navigate('/login');
    }

    // click to show thing
    const [isOpen, setIsOpen] = useState(true);
    const ref = useRef(null);
    const togglePopup = () => {
        if (!isOpen) {
            ref.current.style.display = 'none';
            setIsOpen(true);
        }else{
            ref.current.style.display = 'block';
            setIsOpen(false);
        }
    }

    return (
        <>
        <div ref={ref} classname="showPopup" style={{display: "none"}}>
                    <Login/>
        </div>
        <div className="nav-container row p-2 ps-5 pe-5">
            <div className="credits col-2">
                darbu taisīja es un viņš
            </div>
            <div className="col-8"></div>
            <div className="authentification col-2">
                <button onClick={logout}>leave</button>

                <button className="openPanel" onClick={togglePopup}>enter systen</button>
                
            </div>
        </div>
        </>
    );
}

export default Navbar;