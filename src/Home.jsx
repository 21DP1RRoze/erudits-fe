import catgif from './assets/cat_wave.gif';
import Navbar from './Navbar';
import API from './axiosApi';
import {useEffect, useState} from 'react';
import InstanceCard from './InstanceCard';
import QuizCard from "./QuizCard";
import {useNavigate} from 'react-router-dom';

const Home = () => {
    
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const [quizzes, setQuizzes] = useState(false);
    const [quizInstances, setQuizInstances] = useState(false);


    useEffect (() => {
        async function fetchData() {
            await API.get('/user').then(async (response) => {
                setLoggedIn(true);
                setUser(response.data);
                await API.get('/quizzes').then((response) => {
                    setQuizzes(response.data.data);
                });
            }).catch(() => {
                setLoggedIn(false);
            });
            await API.get('/quiz-instances').then((response) => {
                setQuizInstances(response.data.data);
            });
        }
        fetchData();
    }, []);

    let Quizzes;
    if(quizzes){
        Quizzes = quizzes.map(function (quiz) {
            return (
                <QuizCard
                    quiz={quiz}
                />
            )
        });
        if (Quizzes.length < 1) {
            Quizzes = <p>Jums pašlaik nav viktorīnu! Izveidojiet jaunu viktorīnu, lai redzētu to šeit!</p>
        }
    }

    let QuizInstances;
    if(quizInstances){
        QuizInstances = quizInstances.map(function (quizInstance) {
            return (
                <InstanceCard
                    quiz={quizInstance}
                />
            )
        });
        if (QuizInstances.length < 1) {
            QuizInstances = <p>Pašlaik nav aktīvas spēles! Sāciet jaunu spēli, lai redzētu to šeit!</p>
        }
    }

    const onCreateQuizBtnClick = async () => {
        if(user) {
            await API.post('/quizzes', {
                "user_id": user.id,
            }).then((response) => {
                navigate(`questioncreator/${response.data.data.id}`);
            });
        }
    }


    return (
        <div className="content css-selector">
            <div className="instance-container glass">
            <img className="m-2 ms-3 cat-wave" src={catgif} />
                <p className="title mt-3">Laipni lūgts sistēmā "Erudīts"!</p>
                {loggedIn && <button onClick={() => onCreateQuizBtnClick()} className="p-1 ps-2 pe-2 urbanist newQuizButton">Create new quiz +</button>}
                <div className="container">
                    {loggedIn ?
                        (
                            <div>
                                <h2>Jūsu viktorīnas</h2>
                                <div className="row">
                                    {Quizzes}
                                </div>
                            </div>
                        ) : null}


                    <h2>Atvērtās viktorīnas</h2>
                    <div className="row">
                    {QuizInstances}
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
