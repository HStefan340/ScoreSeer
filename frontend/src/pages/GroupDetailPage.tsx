import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { LeaderboardEntry } from '../types';
import './GroupDetailPage.css';
import InviteMember from '../components/InviteMember';

function GroupDetailPage()
{
    const { token } = useAuth();
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
            <Link to = "/groups">← Back to groups</Link>
            <h1>Leaderboard</h1>

            {loading ? (
                <p>Loading leaderboard...</p>
            ) : error ? (
                <p className = "error-text"> {error} </p>
            ): leaderboard.length === 0 ? (
                <p>No members yet.</p>
            ) : (
                <table className = "leaderboard-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Point</th>
                            <th>Predictions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) =>(
                            <tr key = {entry.id}>
                                <td>{index + 1}</td>
                                <td>{entry.username}</td>
                                <td>{entry.totalPoints}</td>
                                <td>{entry.predictionScored}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {id && < InviteMember groupId = {id} />}
        </div>
    );
}

export default GroupDetailPage;