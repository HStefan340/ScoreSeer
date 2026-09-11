import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { League } from '../types';
import './LeaguesPage.css';

function LeaguesPage()
{
    const { token } = useAuth();
    const [allLeagues, setAllLeagues] = useState< League[] >([]);
    const [followedIds, setFollowedIds] = useState< number[] >([]);
    const [loading, setLoading] = useState(true);

    const loadLeagues = useCallback(() =>
    {
        // Load all leagues and the followed ones together
        Promise.all([
            apiGet< League[] >('/leagues', token ?? undefined),
            apiGet < League[] >('/leagues/mine', token ?? undefined),
        ])
            .then(([all, followed]) =>
            {
                setAllLeagues(all);
                setFollowedIds(followed.map((l) => l.id));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    useEffect(() => 
    {
        loadLeagues();
    }, [loadLeagues]);

    async function follow(leagueId: number)
    {
        try{
            await apiPost(`/leagues/${leagueId}/follow`, {}, token ?? undefined);
            loadLeagues();
        }
        catch{
            // ignore for now
        }
    }

    async function unfollow(leagueId: number)
    {
        try{
            await apiDelete(`/leagues/${leagueId}/follow`, token ?? undefined);
            loadLeagues();
        }
        catch{
            // ignore for now
        }
    }

    if(loading) return <p className = "leagues-status"> Loading leagues... </p>;

    return (
        <div className = "leagues-page">
            <div className = "leagues-kicker"> STAY UP TO DATE </div>
            <h1 className = "leagues-title"> LEAGUES </h1>

            <div className = "leagues-list">
                {allLeagues.map((league) => 
                {
                    const isFollowed = followedIds.includes(league.id);

                    return(
                        <div key = {league.id} className = "league-card">
                            <div className = "league-info">
                                <span className = "league-logo"> {league.name.slice(0, 2).toUpperCase()} </span>
                                <div>
                                    <div className = "league-name"> {league.name} </div>
                                    <div className = "league-country"> {league.country} </div>
                                </div>
                            </div>

                            {isFollowed ? (
                                <button className = "league-following" onClick = {() => unfollow(league.id)} >
                                    Unfollow
                                </button>
                            ) : (
                                <button className = "league-follow" onClick = {() => follow(league.id)}>
                                    Follow
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LeaguesPage;