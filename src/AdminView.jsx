import { useEffect, useState, useMemo } from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';

const AdminView = ({ instanceId }) => {
    const [quiz, setQuiz] = useState(false);
    const [players, setPlayers] = useState(false);
    const [loadedPlayers, setLoadedPlayers] = useState(false);

    useEffect(() => {
        API.get(`/quiz-instances/${instanceId}`).then((response) => {
            setQuiz(response.data.data.quiz);
        });
        API.get(`/quiz-instances/${instanceId}/players`).then((response) => {
            setPlayers(response.data);
        });
        API.get(`/players`).then((response) => {
            setLoadedPlayers(response.data.data);
        });

    }, [instanceId]);

    const loadPlayers = useMemo(() => {
        if (loadedPlayers) {
            return loadedPlayers.map(function (Player, playerIndex) {
                return (
                    <div key={`player_${playerIndex}`}>
                        <div>Playername: {Player.name}</div>
                        <div>Player points: {Player.points}</div>
                        <div>Player is disqualified? {Player.is_disqualified}</div>
                    </div>
                )
            })
        }
    });

    return (
        <>
            {players && console.log(players)}
            {quiz && <h1>Currently managing game {quiz.title}</h1>}

            <table className="playerTable">
                <tr>
                    <th>Position</th>
                    <th>Player</th>
                    <th>Disqualified?</th>
                    <th>Points</th>
                </tr>
                <tr>
                    <th>1</th>
                    <th>cat</th>
                    <th>false</th>
                    <th>16</th>
                </tr>
            </table>
            {loadPlayers}
        </>
    );

}

export default AdminView;