import { useEffect, useState } from 'react';
import './StatsPage.css';

interface MatchStats {
  id: number;
  duration_seconds: number;
  is_winner: boolean;
  death_count: number;
}

function isMatchStatsList(value: unknown): value is MatchStats[] {
  return Array.isArray(value) && value.every((match) =>
    typeof match === 'object'
    && match !== null
    && 'id' in match
    && typeof match.id === 'number'
    && 'duration_seconds' in match
    && typeof match.duration_seconds === 'number'
    && 'is_winner' in match
    && typeof match.is_winner === 'boolean'
    && 'death_count' in match
    && typeof match.death_count === 'number'
  );
}

function StatsPage() {
  const [matches, setMatches] = useState<MatchStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMatches() {
      try {
        const response = await fetch('/api/me/matches', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Could not load match stats (HTTP ${response.status}).`);
        }

        const result: unknown = await response.json();
        if (!isMatchStatsList(result)) {
          throw new Error('The server returned match stats in an unexpected format.');
        }

        setMatches(result);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load match stats.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadMatches();
    return () => controller.abort();
  }, []);

  return (
    <div className="stats">
      {isLoading && <p role="status">Loading stats...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && matches.length === 0 && <p>No games played yet.</p>}
      {!isLoading && !error && matches.length > 0 && (
        <table className="stats-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Time</th>
              <th>Win</th>
              <th>Death</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id}>
                <td>Game {match.id}</td>
                <td>{match.duration_seconds}s</td>
                <td>{match.is_winner ? 'Yes' : 'No'}</td>
                <td>{match.death_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StatsPage;