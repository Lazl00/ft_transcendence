import { useState } from 'react';
import './App.css';
import HomePage from './game/HomePage';
import LoginPage from './game/LoginPage';
import { isPlayerSession, type PlayerSession } from './game/PlayerSession';

const SESSION_KEY = 'pokipo-player';

// Restore the selected player after a reload; discard malformed stored data.
function readStoredPlayer(): PlayerSession | null {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) return null;

    try {
        const parsed: unknown = JSON.parse(savedSession);
        if (isPlayerSession(parsed)) return parsed;
    } catch {
        // A malformed saved session should send the user back to the login page.
    }

    localStorage.removeItem(SESSION_KEY);
    return null;
}

function App() {
    const [player, setPlayer] = useState<PlayerSession | null>(readStoredPlayer);

    function handleLogin(newPlayer: PlayerSession) {
        // This is a browser-side session only; it does not verify the player's identity.
        localStorage.setItem(SESSION_KEY, JSON.stringify(newPlayer));
        setPlayer(newPlayer);
    }

    function handleLogout() {
        localStorage.removeItem(SESSION_KEY);
        setPlayer(null);
    }

    return (
        <main>
            {/* Keep the game behind the username prompt until a player is selected. */}
            {player
                ? <HomePage player={player} onLogout={handleLogout} />
                : <LoginPage onLogin={handleLogin} />}
        </main>
    );
}

export default App;