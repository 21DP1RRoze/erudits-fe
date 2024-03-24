import catgif from './assets/cat_wave.gif';
import Navbar from './Navbar';
import API from './axiosApi';
import {useEffect, useState} from 'react';
import InstanceCard from './InstanceCard';
import {useNavigate} from 'react-router-dom';

const Home = () => {
    
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
        <div className="content css-selector">

            <div className="instance-container glass">
            <img className="m-2 ms-3 cat-wave" src={catgif} />
                <p className="title mt-3">Laipni lūgts sistēmā "Erudīts"!</p>
                {loggedIn && <button onClick={() => navigate("questioncreator/1")} className="p-1 ps-2 pe-2 urbanist newQuizButton">Create new quiz +</button>}

            <div className="container">
                <div className="row">
                    <InstanceCard/>
                    <InstanceCard/>
                    <InstanceCard/>
                </div>
                <div className="urbanist ps-4 pt-3 manualConnect glass">
                    <form>
                        <input placeholder="Spēles kods" type="text"/>
                        <button>Pievienoties</button>
                    </form>
                </div>
            </div>

            </div>
            <Navbar/>
        </div>
    
    );
}

export default Home;
