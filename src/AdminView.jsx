import React, { useEffect, useState, useMemo } from 'react';
import API from './axiosApi';
import { useNavigate, useParams } from 'react-router-dom';

const AdminView = ({ }) => {
    const [quiz, setQuiz] = useState(null);
    const [quizInstance, setQuizInstance] = useState(null);

    const [activeQuestionGroup, setActiveQuestionGroup] = useState({ disqualify_amount: 3 });

    const [disqualifiedPlayers, setDisqualifiedPlayers] = useState(null);
    const [tiebreakerPlayers, setTiebreakerPlayers] = useState(null);
    const [advancedPlayers, setAdvancedPlayers] = useState(null);

    const [players, setPlayers] = useState([]);

    const [loadedPlayers, setLoadedPlayers] = useState(null);
    const [activePlayers, setActivePlayers] = useState(null);
    const [inactivePlayers, setInactivePlayers] = useState(null);

    const [expandedRow, setExpandedRow] = useState(null);

    const { id } = useParams()

    useEffect(() => {
        API.get(`/quiz-instances/${id}`).then((response) => {
            setQuiz(response.data.data.quiz);
            setQuizInstance(response.data.data);
            setActiveQuestionGroup(response.data.data.active_question_group);
            console.log(response.data.data);

        });
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data);
            setLoadedPlayers(response.data.data);
        });
    }, [id]);


    useEffect(() => {
        if (!loadedPlayers) return;
        const pollingInterval = 1000; // 1 second in milliseconds
        const pollInterval = setInterval(() => {
            API.get(`/quiz-instances/${id}/players`).then((response) => {
                setLoadedPlayers(response.data.data);
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
        const sortedPlayers = [...disqualifiedPlayers].sort((a, b) => b.points - a.points);
        return sortedPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='danger-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                    <td>
                        <button onClick={() => handleKickPlayer(Player.id)}>Kick</button>
                        <button onClick={() => handleDisqualifyPlayer(Player.id)}>Disqualify</button>
                    </td>
                </tr>
            )
        })
    }, [disqualifiedPlayers]);

    const TiebreakPlayers = useMemo(() => {
        if (!tiebreakerPlayers) return null;
        const sortedPlayers = [...tiebreakerPlayers].sort((a, b) => b.points - a.points);
        return sortedPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='warning-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                    <td>
                        <button onClick={() => handleKickPlayer(Player.id)}>Kick</button>
                        <button onClick={() => handleDisqualifyPlayer(Player.id)}>Disqualify</button>
                    </td>
                </tr>
            )
        })
    }, [tiebreakerPlayers]);

    const AdvancedPlayers = useMemo(() => {
        if (!advancedPlayers) return null;
        const sortedPlayers = [...advancedPlayers].sort((a, b) => b.points - a.points);
        return sortedPlayers.map(function (Player, playerIndex) {
            return (
                <tr>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                    <td>
                        <button onClick={() => handleKickPlayer(Player.id)}>Kick</button>
                        <button onClick={() => handleDisqualifyPlayer(Player.id)}>Disqualify</button>
                    </td>
                </tr>
            )
        })
    }, [advancedPlayers]);

    const handleKickPlayer = (playerId) => {
        API.delete(`/players/${playerId}`).then(() => {
            setLoadedPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
            setActivePlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));

        })
    }

    const handleDisqualifyPlayer = (playerId) => {
        API.post(`/players/${playerId}/disqualify`).then(() => {
            setLoadedPlayers(prevPlayers => {
                return prevPlayers.map(player => {
                    if (player.id === playerId) {
                        return { ...player, is_disqualified: true };
                    }
                    return player;
                });
            });

            setActivePlayers(prevPlayers => {
                return prevPlayers.map(player => {
                    if (player.id === playerId) {
                        return { ...player, is_disqualified: true };
                    }
                    return player;
                });
            });
        })
    }

    const handleRequalifyPlayer = (playerId) => {
        API.post(`/players/${playerId}/requalify`).then(() => {
            setLoadedPlayers(prevPlayers => {
                return prevPlayers.map(player => {
                    if (player.id === playerId) {
                        return { ...player, is_disqualified: false };
                    }
                    return player;
                });
            });

            setActivePlayers(prevPlayers => {
                return prevPlayers.map(player => {
                    if (player.id === playerId) {
                        return { ...player, is_disqualified: false };
                    }
                    return player;
                });
            });
        })
    }

    const InactivePlayers = useMemo(() => {
        if (!inactivePlayers) return null;
        const sortedPlayers = [...inactivePlayers].sort((a, b) => b.points - a.points);
        return sortedPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='dead-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                    <td>
                        <button onClick={() => handleKickPlayer(Player.id)}>Kick</button>
                        <button onClick={() => handleRequalifyPlayer(Player.id)}>Requalify</button>
                    </td>
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
        let disqualifyAmount = 0;
        if (activeQuestionGroup) disqualifyAmount = activeQuestionGroup.disqualify_amount;

        const sortedPlayers = [...activePlayers].sort((a, b) => a.points - b.points);

        let disqualifiedCount = 0;
        let tiebreakerScore = 0;

        let disqPlayers = [];
        let tiePlayers = [];

        for (const player of sortedPlayers) {
            // If no disqualifications needed, break
            if (disqualifyAmount === 0) break;

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
            else if (disqualifiedCount >= disqualifyAmount) {
                // -- If the next player has more score than the last player
                if (player.points > tiebreakerScore) {
                    // --- If there are no disqPlayers and tiePlayer count is disqualifiedCount, all tiePlayers are disqualified
                    if(disqPlayers.length === 0 && tiePlayers.length === disqualifyAmount) {
                        disqPlayers.push(...tiePlayers);
                        tiePlayers = [];
                    }
                    break;
                }

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
            else if (disqualifiedCount < disqualifyAmount) {
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

                // -- If the next player has more score than the last player, remove all players from tiebreakers and disqualify
                else if (player.points > tiebreakerScore) {
                    // --- If there were any eligible tiebreakers
                    if (tiePlayers.length > 0) {
                        // ---- Remove and disqualify
                        disqPlayers.push(...tiePlayers);
                        tiePlayers = [];
                    }
                    disqPlayers.push(player);
                    disqualifiedCount++;
                    tiebreakerScore = player.points;
                }
            }
            // If after checking this player all potential candidates are set
            if (disqualifiedCount >= disqualifyAmount) {
                // If there are no more players to check
                if (disqualifiedCount === sortedPlayers.length) {
                    // If potential candidate amount is the same as players currently tiebreaking
                    if (disqualifyAmount === tiePlayers.length) {
                        // Disqualify all players currently tiebreaking
                        disqPlayers.push(...tiePlayers);
                        tiePlayers = [];
                        break;
                    }
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
    }, [activePlayers, activeQuestionGroup]);

    const PlayerAnswers = ({ questionGroupId }) => {
        if (!activePlayers) return null;

        const questionGroup = quiz.question_groups.find(group => group.id === questionGroupId);
        if (!questionGroup) return null;

        // Map filtered players to display their answers for the specified question group
        const playerAnswerList = activePlayers.map((Player, playerIndex) => {
            // Filter player answers to include only those for the specified question group
            const playerAnswersForGroup = Player.player_answers
                .filter(answer => answer.question_group_id === questionGroupId);

            // Create a map of PlayerAnswer objects for quick lookup
            const playerAnswersMap = {};
            playerAnswersForGroup.forEach(answer => {
                playerAnswersMap[answer.question_id] = answer;
            });

            const hasAnsweredAllQuestions = questionGroup.questions.every(question =>
                playerAnswersMap.hasOwnProperty(question.id)
            );

            // Map questions from the specified question group to table cells
            const playerSetAnswers = questionGroup.questions.map(question => {
                const playerAnswer = playerAnswersMap[question.id];
                if (playerAnswer) {
                    // If PlayerAnswer exists, render the answer
                    return (
                        <td key={playerAnswer.id} className={playerAnswer.answer.is_correct ? 'success-row' : 'danger-row'}>
                            {playerAnswer.answer.text}
                        </td>
                    );
                } else {
                    // If PlayerAnswer does not exist, render an empty cell
                    return <td key={question.id}>-</td>;
                }
            });
            const rowClass = hasAnsweredAllQuestions ? 'success-row' : '';

            // Render player name along with their answers for the specified group
            return (
                <tr key={Player.id} className={rowClass}>
                    <td>{Player.name}</td>
                    {playerSetAnswers}
                </tr>
            );
        });

            // Render the table containing player names and their answers for the specified group
            return (
                <table style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>Player name</th>
                            {/* Assuming each player has the same number of answers */}
                            {questionGroup?.questions?.length && questionGroup.questions.map(question => (
                                <th key={question.id}>Question {question.id}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {playerAnswerList}
                    </tbody>
                </table>
            );
    };
    const handleStopClick = () => {
        API.post(`/quiz-instances/${id}/active-question-group`, {
            question_group_id: null
        }).then(() => {
            setActiveQuestionGroup(null);
        });
    }

    const handleStartClick = (questionGroup) => {
        API.post(`/quiz-instances/${id}/active-question-group`, {
            question_group_id: questionGroup.id,
            question_group_time: new Date().toISOString(),
        }).then(() => {
            setActiveQuestionGroup(questionGroup);
            console.log(new Date().toISOString())
        });
    }

    const getQuestionGroups = useMemo(() => {
        if (!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (QuestionGroup.is_additional) return null;
            return (
                <React.Fragment key={QuestionGroup.id}>
                    <tr onClick={() => toggleRow(QuestionGroup.id)} style={{ cursor: 'pointer' }} className={(quizInstance.has_question_group_ended ? 'warning-row' : (activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) ? 'success-row' : '')}>
                        <td>{questionGroupIndex}</td>
                        <td>{QuestionGroup.title}</td>
                        <td>{QuestionGroup.disqualify_amount}</td>
                        <td>{QuestionGroup.answer_time}</td>
                        <td>{QuestionGroup.points}</td>
                        <td>
                        {(activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) &&
                            <button onClick={(e) => { e.stopPropagation(); handleStopClick()} }>Stop</button>
                        }
                        {(activeQuestionGroup == null || QuestionGroup.id !== activeQuestionGroup.id) &&
                            <button disabled={activeQuestionGroup != null} onClick={(e) => { e.stopPropagation(); handleStartClick(QuestionGroup)} }>Start</button>
                        }
                        </td>
                    </tr>
                    {expandedRow === QuestionGroup.id && (
                        <tr>
                            <td colSpan={6}>
                                <PlayerAnswers questionGroupId={QuestionGroup.id} />
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )
        });
    }, [quiz, activeQuestionGroup, expandedRow, activePlayers]);

    const AdditionalQuestionGroups = useMemo(() => {
        if (!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (!QuestionGroup.is_additional) return null;
            return (
                <tr key={questionGroupIndex}>
                    <td>{questionGroupIndex}</td>
                    <td>{QuestionGroup.title}</td>
                    <td>{QuestionGroup.disqualify_amount}</td>
                    <td>{QuestionGroup.answer_time}</td>
                    <td>{QuestionGroup.points}</td>
                </tr>
            )
        });
    }, [quiz]);

    const handleTiebreakCycle = () => {

    }

    const handleDisqualifyCycle = () => {
        const disqualifiedPlayerIds = disqualifiedPlayers.map(player => {
            player.is_disqualified = true;
            return player.id;
        });
        API.post('/players/disqualify-selected', {
            player_ids: disqualifiedPlayerIds
        })
        API.post(`/quiz-instances/${id}/active-question-group`, {
            question_group_id: null
        })
        setActiveQuestionGroup(null);
        setDisqualifiedPlayers(null);
    }

    return (
        <div>
            {quiz && <div>
                <h1>Currently managing game {quiz.title}</h1>
                <div style={{display: 'flex', textAlign: 'center', justifyContent: "center", width: '100%', flexDirection: "column"}}>
                <h2>Active players</h2>
                <table className="hostTable" style={{ width: '80%', margin: "auto"}}>
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
                </div>

                <div style={{margin: '10px', display: 'flex', gap: '10px', textAlign: 'center', justifyContent: "center"}}>
                    {TiebreakPlayers && <button disabled={TiebreakPlayers.length === 0} style={{ background: '#fcba03', fontWeight: 800 }}>RUN TIEBREAK CYCLE</button>}
                    <button style={{ background: '#75c4fa', fontWeight: 800 }}>SHOW LEADERBOARD</button>
                    {DisqualifiedPlayers && <button onClick={handleDisqualifyCycle} disabled={DisqualifiedPlayers.length === 0} style={{ background: '#fa5757', fontWeight: 800 }}>RUN DISQUALIFICATION CYCLE</button>}
                </div>

                <h2>Currently active question group</h2>

                <h2>Question groups</h2>
                <table className="hostTable" style={{width: '100%'}}>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Disqualify amount</th>
                            <th>Answer time</th>
                            <th>Points</th>
                            <th>Controls</th>
                        </tr>
                        {!quiz && <tr>Something went wrong. :(</tr>}
                        {quiz && getQuestionGroups}
                    </tbody>
                </table>

                <h2>Additional question groups</h2>
                <table className="hostTable" style={{width: '100%'}}>
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
            </div>}
            {!quiz && console.log("instance ID is " + id)}
        </div>
    );

}

export default AdminView;