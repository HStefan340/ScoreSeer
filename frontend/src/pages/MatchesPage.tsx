import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { Match, Prediction } from "../types";
import './MatchesPage.css';

function MatchesPage()
{
    const { token } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyFollowed, setOnlyFollowed] = useState(false);

    useEffect(() =>{

        const endpoint = onlyFollowed ? '/matches/followed' : '/matches'
        apiGet<Match[]>(endpoint, token ?? undefined)
            .then((data) => {
                setMatches(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [onlyFollowed, token]);

    if(loading) return <p>Loading matches...</p>

    return(
        <div>
            <h1>Matches</h1>
            
            {/* Filter Toggle */}
            <div className = "matches-filtered">

                <button onClick = {() => setOnlyFollowed(false)} disabled = {!onlyFollowed}> All Matches </button>
                <button onClick = {() => setOnlyFollowed(true)} disabled = {onlyFollowed}> Matches form my leagues only </button>

            </div>

            {matches.length === 0 ? (
                <p>No matches to show</p>
            ) : (
                matches.map((m) =>(
                    <MatchCard key = {m.id} match = {m} token = {token} />
                ))
            )}
        </div>
    );
}

// A single match with a predicition form
function MatchCard( { match, token}: { match: Match; token: string | null })
{
    const [home, setHome] = useState('');
    const [away, setAway] = useState('');
    const [message, setMessage] = useState< string | null >(null);

    // The user's existing prediction (null if none yet)
    const [existing, setExisting] = useState< Prediction | null >(null);

    // Whether the edit form is open
    const [editing, setEditing] = useState(false);

    const isUpcoming = match.status === 'scheduled';

    // On load, check if the user already predicted this match
    useEffect(() => 
    {
        if(!isUpcoming)
            return;

        apiGet< Prediction >(`/predictions/match/${match.id}`, token ??  undefined)
            .then((data) => 
            {
                setExisting(data);
                setHome(String(data.predictedHomeScore));
                setAway(String(data.predictedAwayScore));
            })
            .catch(() =>
            {
                // 404 = no prediction yet, that's fine
            });
    }, [match.id, token, isUpcoming]);

    async function submitPrediction()
    {
        if(home === '' || away === '')
        {
            setMessage('Enter both scores.');
            return;
        }

        try{
            await apiPost(
                '/predictions',
                {
                    matchId: match.id,
                    predictedHomeScore: Number(home),
                    predictedAwayScore: Number(away),
                },
                token ?? undefined
            );

            setMessage('Prediction saved!');

            // Update the local "existing" state so the card reflects it
            setExisting(
                {
                    id: existing?.id ?? 0,
                    matchId: match.id,
                    predictedHomeScore: Number(home),
                    predictedAwayScore: Number(away),
                    pointsAwarded: null,
                });
            setEditing(false);
        }
        catch{
            setMessage('Could not save prediction.');
        }
    }

    return (
        <div className = "match-card">
            <strong>{match.homeTeam} vs {match.awayTeam}</strong>
            <span> - {match.league} ({match.status})</span>

            {match.status === 'finished' && (
                <p>Final Result: {match.homeScore} - {match.awayScore}</p>
            )}

            {isUpcoming && (
                <div>
                    {existing && !editing ? (
                        // Show the existing prediction with an edit button
                        <div>
                            <span>Your prediction: {existing.predictedHomeScore} - {existing.predictedAwayScore}</span>
                            <button onClick = {() => setEditing(true)}> Edit</button>
                        </div>
                    ) : (
                        // Show the input form (new prediction or editing)
                        <div>                        
                            <input
                                type = "number"
                                min = "0"
                                placeholder = "0"
                                value = {home}
                                onChange = {(e) => setHome(e.target.value)}
                                className = "score-input"
                            />
                            {' - '}
                            <input
                                type = "number"
                                min = "0"
                                placeholder = "0"
                                value = {away}
                                onChange = {(e) => setAway(e.target.value)}
                                className = "score-input"
                            />

                        <button onClick = {submitPrediction}>{existing ? 'Update' : 'Predict'}</button>
                        {message && <span> {message}</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MatchesPage;