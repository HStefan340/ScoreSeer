import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { LeaderboardEntry, Group } from '../types';
import './GroupDetailPage.css';

function GroupDetailPage()
{
    const { token, user } = useAuth();
    const { id } = useParams(); // group id from the URL
    const [leaderboard, setLeaderboard] = useState< LeaderboardEntry[] >([]);
    const [groupName, setGroupName] = useState< string >('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string | null >(null);

    const loadLeaderboard = useCallback(() =>
    {
        apiGet< LeaderboardEntry[] >(`/groups/${id}/leaderboard`, token ?? undefined)
            .then((data) => 
            {
                setLeaderboard(data);
                setLoading(false);
            })
            .catch(() =>
            {
                setError('Could not load the leaderboard.');
                setLoading(false);
            });
    }, [id, token]);

    const loadGroupName = useCallback(() => 
    {
        apiGet< Group[] >('/groups/mine', token ?? undefined)
            .then((groups) => 
            {
                const g = groups.find((gr) => String(gr.id) === id);
                if(g) setGroupName(g.name);
            })
            .catch(() => {});
    }, [id, token]);

    useEffect(() => 
    {
        loadLeaderboard();
        loadGroupName();
    }, [loadLeaderboard, loadGroupName]);

    return(
        <div className = "group-detail">
            <Link to = "/groups" className = "back-link"> ← Back to groups </Link>
            {groupName && <div className = "detail-kicker"> {groupName} </div>}
            <h1 className = "detail-title"> LEADERBOARD </h1>

            {loading ? (
                <p className = "detail-status"> Loading leaderboard... </p>
            ) : error ? (
                <p className = "detail-status detail-error"> {error} </p>
            ) : leaderboard.length === 0 ? (
                <p className = "detail-status"> No members yet. </p>
            ) : (
                <div className = "leaderboard">
                    <div className = "lb-head">
                        <span> # </span>
                        <span> Player </span>
                        <span><span className = "lb-full"> Points </span><span className = "lb-abbr"> PTS </span></span>
                        <span><span className = "lb-full"> Predictions </span><span className = "lb-abbr"> PRED </span></span>
                    </div>

                    {leaderboard.map((entry, index) =>
                    {
                        const isMe = entry.id === user?.id;
                        return(
                            <div key = {entry.id} className = {`lb-row ${isMe ? 'lb-row-me' : ''}`}>
                                <span className = {`lb-rank ${index === 0 ? 'lb-rank-first' : ''}`}> {index + 1} </span>
                                <span className = "lb-player">
                                    {entry.username} {isMe && <span className = "lb-you"> YOU </span>}
                                </span>

                                <span className = "lb-points"> {entry.totalPoints} </span>
                                <span className = "lb-preds"> {entry.predictionsScored} </span>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}

export default GroupDetailPage;