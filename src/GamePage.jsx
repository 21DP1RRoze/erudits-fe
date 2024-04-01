import GameView from "./GameView";
import AdminView from "./AdminView";
import {useState} from 'react';

const GamePage = ({loggedIn}) => {
    return (
        <>
        {loggedIn ? <AdminView/> : <GameView/>}
        </>
    );
}

export default GamePage;