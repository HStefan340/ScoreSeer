import { useEffect, useState } from 'react';
import './App.css';

// The shape of a match coming from our API
interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches from the backend when the page loads
  useEffect(() => {
    fetch('http://localhost:5037/api/matches')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load matches');
        return response.json();
      })
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading matches...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>ScoreSeer — Matches</h1>
      <ul>
        {matches.map((match) => (
          <li key={match.id}>
            {match.homeTeam} vs {match.awayTeam} — {match.league} ({match.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;