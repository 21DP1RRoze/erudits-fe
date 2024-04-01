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
        });
        API.get(`/quiz-instances/${id}/players`).then((response) => {
            setPlayers(response.data);
        });
        API.get(`/players`).then((response) => {
            setLoadedPlayers(response.data.data);
            console.log(response.data.data);
        });
    }, [id]);


    useEffect(() => {
        if (!loadedPlayers) return;
        const pollingInterval = 2000; // 2 seconds in milliseconds
        const pollInterval = setInterval(() => {
            API.get(`/players`).then((response) => {
                const sortedArr2 = loadedPlayers.slice().sort();
                const sortedArr1 = response.data.data.slice().sort();

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
        }

        const advPlayers = activePlayers.filter(player => {
            return !disqPlayers.includes(player) && !tiePlayers.includes(player);
        });

        // Update states accordingly
        setDisqualifiedPlayers(disqPlayers);
        setTiebreakerPlayers(tiePlayers);
        setAdvancedPlayers(advPlayers);
    }, [activePlayers]);

    const PlayerAnswers = ({ questionGroupId }) => {
        if (!activePlayers) return null;

        // Filter players based on whether they have answers for the specified question group
        const filteredPlayers = activePlayers.filter(player =>
            player.player_answers.some(answer => answer.question_group_id === questionGroupId)
        );

        // Map filtered players to display their answers for the specified question group
        const playerAnswerList = filteredPlayers.map((Player, playerIndex) => {
            // Filter player answers to include only those for the specified question group
            const playerAnswersForGroup = Player.player_answers
                .filter(answer => answer.question_group_id === questionGroupId);

            // Map player answers for the specified group to table cells
            const PlayerSetAnswers = playerAnswersForGroup.map(PlayerAnswer => (
                <td key={PlayerAnswer.id} className={PlayerAnswer.answer.is_correct ? 'success-row' : 'danger-row'}>
                    {PlayerAnswer.answer.text}
                </td>
            ));

            // Render player name along with their answers for the specified group
            return (
                <tr key={Player.id}>
                    <td>{Player.name}</td>
                    {PlayerSetAnswers}
                </tr>
            );
        });

        // Render the table containing player names and their answers for the specified group
        return (
            <table>
                <thead>
                    <tr>
                        <th>Player name</th>
                        {/* Assuming each player has the same number of answers */}
                        {activeQuestionGroup.questions.map(question => (
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

    const QuestionGroups = useMemo(() => {
        if (!quiz) return null;
        return quiz.question_groups.map(function (QuestionGroup, questionGroupIndex) {
            if (QuestionGroup.is_additional) return null;
            return (
                <React.Fragment key={QuestionGroup.id}>
                    <tr onClick={() => toggleRow(QuestionGroup.id)} style={{ cursor: 'pointer' }} className={QuestionGroup.id === activeQuestionGroup.id ? 'success-row' : ''}>
                        <td>{questionGroupIndex}</td>
                        <td>{QuestionGroup.title}</td>
                        <td>{QuestionGroup.disqualify_amount}</td>
                        <td>{QuestionGroup.answer_time}</td>
                        <td>{QuestionGroup.points}</td>
                    </tr>
                    {expandedRow === QuestionGroup.id && (
                        <tr>
                            <td colSpan={5}>
                                <PlayerAnswers questionGroupId={QuestionGroup.id} />
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )
        });
    }, [quiz, expandedRow]);

    const AdditionalQuestionGroups = useMemo(() => {
        if (!quiz) return null;
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
        <>
            {quiz && <div>
                <h1>Currently managing game {quiz.title}</h1>
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
            </div>}
            {!quiz && console.log("instance ID is " + id)}
        </>
    );

}

export default AdminView;