import catgif from './assets/cat_wave.gif';
import Navbar from './Navbar';
import API from './axiosApi';
import { useEffect, useState } from 'react';
import InstanceCard from './InstanceCard';
import QuizCard from "./QuizCard";
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const [quizzes, setQuizzes] = useState(false);
    const [quizInstances, setQuizInstances] = useState(false);


    useEffect(() => {
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

    const updateInstanceCards = async () => {
        await API.get(`/quiz-instances`).then((response) => {
            setQuizInstances(response.data.data);
        }).catch((errors) => {
            alert(`Something went wrong. Check the console for errors.`);
            console.log(errors);
        });
    }

    const updateQuizzes = async () => {
        await API.get(`/quizzes`).then((response) => {
            setQuizzes(response.data.data);
        }).catch((errors) => {
            alert(`Something went wrong. Check the console for errors.`);
            console.log(errors);
        });
    }

    let Quizzes;
    if (quizzes) {
        Quizzes = quizzes.map(function (quiz) {
            return (
                <QuizCard
                    quiz={quiz}
                    updateInstanceCards={updateInstanceCards}
                    updateQuizzes={updateQuizzes}
                />
            )
        });
        if (Quizzes.length < 1) {
            Quizzes = <p className="p-3">Jums pašlaik nav viktorīnu! Izveidojiet jaunu viktorīnu, lai redzētu to šeit!</p>
        }
    }

    let QuizInstances;
    if (quizInstances) {
        QuizInstances = quizInstances.map(function (quizInstance) {
            return (
                <InstanceCard
                    instance={quizInstance}
                    loggedIn={loggedIn}
                />
            )
        });
        if (QuizInstances.length < 1) {
            QuizInstances = <p className="p-3">Pašlaik nav aktīvas spēles! Sāciet jaunu spēli, lai redzētu to šeit!</p>
        }
    }

    const onCreateQuizBtnClick = async () => {
        if (user) {
            await API.post('/quizzes', {
                "user_id": user.id,
            }).then((response) => {
                navigate(`questioncreator/${response.data.data.id}`);
            });
        }
    }


    return (
        <div className="content css-selector">
            <Navbar />

            {!quizzes && !quizInstances && <div className="creatorLoader">
                <div className="lds-ring mb-4"><div></div><div></div><div></div><div></div></div>
            </div>}
            <div className="instance-container">
                <img className="m-2 ms-3 cat-wave" src={catgif} />
                <p className="title mt-3">Laipni lūgts sistēmā "Erudīts"!</p>
                {loggedIn && <button onClick={() => onCreateQuizBtnClick()} className="p-1 ps-2 pe-2 urbanist newQuizButton btn-action">Create new quiz +</button>}
                <div className="gamesContainer container p-0">
                    {loggedIn &&
                        <div>
                            <hr />
                            <div className="adminGames mb-3 title">Jūsu viktorīnas</div>
                            <hr />
                            <div className="quizzes p-2 row pt-3">
                                {Quizzes}
                            </div>
                        </div>
                    }

                    <hr />
                    <div className="adminGames mb-3 title">Atvērtās spēles</div>
                    <hr />
                    <div className="quizzes p-2 pt-3 row">
                        {QuizInstances}
                    </div>



                </div>
                {/* <div className="urbanist ps-4 pt-3 manualConnect glass">
                        <form>
                            <input placeholder="Spēles kods" type="text"/>
                            <button>Pievienoties</button>
                        </form>
                    </div> */}
            </div>
        </div>

    );
}

export default Home;
