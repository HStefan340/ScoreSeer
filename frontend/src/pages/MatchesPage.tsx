import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { Match } from "../types";
import './MatchesPage.css';

function MatchesPage()
{
    const { token } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        apiGet<Match[]>('/matches')
            .then((data) => {
                setMatches(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if(loading) return <p>Loading matches...</p>

    return(
        <div>
            <h1>Matches</h1>
            <ul>
                {matches.map((m) =>(
                    <MatchCard key = {m.id} match = {m} token = {token} />
                ))}
            </ul>
        </div>
    );
}

// A single match with a predicition form
function MatchCard( { match, token}: { match: Match; token: string | null })
{
    const [home, setHome] = useState('');
    const [away, setAway] = useState('');
    const [message, setMessage] = useState< string | null >(null);

    const isUpcoming = match.status === 'scheduled';

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
                    <button onClick = {submitPrediction}>Predict</button>
                    {message && <span> {message}</span>}
                    </div>
            )}
        </div>
    )
}

export default MatchesPage;