import API from "./axiosApi";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

const EndView = () => {
    const { id } = useParams();
    const [players, setPlayers] = useState();
    const [array, setArray] = useState();

    useEffect(() => {
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data.data);
        });

    }, [])


    useEffect(() => {
        if (players !== undefined) {
            const filteredPlayers = players.filter(player => !player.is_disqualified);
            const sortedPlayers = filteredPlayers.sort((a, b) => b.points - a.points);
            setArray(sortedPlayers);
        }
    }, [players]);

    return (
        players !== undefined && array !== undefined && <div className="endViewContainer">
            <div className="winnerContainer">

                <div className="secondPlace">
                    <h1>{array[1].name}</h1>
                    <div className="podium"><span>2</span></div>

                </div>

                <div className="firstPlace">
                    <h1>{array[0].name}</h1>
                    <div className="podium"><span>1</span></div>

                </div>

                <div className="thirdPlace">
                    <h1>{array[2].name}</h1>
                    <div className="podium"><span>3</span></div>

                </div>
            </div>
            <div className="eruditsBG">
                <div className="layer2"></div>
                <div className="layer3"></div>
                <div className="layer4"></div>
                <div className="layer5"></div>
                <div className="layer6"></div>
                <div className="layer7"></div>
                <div className="layer8"></div>
                <div className="layer9"></div>
                <div className="layer10"></div>
                <div className="layer11"></div>
                <div className="layer12"></div>
                <div className="layer13"></div>
            </div>
        </div>
    );
}

export default EndView