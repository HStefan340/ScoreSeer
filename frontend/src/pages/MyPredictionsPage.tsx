import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { MyPredictionEntry } from '../types';
import { teamColor, teamInitials } from '../utils/teams';
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
        <div className = "mypred-page">
            <h1 className = "mypred-title"> MY PREDICTIONS </h1>

            {loading ? (
                <p className = "mypred-status"> Loading predictions... </p>
            ) : error ? (
                <p className = "mypred-status mypred-error"> {error} </p>
            ) : predictions.length === 0 ? (
                <p className = "mypred-status"> You haven't made any predictions yet. </p>
            ) : (
                <div className = "mypred-list">
                    {predictions.map((p) => 
                    {
                        const finished = p.matchStatus === 'finished';
                        const pts = p.pointsAwarded;

                        return(
                            <div key = {p.id} className = "mypred-card">
                                {/* Teams */}
                                <div className = "mypred-teams">
                                    <span className = "team-logo" style = {{ background: teamColor(p.homeTeam) }}>
                                        {teamInitials(p.homeTeam)}
                                    </span>
                                    <span className = "mypred-team-name"> {p.homeTeam} </span>
                                    <span className = "mypred-vs"> vs </span>
                                    <span className = "team-logo" style = {{ background: teamColor(p.awayTeam) }}>
                                        {teamInitials(p.awayTeam)}
                                    </span>
                                    <span className = "mypred-team-name"> {p.awayTeam} </span>
                                </div>

                                {/* Prediction + result */}
                                <div className = "mypred-right">
                                    <div className = "mypred-block">
                                        <div className = "mypred-block-label"> YOUR PICK </div>
                                        <div className = "mypred-block-score mypred-pick-score">
                                            {p.predictedHomeScore} : {p.predictedAwayScore}
                                        </div>
                                    </div>

                                    {finished ? (
                                        <>
                                            <div className = "mypred-block">
                                                <div className = "mypred-block-label"> FINAL </div>
                                                <div className = "mypred-block-score">
                                                    {p.actualHomeScore} : {p.actualAwayScore}
                                                </div>
                                            </div>

                                            <span className = {`mypred-pts ${pts === 3 ? 'pts-3' : pts === 1 ? 'pts-1' : 'pts-0'}`}>
                                                + {pts ?? 0} PTS
                                            </span>
                                        </>
                                    ) : (
                                        <span className = "mypred-pending"> Not played yet. </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyPredictionsPage;