import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './Home';
import QuestionCreator from './QuestionCreator';
import GamePage from './GamePage';
import API from './axiosApi';
import PresentationView from './PresentationView';

function App() {
  const [loggedIn, setLoggedIn] = useState();
  useEffect(() => {
    async function fetchData() {
      await API.get('/user').then(async (response) => {
        setLoggedIn(true);
      }).catch(() => {
        setLoggedIn(false);
      });
      
    }
    fetchData();
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home loggedIn={loggedIn} />} />
          <Route path='/questioncreator/:id' element={<QuestionCreator />} />
          <Route path="/gamepage/:id" element={<GamePage loggedIn={loggedIn} />} />
          <Route path="/scoreboard" element={<PresentationView/>}/>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
