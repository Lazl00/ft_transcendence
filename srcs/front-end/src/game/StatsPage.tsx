import { useEffect, useState } from 'react';
import './StatsPage.css';

interface Player {
  id: number;
  username: string;
}

interface PlayerMatch {
  match_id: number;
  is_winner: boolean;
  gamemode: 'default';
  status: 'finished' | 'abandoned';
  started_at: string;
  finished_at: string;
}

function isPlayerList(value: unknown): value is Player[] {
  return Array.isArray(value) && value.every((player) =>
    typeof player === 'object'
    && player !== null
    && 'id' in player
    && typeof player.id === 'number'
    && 'username' in player
    && typeof player.username === 'string'
  );
}

function isPlayerMatchList(value: unknown): value is PlayerMatch[] {
  return Array.isArray(value) && value.every((match) =>
    typeof match === 'object'
    && match !== null
    && 'match_id' in match
    && typeof match.match_id === 'number'
    && 'is_winner' in match
    && typeof match.is_winner === 'boolean'
    && 'gamemode' in match
    && match.gamemode === 'default'
    && 'status' in match
    && (match.status === 'finished' || match.status === 'abandoned')
    && 'started_at' in match
    && typeof match.started_at === 'string'
    && 'finished_at' in match
    && typeof match.finished_at === 'string'
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function StatsPage() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMatches() {
      try {
        const playersResponse = await fetch('/api/players', {
          signal: controller.signal,
        });
        if (!playersResponse.ok) {
          throw new Error(`Could not load players (HTTP ${playersResponse.status}).`);
        }

        const playersResult: unknown = await playersResponse.json();
        if (!isPlayerList(playersResult)) {
          throw new Error('The server returned players in an unexpected format.');
        }

        const firstPlayer = [...playersResult].sort((a, b) => a.id - b.id)[0];
        if (!firstPlayer) {
          setMatches([]);
          return;
        }
        setPlayerName(firstPlayer.username);

        const matchesResponse = await fetch(`/api/players/${firstPlayer.id}/matches`, {
          signal: controller.signal,
        });
        if (!matchesResponse.ok) {
          throw new Error(`Could not load match history (HTTP ${matchesResponse.status}).`);
        }

        const matchesResult: unknown = await matchesResponse.json();
        if (!isPlayerMatchList(matchesResult)) {
          throw new Error('The server returned match history in an unexpected format.');
        }

        setMatches(matchesResult);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load match history.');
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
      {!isLoading && !error && matches.length === 0 && (
        <p>{playerName ? `${playerName} has no match history yet.` : 'No players found.'}</p>
      )}
      {!isLoading && !error && matches.length > 0 && (
        <>
          {playerName && <h2>{playerName}'s match history</h2>}
          <table className="stats-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Game mode</th>
                <th>Status</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.match_id}>
                  <td>Game {match.match_id}</td>
                  <td>{match.gamemode}</td>
                  <td>{match.status}</td>
                  <td>{formatDateTime(match.started_at)}</td>
                  <td>{formatDateTime(match.finished_at)}</td>
                  <td>
                    {match.status === 'abandoned'
                      ? 'No result'
                      : match.is_winner ? 'Won' : 'Lost'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default StatsPage;
