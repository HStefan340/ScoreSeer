import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { Match } from "../types";

function MatchesPage()
{
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
                    <li key = {m.id}>
                        {m.homeTeam} vs {m.awayTeam} - {m.league} ({m.status})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MatchesPage;