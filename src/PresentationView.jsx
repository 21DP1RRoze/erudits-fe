import API from './axiosApi'
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';


const PresentationView = () => {
    const [players, setPlayers] = useState();
    const [sort, setSort] = useState(false);
    const { id } = useParams();
    const [toDisqualify, setToDisqualify] = useState();
    const [showCountdown, setShowCountdown] = useState(false);

    //timer
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(1);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data);
        });
        API.get(`/quiz-instances/${id}`).then((response) => {
            setToDisqualify(response.data.data.active_question_group.disqualify_amount);

            setMinutes(Math.floor(response.data.data.active_question_group.answer_time));
        })
    }, [])


    const classifyPlayers = (amount, arrayToSort) => {
        const array = arrayToSort.sort((a, b) => (a["points"] > b["points"] ? 1 : -1))
        for (let i = 0; i < array.length; i++) {
            if (array[i].is_disqualified) {
                array.splice(i, 1);

            }
        }
        console.log(toDisqualify);
        let disqualified = 0;
        while (array.length <= amount) {
            amount--;
        }
        for (let player = 0; player < array.length; player++) {
            if (disqualified === amount) {
                break;
            }


            if (array[player].points < array[player + 1].points || (amount - disqualified) > 1) {
                disqualified++;
                array[player].presentation_disqualified = true;
            }
            else if (array[player].points === array[player + 1].points) {
                disqualified = disqualified + 0.5;
                array[player].presentation_tiebreaker = true;
                array[player + 1].presentation_tiebreaker = true;
                for(let i=2; i<array.length; i++) {
                    if (array[player + i] !== undefined && array[player].points === array[player + i].points) {
                        array[player + i].presentation_tiebreaker = true;
                    } else {
                        break;
                    }
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
        return (!sort ? players.data : handleSort(classifyPlayers(toDisqualify, players.data))).map(function (Player, playerIndex) {

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

    useEffect(() => {
        let intervalId;
    
        if (isActive && (minutes > 0 || seconds > 0)) {
          intervalId = setInterval(() => {
            if (seconds === 0 && minutes !== 0) {
              setSeconds(59);
              setMinutes(prevMinutes => prevMinutes - 1);
            } else if (seconds !== 0) {
              setSeconds(prevSeconds => prevSeconds - 1);
            }
          }, 1000);
        }
        if(minutes === 0 && seconds === 0) {
            setIsActive(false);
        }
        
		return () => clearInterval(intervalId);
	}, [isActive, minutes, seconds]);
    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };


    return (
        <div className='content presentationBackground'>
            <button onClick={() => showCountdown ? setShowCountdown(false) : setShowCountdown(true)}>{showCountdown ? 'leaderoard' : 'countdown'}</button>
            <button onClick={() => setIsActive(true)}>start countdown</button>
            {!showCountdown && <div>
                <button onClick={() => (sort ? setSort(false) : setSort(true))}>sort</button>
                <table className="presentationTable">
                    {mapPlayers}


                </table>
            </div>}
            {showCountdown && 
            <div className="countdownContainer">
                <span className='countdownClock'>{formatTime(minutes)}:{formatTime(seconds)}</span>
            </div>}
        </div>
    )
}

export default PresentationView;