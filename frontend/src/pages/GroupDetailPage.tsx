import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { LeaderboardEntry } from '../types';
import './GroupDetailPage.css';

function GroupDetailPage()
{
    const { token, user } = useAuth();
    const { id } = useParams(); // group id from the URL
    const [leaderboard, setLeaderboard] = useState< LeaderboardEntry[] >([]);
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

    useEffect(() => 
    {
        loadLeaderboard();
    }, [loadLeaderboard]);

    return(
        <div className = "group-detail">
            <Link to = "/groups" className = "back-link"> ← Back to groups </Link>
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
                        <span> Points </span>
                        <span> Predictions </span>
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