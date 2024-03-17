import API from './axiosApi';
import {useEffect} from 'react';

const Home = () => {
    useEffect (() => {
        async function fetchData() {
            await API.get('/user');
        }
        fetchData();
    }, []);

    return (
        <>
            <div><h1>You are home :)</h1></div>
        </>
    );
}

export default Home;
