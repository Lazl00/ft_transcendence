import { useEffect, useState } from 'react';
import './StatsPage.css';
import type { PlayerSession } from './PlayerSession';

interface StatsPageProps {
  player: PlayerSession;
}

interface PlayerMatch {
  match_id: number;
  is_winner: boolean;
  gamemode: 'CLASSIC';
  status: 'STARTED' | 'FINISHED' | 'ABANDONED';
  started_at: string;
  finished_at: string | null;
}

// Match fields use the database/API enum values; unfinished matches have no finish time yet.
function isPlayerMatchList(value: unknown): value is PlayerMatch[] {
  return Array.isArray(value) && value.every((match) =>
    typeof match === 'object'
    && match !== null
    && 'match_id' in match
    && typeof match.match_id === 'number'
    && 'is_winner' in match
    && typeof match.is_winner === 'boolean'
    && 'gamemode' in match
    && match.gamemode === 'CLASSIC'
    && 'status' in match
    && (match.status === 'STARTED' || match.status === 'FINISHED' || match.status === 'ABANDONED')
    && 'started_at' in match
    && typeof match.started_at === 'string'
    && 'finished_at' in match
    && (typeof match.finished_at === 'string' || match.finished_at === null)
  );
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function StatsPage({ player }: StatsPageProps) {
  const [matches, setMatches] = useState<PlayerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMatches() {
      try {
        // Request history for the selected player rather than looking up a global first player.
        const matchesResponse = await fetch(`/api/players/${player.id}/matches`, {
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
  }, [player.id]);

  return (
    <div className="stats">
      {isLoading && <p role="status">Loading stats...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && matches.length === 0 && (
        <p>{player.username} has no match history yet.</p>
      )}
      {!isLoading && !error && matches.length > 0 && (
        <>
          <h2>{player.username}'s match history</h2>
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
                    {match.status !== 'FINISHED'
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
