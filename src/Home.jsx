import catgif from './assets/cat_wave.gif';
import Navbar from './Navbar';
import API from './axiosApi';
import {useEffect, useState} from 'react';
import InstanceCard from './InstanceCard';

const Home = () => {
    
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
            {loggedIn &&<img className="m-2 ms-3 cat-wave" src={catgif} />}
                <p className="title mt-3">Laipni lūgts sistēmā "Erudīts"!</p>
                {loggedIn && <button className="glass newQuizButton">Create new quiz +</button>}

            <div className="container">
                <div className="row">
                    <InstanceCard/>
                    <InstanceCard/>
                    <InstanceCard/>
                </div>
            </div>

            </div>
            <Navbar/>
        </div>
    
    );
}

export default Home;
