import API from './axiosApi'
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';


const PresentationView = () => {
    const [players, setPlayers] = useState();
    const [sort, setSort] = useState(false);
    const { id } = useParams();
    const [toDisqualify, setToDisqualify] = useState();

    useEffect(() => {
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data);
        });
        API.get(`/quiz-instances/${id}`).then((response) => {
            setToDisqualify(response.data.data.active_question_group.disqualify_amount);
        })
    }, [])


    const classifyPlayers = (amount, arrayToSort) => {
        const array = arrayToSort.sort((a, b) => (a["points"] > b["points"] ? 1 : -1))
        for(let i=0; i<array.length; i++) {
            if(array[i].is_disqualified) {
                array.splice(i, 1);

            }
        }
    
        let disqualified = 0;
        console.log(array.length, amount);
        while (array.length <= amount) {
            amount--;
        }
        for (let player = 0; player < array.length; player++) {
            if (disqualified === amount) {
                break;
            }
           

            if (array[player].points < array[player + 1].points || (amount - disqualified) > 1) {
                console.log("1 disqualified")
                disqualified++;
                array[player].presentation_disqualified = true;
            }
            else if (array[player].points === array[player + 1].points) {
                console.log("tiebreak")
                disqualified = disqualified + 0.5;
                array[player].presentation_tiebreaker = true;
                array[player + 1].presentation_tiebreaker = true;
                if (array[player + 2] !== undefined && array[player].points === array[player + 2].points) {
                    array[player + 2].presentation_tiebreaker = true;
                }
                if (array[player + 3] !== undefined && array[player].points === array[player + 3].points) {
                    array[player + 3].presentation_tiebreaker = true;
                }
                break;
            }
        }

        return array;
    }

    const handleSort = (arrayToSort) => {
        return arrayToSort.sort((a, b) => (a["points"] > b["points"] ? -1 : 1))
    }




    const mapPlayers = useMemo(() => {
        if (!players && !toDisqualify) return null;
        return (!sort ? players.data : handleSort(classifyPlayers(1, players.data))).map(function (Player, playerIndex) {

            return (
                !Player.is_disqualified && <tr key={playerIndex}>
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
            <button>countdown</button>
            <table className="presentationTable">
                {mapPlayers}


            </table>
        </div>
    )
}

export default PresentationView;