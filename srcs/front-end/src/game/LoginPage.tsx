import { useState, type FormEvent } from 'react';
import { isPlayerSession, type PlayerSession } from './PlayerSession';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (player: PlayerSession) => void;
}

function isPlayerList(value: unknown): value is PlayerSession[] {
  return Array.isArray(value) && value.every(isPlayerSession);
}

async function findPlayer(username: string): Promise<PlayerSession> {
  // The existing create endpoint reports duplicate usernames as 409; use its list endpoint to resume that player.
  const response = await fetch('/api/players');
  if (!response.ok) {
    throw new Error(`Could not find your player account (HTTP ${response.status}).`);
  }

  const result: unknown = await response.json();
  if (!isPlayerList(result)) {
    throw new Error('The server returned player data in an unexpected format.');
  }

  const player = result.find((candidate) => candidate.username === username);
  if (!player) {
    throw new Error('That username already exists, but its player profile could not be found.');
  }
  return player;
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Enter a username to continue.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      let player: PlayerSession;
      if (response.status === 409) {
        // A returning username is matched to its existing database profile.
        player = await findPlayer(trimmedUsername);
      } else {
        if (!response.ok) {
          throw new Error(`Could not create your player account (HTTP ${response.status}).`);
        }
        const result: unknown = await response.json();
        if (!isPlayerSession(result)) {
          throw new Error('The server returned an unexpected player profile.');
        }
        player = result;
      }

      // App stores the selected player and switches from this form into the game.
      onLogin(player);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-page" aria-labelledby="login-title">
      <h1 id="login-title">Pokipo</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Enter your username to play</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          maxLength={32}
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
        />
        <p className="login-note">Temporary login: no password is required.</p>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Play'}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
