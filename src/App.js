import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import QuestionCreator from './QuestionCreator';
import GameView from './GameView';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/questioncreator/:id' element={<QuestionCreator />} />
          <Route path="/game/:id" element={<GameView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
