import React, { useEffect, useState, useMemo } from 'react';
import API from './axiosApi';
import { useNavigate, useParams } from 'react-router-dom';

const AdminView = () => {
    const [quiz, setQuiz] = useState(null);
    const [quizInstance, setQuizInstance] = useState(null);

    const [activeQuestionGroup, setActiveQuestionGroup] = useState({ disqualify_amount: 3 });

    const [disqualifiedPlayers, setDisqualifiedPlayers] = useState(null);
    const [tiebreakerPlayers, setTiebreakerPlayers] = useState(null);
    const [advancedPlayers, setAdvancedPlayers] = useState(null);

    const [loadedPlayers, setLoadedPlayers] = useState(null);
    const [activePlayers, setActivePlayers] = useState(null);
    const [inactivePlayers, setInactivePlayers] = useState(null);

    const [players, setPlayers] = useState([]);

    const [expandedRow, setExpandedRow] = useState(null);
    const [freezePlayers, setFreezePlayers] = useState(false);

    const { id } = useParams()

    useEffect(() => {
        API.get(`/quiz-instances/${id}`).then((response) => {
            setPlayers(response.data); /// DO NOT TOUCH1!!!!
            setQuiz(response.data.data.quiz);
            setQuizInstance(response.data.data);
            setActiveQuestionGroup(response.data.data.active_question_group);
            console.log(response.data.data);

        });
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setLoadedPlayers(response.data.data);
            console.log(response.data.data)
        });
    }, [id]);


    // useEffect(() => {
    //     if (!loadedPlayers) return;
    //     const pollingInterval = 1000; // 1 second in milliseconds
    //     const pollInterval = setInterval(() => {
    //         API.get(`/quiz-instances/${id}/players`).then((response) => {
    //             setLoadedPlayers(response.data.data);
    //         });
    //
    //     }, pollingInterval);
    //     return () => clearInterval(pollInterval);
    // }, [loadedPlayers]);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getActivePlayers = useMemo(() => { //DO NOT TOUCH!!!!!!!
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
        const sortedPlayers = [...tiebreakerPlayers].sort((a, b) => {
            // Sort by points descending
            if (a.tiebreaker_points !== b.tiebreaker_points) {
                return b.tiebreaker_points - a.tiebreaker_points;
            }
            // If points are equal, sort by time difference ascending
            else {
                // Calculate time difference for the first player
                const timeDifferenceA = a.player_answers.length > 0 ? (new Date(a.player_answers[0].answered_at) - new Date(a.player_answers[0].questioned_at)) / 1000 : Infinity;

                // Calculate time difference for the second player
                const timeDifferenceB = b.player_answers.length > 0 ? (new Date(b.player_answers[0].answered_at) - new Date(b.player_answers[0].questioned_at)) / 1000 : Infinity;

                return timeDifferenceA - timeDifferenceB;
            }
        });
        return sortedPlayers.map(function (Player, playerIndex) {
            return (
                <tr className='warning-row'>
                    <td>{playerIndex}</td>
                    <td>{Player.name}</td>
                    <td>{Player.is_disqualified}</td>
                    <td>{Player.points}</td>
                    <td>{Player.tiebreaker_points}</td>
                    {Player.player_answers.length === 0 &&
                        <>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </>
                    }
                    {Player.player_answers.length > 0 && Player.player_answers.map((answer, index) => {
                        if (answer.questioned_at) {
                            const timeDifference = (new Date(answer.answered_at) - new Date(answer.questioned_at)) / 1000;
                            return (
                                <React.Fragment key={index}>
                                    <td>{answer.questioned_at}</td>
                                    <td>{answer.answered_at}</td>
                                    <td>{timeDifference} seconds</td>
                                </React.Fragment>
                            );
                        } else {
                            return (
                                <React.Fragment key={index}>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </React.Fragment>
                            );
                        }
                    })}
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

    const TiebreakPlayerTable = useMemo(() => {
        return (
            <table style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Disqualified?</th>
                        <th>Points</th>
                        <th>Tiebreaker points</th>
                        <th>Questioned at</th>
                        <th>Answered at</th>
                        <th>Time difference</th>
                    </tr>
                </thead>
                <tbody>
                    {TiebreakPlayers}
                </tbody>
            </table>
        );
    }, [TiebreakPlayers]);

    const PositionPlayers = useMemo(() => {
        if (!activePlayers || activePlayers.length === 0) return null;
        if (freezePlayers) {
            setDisqualifiedPlayers([...disqualifiedPlayers]);
            setTiebreakerPlayers([...tiebreakerPlayers]);
            setAdvancedPlayers([...advancedPlayers]);
            return null;
        }
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
                    if (disqPlayers.length === 0 && tiePlayers.length === disqualifyAmount) {
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
    }, [activePlayers, activeQuestionGroup, freezePlayers]);

    const PositionTiebreakerPlayers = () => {
        if (!tiebreakerPlayers || tiebreakerPlayers.length === 0) return null;
        setFreezePlayers(true);
        let disqualifyAmount = 0;
        if (activeQuestionGroup) disqualifyAmount = activeQuestionGroup.disqualify_amount;

        const sortedPlayers = [...tiebreakerPlayers].sort((a, b) => {
            // Helper function to calculate time difference
            const getTimeDifference = player => {
                const tiebreakerAnswer = player.player_answers.find(answer => answer.questioned_at);
                if (tiebreakerAnswer) {
                    return (new Date(tiebreakerAnswer.answered_at) - new Date(tiebreakerAnswer.questioned_at)) / 1000;
                }
                return Infinity; // Return Infinity if the player has not answered any tiebreaker questions
            };

            // Sort by points ascending and time difference descending
            if (a.tiebreaker_points !== b.tiebreaker_points) {
                return a.tiebreaker_points - b.tiebreaker_points; // Sort by points ascending
            } else {
                // If points are equal, sort by time difference descending
                const timeDifferenceA = getTimeDifference(a);
                const timeDifferenceB = getTimeDifference(b);
                return timeDifferenceB - timeDifferenceA;
            }
        });

        let disqPlayers = [];
        let tiePlayers = [];

        // Group players by whether they have answered tiebreaker questions or not
        const playersWithTiebreakerAnswers = sortedPlayers.filter(player => {
            return player.player_answers.some(answer => answer.questioned_at);
        });

        const playersWithoutTiebreakerAnswers = sortedPlayers.filter(player => {
            return !player.player_answers.some(answer => answer.questioned_at);
        });

        if (playersWithoutTiebreakerAnswers.length > 1 && disqualifyAmount < sortedPlayers.length) {
            // If there are multiple players with no tiebreaker answers and the number of players to be disqualified
            // is less than the total number of players, treat it as a tiebreaker situation between those players
            tiePlayers = [...playersWithoutTiebreakerAnswers];
        } else {
            // Proceed with regular disqualification logic
            disqPlayers = playersWithTiebreakerAnswers.slice(0, disqualifyAmount);
        }

        const advPlayers = sortedPlayers.filter(player => {
            return !disqPlayers.includes(player) && !tiePlayers.includes(player);
        });

        // Output the results in console
        console.log("Players to be disqualified total: ", disqualifyAmount);
        console.log("Disqualified players: ", disqPlayers);
        console.log("Tiebreaker players: ", tiePlayers);
        console.log("Advanced players: ", advPlayers);

        setDisqualifiedPlayers([...disqualifiedPlayers, ...disqPlayers]);
        setTiebreakerPlayers(tiePlayers);
        setAdvancedPlayers([...advancedPlayers, ...advPlayers]);
    }

    const PlayerAnswers = ({ questionGroupId }) => {
        if (!activePlayers) return null;
    
        const questionGroup = quiz.question_groups.find(group => group.id === questionGroupId);
        if (!questionGroup) return null;
    
        // Map filtered players to display their answers for the specified question group
        const playerAnswerList = activePlayers.map((Player, playerIndex) => {
            // Filter player answers to include only those for the specified question group
            const playerAnswersForGroup = Player.player_answers
                .filter(answer => answer.question_group_id === questionGroupId);
    
            const openAnswersForGroup = Player.open_answers
                ? Player.open_answers.filter(answer => answer.question_group_id === questionGroupId)
                : [];
    
            console.log("open answers", openAnswersForGroup);
    
            // Create a map of PlayerAnswer objects for quick lookup
            const playerAnswersMap = {};
            playerAnswersForGroup.forEach(answer => {
                playerAnswersMap[answer.question_id] = answer;
            });
    
            const openAnswersMap = {};
            openAnswersForGroup.forEach(answer => {
                openAnswersMap[answer.question_id] = answer;
            });
    
            const hasAnsweredAllQuestions = questionGroup.questions.every(question =>
                playerAnswersMap.hasOwnProperty(question.id)
            );
    
            // Map questions from the specified question group to table cells
            const playerSetAnswers = questionGroup.questions.map(question => {
                const playerAnswer = playerAnswersMap[question.id];
                const openAnswer = openAnswersMap[question.id];
                if (playerAnswer || openAnswer) {
                    // If PlayerAnswer exists, render the answer
                    if (question.is_open_answer) {
                        return (
                            <td key={openAnswer ? openAnswer.id : question.id}>
                                {openAnswer ? (openAnswer.answer) : '-'}
                                
                                {openAnswer && 
                                <div>
                                <hr/>
                                <select onChange={(e) => API.post(`/open-answers/${openAnswer.id}/points`, {points: e.target.value})}>
                                    <option value={0}>0</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                </select>
                                </div>}
                            </td>
                        )
                    } else {
                        return (
                            <td key={playerAnswer.id} className={playerAnswer.answer.is_correct ? 'success-row' : 'danger-row'}>
                                {playerAnswer.answer.text}
                            </td>
                        );
                    }
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
            <table style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Player name</th>
                        {/* Assuming each player has the same number of answers */}
                        {questionGroup?.questions?.length && questionGroup.questions.map(question => (
                            <th key={question.id}>Question {question.id}<br /><hr />
                                {(question.is_open_answer) ? (question.correct_answer) : 'not open answer'}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {playerAnswerList}
                </tbody>
            </table>
        );
    };
    
    
    

    const OpenAnswers = ({ questionGroupId }) => {
        if (!activePlayers) return null;

        const questionGroup = quiz.question_groups.find(group => group.id === questionGroupId);
        if (!questionGroup) return null;

        const openAnswerList = activePlayers.map((Player, playerIndex) => {
            // Filter player answers to include only those for the specified question group
            const openAnswersForGroup = Player.open_answers
                .filter(answer => answer.question_group_id === questionGroupId);
            console.log("open answers", openAnswersForGroup);

        });
    }
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
                    <tr onClick={() => toggleRow(QuestionGroup.id)} style={{ cursor: 'pointer' }} className={(quizInstance.has_question_group_ended && activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) ? 'warning-row' : ((activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) ? 'success-row' : '')}>
                        <td>{questionGroupIndex}</td>
                        <td>{QuestionGroup.title}</td>
                        <td>{QuestionGroup.disqualify_amount}</td>
                        <td>{QuestionGroup.answer_time}</td>
                        <td>{QuestionGroup.points}</td>
                        <td>
                            {(activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) &&
                                <button onClick={(e) => { e.stopPropagation(); handleStopClick() }}>Stop</button>
                            }
                            {(activeQuestionGroup == null || QuestionGroup.id !== activeQuestionGroup.id) &&
                                <button disabled={activeQuestionGroup != null} onClick={(e) => { e.stopPropagation(); handleStartClick(QuestionGroup) }}>Start</button>
                            }
                        </td>
                    </tr>
                    {expandedRow === QuestionGroup.id && (
                        <tr>
                            <td colSpan={6}>
                                <PlayerAnswers questionGroupId={QuestionGroup.id} />
                            </td>
                            <td colSpan={6}>
                                <OpenAnswers questionGroupId={QuestionGroup.id} />
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )
        });
    }, [quiz, quizInstance?.has_question_group_ended, activeQuestionGroup, expandedRow, toggleRow, handleStopClick, handleStartClick]);

    const AdditionalQuestionGroups = useMemo(() => {
        if (!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (!QuestionGroup.is_additional) return null;
            return (
                <tr key={questionGroupIndex} className={(quizInstance.has_question_group_ended && activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) ? 'warning-row' : ((activeQuestionGroup != null && QuestionGroup.id === activeQuestionGroup.id) ? 'success-row' : '')}>
                    <td>{questionGroupIndex}</td>
                    <td>{QuestionGroup.title}</td>
                    <td>{QuestionGroup.disqualify_amount}</td>
                    <td>{QuestionGroup.answer_time}</td>
                    <td>{QuestionGroup.points}</td>
                </tr>
            )
        });
    }, [activeQuestionGroup, quiz, quizInstance?.has_question_group_ended]);

    const handleTiebreakCycle = () => {
        // Set is_tiebreak on all tiebreak players to true
        const tiebreakPlayerIds = tiebreakerPlayers.map(player => {
            player.is_tiebreak = true;
            return player.id;
        });
        API.post('/players/tiebreak-selected', {
            player_ids: tiebreakPlayerIds
        });
        API.post(`quiz-instances/${id}/active-tiebreaker-question-group`).then((response) => {
            let previousQuestionGroupDisqualifyAmount = activeQuestionGroup.disqualify_amount;
            setActiveQuestionGroup(response.data.data);
            setActiveQuestionGroup(prevGroup => {
                return { ...prevGroup, disqualify_amount: previousQuestionGroupDisqualifyAmount }
            });
        });
        setFreezePlayers(true);
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
        setFreezePlayers(false);
    }

    const handleRefreshClick = () => {
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setLoadedPlayers(response.data.data);
        });
    }

    return (
        <div>
            {quiz && <div>
                <h1>Currently managing game {quiz.title}</h1>
                <button onClick={handleRefreshClick}>REFRESH</button>
                <div style={{ display: 'flex', textAlign: 'center', justifyContent: "center", width: '100%', flexDirection: "column" }}>
                    <h2>Active players</h2>
                    <table className="hostTable" style={{ width: '80%', margin: "auto" }}>
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

                <div style={{ margin: '10px', display: 'flex', gap: '10px', textAlign: 'center', justifyContent: "center" }}>
                    {quizInstance &&
                        <button onClick={() => (window.open(`/scoreboard/${id}`, '_blank').focus())} disabled={!quizInstance.has_question_group_ended} style={{ background: '#75c4fa', fontWeight: 800 }}>SHOW LEADERBOARD</button>
                    }
                    {"=>"}
                    {TiebreakPlayers && <button onClick={handleTiebreakCycle} disabled={!quizInstance.has_question_group_ended || TiebreakPlayers.length === 0} style={{ background: '#fcba03', fontWeight: 800 }}>RUN TIEBREAK CYCLE</button>}
                    {"=>"}
                    {TiebreakPlayers && <button onClick={PositionTiebreakerPlayers} disabled={!quizInstance.has_question_group_ended || TiebreakPlayers.length === 0} style={{ background: '#fcba03', fontWeight: 800 }}>CALCULATE TIEBREAKERS</button>}

                    ||
                    {DisqualifiedPlayers && <button onClick={handleDisqualifyCycle} disabled={!quizInstance.has_question_group_ended || DisqualifiedPlayers.length === 0 || TiebreakPlayers.length > 0} style={{ background: '#fa5757', fontWeight: 800 }}>RUN DISQUALIFICATION CYCLE</button>}
                </div>

                <h2>Tiebreak players</h2>
                {TiebreakPlayerTable}

                <h2>Currently active question group</h2>

                <h2>Question groups</h2>
                <table className="hostTable" style={{ width: '100%' }}>
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
                <table className="hostTable" style={{ width: '100%' }}>
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