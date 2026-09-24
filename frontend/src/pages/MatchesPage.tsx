import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { Match, Prediction } from "../types";
import { teamColor, teamInitials } from '../utils/teams';
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

    if(loading) return <p className = "matches-loading">Loading matches...</p>

    return(
        <div className = "matches-page">
            {/* Header: title + filter toggle */}
            <div className = "matches-header">
                <div>
                    <div className = "matches-kicker"> FIXTURES </div>
                    <h1 className = "matches-title"> MATCHES </h1>
                </div>

                <div className = "matches-toggle">
                    <button className = {!onlyFollowed ? 'toggle-btn toggle-active' : 'toggle-btn'}
                        onClick = {() => setOnlyFollowed(false)}> All Matches </button>

                    <button className = {onlyFollowed ? 'toggle-btn toggle-active' : 'toggle-btn'}
                        onClick = {() => setOnlyFollowed(true)}> My Leagues </button>
                </div>
            </div>

            {/* Matches list */}
            {matches.length === 0 ? (
                <p className = "matches-empty"> No matches found. </p>
            ) : (
                <div className = "matches-list">
                    {matches.map((match) => (
                        <MatchCard key = {match.id} match = {match} token = {token} />
                    ))}
                </div>
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
    const isLive = match.status === 'live' || match.status === 'half_time';

    // On load, check if the user already predicted this match
    useEffect(() => 
    {
        if(!isUpcoming && !isLive)
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
    }, [match.id, token, isUpcoming, isLive]);

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
        <div className = "match-row">
            {/* Left: league label + teams */}
            <div className = "match-info">
                <div className = "match-league">
                    {match.league} · {match.status === 'finished' ? 'FULL TIME' 
                    : isLive ? (match.status === 'half_time' ? 'HALF TIME' : 'LIVE')
                    : 'SCHEDULED'}
                </div>

                <div className = "match-teams">
                    <span className = "team-logo" style ={{background: teamColor(match.homeTeam) }}>
                        {teamInitials(match.homeTeam)}
                    </span>

                    <span className = "team-name"> {match.homeTeam} </span>

                    {match.status === 'finished' ? (
                        <span className = "match-score match-score-inline"> {match.homeScore}&nbsp;-&nbsp;{match.awayScore} </span>
                    ) : (
                        <span className = "match-vs"> vs </span>
                    )}

                    <span className = "team-logo" style ={{background: teamColor(match.awayTeam) }}>
                        {teamInitials(match.awayTeam)}
                    </span>

                    <span className = "team-name"> {match.awayTeam} </span>
                </div>
            </div>

            {/* Right: Your pick area *varies by state) */}
          
            {isLive ? (
                    //Match in progress - LIVE badge + current score + your prediction
                    <div className = "match-live">
                        <div className = "live-badge">
                            <span className = "live-dot"></span>
                            {match.status === 'half_time' ? 'HALF TIME': 'LIVE'}
                        </div>
                        <div className = "live-score"> {match.homeScore} - {match.awayScore} </div>
                        {existing && (
                            <div className = "live-pick"> Your pick: {existing.predictedHomeScore} - {existing.predictedAwayScore} </div>
                        )}
                    </div>

                ) : match.status === 'finished' ? (
                    <div className = "match-result">
                        <span className = "match-score match-score-side"> {match.homeScore} - {match.awayScore} </span>
                        <span className = "match-final-badge"> FULL TIME </span>
                    </div>
                ) : existing && !editing ? (
                    // Has a prediction - show it + edit
                    <>
                        <div className = "match-pick">
                            <div className = "pick-label-wrap">
                                <div className = "pick-label"> YOUR PICK </div>
                                <div className = "pick-values">
                                    <span className = "pick-box pick-box-set"> {existing.predictedHomeScore} </span>
                                    <span className = "pick-colon"> : </span>
                                    <span className = "pick-box pick-box-set"> {existing.predictedAwayScore} </span>
                                </div>
                            </div>
                        </div>
                        
                        <button className = "pick-btn-edit" onClick = {() => setEditing(true)}> EDIT PREDICTION </button>
                    </>
                ) : (
                    // Ready to predict (new or editing)
                    <>
                        <div className = "match-pick">
                            <div className = "pick-label-wrap">
                                <div className = "pick-label"> YOUR PICK </div>
                                <div className = "pick-values">
                                    <input
                                        type = "number"
                                        min = "0"
                                        className = {`pick-input ${home === '' ? 'pick-input-glow' : '' }`}
                                        placeholder = "-"
                                        value = {home}
                                        onChange = {(e) => setHome(e.target.value)}
                                    />

                                <span className = "pick-colon">:</span>
                                    <input
                                        type = "number"
                                        min = "0"
                                        className = "pick-input"
                                        placeholder = "-"
                                        value = {away}
                                        onChange = {(e) => setAway(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button className = "pick-btn-predict" onClick = {submitPrediction}>
                            {existing ? 'UPDATE' : 'PREDICT'}
                        </button>
                        {message && <span className = "pick-message"> {message} </span>}
                    </>
            )}
        </div>
    );
}

export default MatchesPage;