import GameView from "./GameView";
import AdminView from "./AdminView";

const GamePage = ({loggedIn}) => {
    return (
        <>
        {loggedIn ? <AdminView/> : <GameView/>}
        </>
    );
}

export default GamePage;