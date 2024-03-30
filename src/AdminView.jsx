import React, { useEffect, useState, useMemo } from 'react';
import API from './axiosApi';
import { useNavigate } from 'react-router-dom';

const AdminView = ({ instanceId }) => {
    const [quiz, setQuiz] = useState(null);
    const [activeQuestionGroup, setActiveQuestionGroup] = useState({disqualify_amount: 3});

    const [disqualifiedPlayers, setDisqualifiedPlayers] = useState(null);
    const [tiebreakerPlayers, setTiebreakerPlayers] = useState(null);
    const [advancedPlayers, setAdvancedPlayers] = useState(null);

    const [players, setPlayers] = useState([]);

    const [loadedPlayers, setLoadedPlayers] = useState(null);
    const [activePlayers, setActivePlayers] = useState(null);
    const [inactivePlayers, setInactivePlayers] = useState(null);

    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        API.get(`/quiz-instances/${instanceId}`).then((response) => {
            setQuiz(response.data.data.quiz);
            console.log(response.data.data.quiz);
        });
        API.get(`/quiz-instances/${instanceId}/players`).then((response) => {
            setPlayers(response.data);
        });
        API.get(`/players`).then((response) => {
            setLoadedPlayers(response.data.data);
        });
    }, [instanceId]);

    // Magic
    const objectsEqual = (o1, o2) =>
        typeof o1 === 'object' && Object.keys(o1).length > 0
            ? Object.keys(o1).length === Object.keys(o2).length
            && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
            : o1 === o2;

    const arraysEqual = (a1, a2) =>
        a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

    useEffect(() => {
        if(!loadedPlayers) return;
        const pollingInterval = 2000; // 2 seconds in milliseconds
        const pollInterval = setInterval(() => {
            API.get(`/players`).then((response) => {
                const sortedArr2 = loadedPlayers.slice().sort();
                const sortedArr1 = response.data.data.slice().sort();

                if (!arraysEqual(sortedArr1, sortedArr2)) {
                    setLoadedPlayers(response.data.data);
                }
            });

        }, pollingInterval);
        return () => clearInterval(pollInterval);
    }, [loadedPlayers]);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getActivePlayers = useMemo(() => {
        if (!loadedPlayers) return;
        setActivePlayers(loadedPlayers.filter(player => !player.is_disqualified));
        setInactivePlayers(loadedPlayers.filter(player => player.is_disqualified));
    }, [loadedPlayers])

    const DisqualifiedPlayers = useMemo(() => {
        if (!disqualifiedPlayers) return null;
        return disqualifiedPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='danger-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                </tr>
            )
        })
    }, [disqualifiedPlayers]);

    const TiebreakPlayers = useMemo(() => {
        if (!tiebreakerPlayers) return null;
        return tiebreakerPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='warning-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                </tr>
            )
        })
    }, [tiebreakerPlayers]);

    const AdvancedPlayers = useMemo(() => {
        if (!advancedPlayers) return null;
        return advancedPlayers.map(function (Player, playerIndex) {
            return (
                <tr>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                </tr>
            )
        })
    }, [advancedPlayers]);

    const InactivePlayers = useMemo(() => {
        if (!inactivePlayers) return null;
        return inactivePlayers.map(function (Player, playerIndex) {
            return (
                <tr className='dead-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                </tr>
            )
        })
    }, [inactivePlayers]);

    const AllActivePlayers = useMemo(() => {
        return (
            <React.Fragment>
                {AdvancedPlayers}
                {TiebreakPlayers}
                {DisqualifiedPlayers}
                {InactivePlayers}
            </React.Fragment>
        );
    }, [TiebreakPlayers, DisqualifiedPlayers, AdvancedPlayers, InactivePlayers])

    const PositionPlayers = useMemo(() => {
        if (!activePlayers || activePlayers.length === 0) return null;
        if (!activeQuestionGroup) return null;

        const sortedPlayers = [...activePlayers].sort((a, b) => a.points - b.points);

        let disqualifiedCount = 0;
        let tiebreakerScore = 0;

        let disqPlayers = [];
        let tiePlayers = [];

        console.log("NEW CYCLE")
        for (const player of sortedPlayers) {
            // If there are no players left
            // NOTE: THIS SHOULD NEVER RUN - only if all the teams have the same score, which is VERY unlikely
            if (disqualifiedCount >= sortedPlayers.length) break;

            // If this is the first player
            else if (disqualifiedCount === 0) {
                // -- Disqualify
                disqPlayers.push(player);
                disqualifiedCount++;
                tiebreakerScore = player.points;
            }

            // If all potential candidates for disqualification are set
            else if (disqualifiedCount >= activeQuestionGroup.disqualify_amount) {
                // -- If the next player has more score than the last player, break the loop
                if (player.points > tiebreakerScore) break;

                // -- If the next player has the same score with the last player
                else if (player.points === tiebreakerScore) {
                    // --- If the last player wasn't considered a tiebreaker
                    if (tiePlayers.length === 0) {
                        // ---- Add both the last and the current player as tiebreakers
                        tiePlayers.push(disqPlayers.pop());
                        tiePlayers.push(player);
                        disqualifiedCount++;
                    }

                    // --- Else, add the current player as a tiebreaker
                    else {
                        tiePlayers.push(player);
                        disqualifiedCount++;
                    }
                }
            }

            // If more potential candidates are needed
            else if (disqualifiedCount < activeQuestionGroup.disqualify_amount) {
                // -- If the next player has the same score with the last player
                if (player.points === tiebreakerScore) {
                    // --- If the last player wasn't considered a tiebreaker
                    if (tiePlayers.length === 0) {
                        // ---- Add both the last and the current player as tiebreakers
                        tiePlayers.push(disqPlayers.pop());
                        tiePlayers.push(player);
                        disqualifiedCount++;
                    }

                    // --- Else, add the current player as a tiebreaker
                    else {
                        tiePlayers.push(player);
                        disqualifiedCount++;
                    }
                }

                // -- If the next player has more score than the last player, remove the last player from the tiebreakers and disqualify
                else if (player.points > tiebreakerScore) {
                    // --- If there were any eligible tiebreakers
                    if (tiePlayers.length > 0) {
                        // ---- Remove and disqualify
                        disqPlayers.push(tiePlayers.pop());
                    }
                    disqPlayers.push(player);
                    disqualifiedCount++;
                    tiebreakerScore = player.points;
                }
            }
        }

        const advPlayers = activePlayers.filter(player => {
            return !disqPlayers.includes(player) && !tiePlayers.includes(player);
        });

        // Update states accordingly
        setDisqualifiedPlayers(disqPlayers);
        setTiebreakerPlayers(tiePlayers);
        setAdvancedPlayers(advPlayers);
    }, [activePlayers]);

    const QuestionGroups = useMemo(() => {
        if(!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (QuestionGroup.is_additional) return null;
            return (
                <React.Fragment key={QuestionGroup.id}>
                    <tr onClick={() => toggleRow(QuestionGroup.id)} style={{cursor: 'pointer'}} className="successRow">
                        <td>{questionGroupIndex}</td>
                        <td>{QuestionGroup.title}</td>
                        <td>{QuestionGroup.disqualify_amount}</td>
                        <td>{QuestionGroup.answer_time}</td>
                        <td>{QuestionGroup.points}</td>
                    </tr>
                    {expandedRow === QuestionGroup.id && (
                        <tr>
                            <td colSpan={5}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Player name</th>
                                        <th>Points</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loadedPlayers.map((Player, index) => (
                                        <tr key={index}>
                                            <td>{Player.name}</td>
                                            <td>{Player.points}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )
        });
    }, [quiz, expandedRow]);

    const AdditionalQuestionGroups = useMemo(() => {
        if(!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (!QuestionGroup.is_additional) return null;
            return (
                <tr>
                    <td>{questionGroupIndex}</td>
                    <td>{QuestionGroup.title}</td>
                    <td>{QuestionGroup.disqualify_amount}</td>
                    <td>{QuestionGroup.answer_time}</td>
                    <td>{QuestionGroup.points}</td>
                </tr>
            )
        });
    }, [quiz]);

    return (
        <div>
            {quiz && <h1>Currently managing game {quiz.title}</h1>}
            <h2>Active players</h2>
            <table className="hostTable">
                <tbody>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Disqualified?</th>
                        <th>Points</th>
                    </tr>
                    {activePlayers && activePlayers.length === 0 && <tr>No players have currently joined this game.</tr>}
                    {activePlayers && activePlayers.length > 0 && AllActivePlayers}
                </tbody>
            </table>

            <h2>Question groups</h2>
            <table className="hostTable">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Is active?</th>
                        <th>Disqualify amount</th>
                        <th>Answer time</th>
                        <th>Points</th>
                    </tr>
                    {!quiz && <tr>Something went wrong. :(</tr>}
                    {quiz && QuestionGroups}
                </tbody>
            </table>

            <h2>Additional question groups</h2>
            <table className="hostTable">
                <tbody>
                <tr>
                    <th>Name</th>
                    <th>Is active?</th>
                    <th>Disqualify amount</th>
                    <th>Answer time</th>
                    <th>Points</th>
                </tr>
                {!quiz && <tr>Something went wrong. :(</tr>}
                {quiz && AdditionalQuestionGroups}
                </tbody>
            </table>
            {PositionPlayers}
        </div>
    );

}

export default AdminView;