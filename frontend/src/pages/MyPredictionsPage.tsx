import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { MyPredictionEntry } from '../types';
import './MyPredictionsPage.css';

function MyPredictionsPage()
{
    const { token } = useAuth();
    const [predictions, setPredictions] = useState< MyPredictionEntry[] >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState< string| null >(null);
    
    const loadPredictions = useCallback(() =>
    {
        apiGet< MyPredictionEntry[] >('/predictions/mine', token ?? undefined)
            .then((data) =>
            {
                setPredictions(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load predictions.');
                setLoading(false);
            });
    }, [token]);

    useEffect(() =>
    {
        loadPredictions();
    }, [loadPredictions]);

    return (
        <div className = "my-predictions">
            <h1>My Predictions</h1>

            {loading ? (
                <p>Loading prediction...</p>
            ) : error ? (
                <p className = "error-text"> {error} </p>
            ): predictions.length === 0 ? (
                <p>You haven't made any predictions yet.</p>
            ) : (
                predictions.map((p) => (
                    <div key = {p.id} className = "prediction-card">
                        <strong>{p.homeTeam} vs {p.awayTeam}</strong>
                        <div>Your prediction: {p.predictedHomeScore} - {p.predictedAwayScore}</div>

                        {p.matchStatus === 'finished' ? (
                            <div>
                                Final result: {p.actualHomeScore} - {p.actualAwayScore}
                                {' - '}
                                {p.pointsAwarded !== null ? (
                                    <strong>{p.pointsAwarded} point(s)</strong>
                                ) : (
                                    <span>Not scored yet,</span>
                                )}
                            </div>
                        ) : (
                            <div>Match not played yet</div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default MyPredictionsPage;