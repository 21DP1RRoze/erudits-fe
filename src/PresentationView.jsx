import API from './axiosApi'
import { useState, useEffect, useMemo } from 'react';


const PresentationView = () => {
    const [players, setPlayers] = useState();
    const [sort, setSort] = useState(false);
    const [dataloaded, setDataLoaded] = useState(false);

    const id = 1;
    useEffect(() => {
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data);
            setDataLoaded(true);


        });

    }, [])

    for (let player = 0; players < players.data.length; player++) {
        console.log(player);
        if (players.data[player].is_disqualified) {
            console.log("removing " + players.data[player].name)
            players.data.splice(player, 1);
            console.log(players.data);
        }
    }


    const classifyPlayers = (amount, arrayToSort) => {
        const array = arrayToSort.sort((a, b) => (a["points"] > b["points"] ? 1 : -1))
        let disqualified = 0;
        let disqualify;
        while (disqualified < amount) {
            for (let player = 0; array.length; player++) {

                if (disqualified === amount) {
                    break;
                }
                if (array[player].points < array[player + 1].points) {
                    disqualify = true;
                    array[player].presentation_disqualified = true;
                }
                else if (array[player].points === array[player + 1].points) {
                    disqualify = false;
                    array[player].presentation_tiebreaker = true;
                    array[player + 1].presentation_tiebreaker = true;
                }

                if (disqualify) {
                    disqualified++;
                }

            }
        }
        return array;

    }

    const handleSort = (arrayToSort) => {
        return arrayToSort.sort((a, b) => (a["points"] > b["points"] ? -1 : 1))
    }




    const mapPlayers = useMemo(() => {
        if (!players) return null;
        return (sort ? players.data : handleSort(classifyPlayers(3, players.data))).map(function (Player, playerIndex) {

            return (
                <tr key={playerIndex}>
                    <td style=
                        {{
                            background: (Player.presentation_tiebreaker) ?
                                'linear-gradient(270deg, rgba(255,165,133,1) 0%, rgba(255,237,160,1) 100%)' : (Player.presentation_disqualified) ?
                                    'linear-gradient(270deg, rgba(244,7,82,1) 0%, rgba(249,171,143,1) 100%)' :
                                    'linear-gradient(270deg, rgba(65,90,119,1) 0%, rgba(119,141,169,1) 100%)'
                        }} className="presentationName">
                        {Player.name}</td>
                    <td style=
                        {{
                            background: (Player.presentation_tiebreaker) ?
                                'linear-gradient(90deg, rgba(255,165,133,1) 0%, rgba(255,237,160,1) 100%)' : (Player.presentation_disqualified) ?
                                    'linear-gradient(90deg, rgba(244,7,82,1) 0%, rgba(249,171,143,1) 100%)' :
                                    'linear-gradient(90deg, rgba(65,90,119,1) 0%, rgba(119,141,169,1) 100%)'
                        }}
                        className="presentationPoints">{Player.points}</td>
                </tr>

            )

        })
    }, [sort, players]);



    return (
        <div className='content presentationBackground'>
            <button onClick={() => (sort ? setSort(false) : setSort(true))}>sort</button>
            <h1 onClick={() => console.log(players.data[0].is_disqualified)}>log</h1>
            <table className="presentationTable">
                {mapPlayers}


            </table>
        </div>
    )
}

export default PresentationView;