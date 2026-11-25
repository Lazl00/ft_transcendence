import { useEffect, useState } from 'react';
import './MainMenuPage.css';
import type { Screen } from './PageTypes';
import type { PlayerSession } from './PlayerSession';

interface HomeScreenProps {
  onSelectView: (view: Screen) => void;
  screen: Screen;
  player: PlayerSession;
  balanceRefreshKey: number;
  onLogout: () => void;
}

interface PlayerBalance {
  id: number;
  money: number;
}

function isPlayerBalance(value: unknown): value is PlayerBalance {
  return typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'number'
    && 'money' in value
    && typeof value.money === 'number';
}

function MainMenuPage({ onSelectView, screen, player, onLogout, balanceRefreshKey }: HomeScreenProps) {
  const [coinCount, setCoinCount] = useState<number | null>(null);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [coinError, setCoinError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCoinCount() {
      try {
        // Fetch by the logged-in player's ID instead of showing the first player's balance.
        const response = await fetch(`/api/players/${player.id}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Could not load player balance (HTTP ${response.status}).`);
        }

        const result: unknown = await response.json();
        if (!isPlayerBalance(result) || result.id !== player.id) {
          throw new Error('The server returned an unexpected player profile.');
        }

        setCoinError(null);
        setCoinCount(result.money);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setCoinError(loadError instanceof Error ? loadError.message : 'Could not load player balance.');
      } finally {
        if (!controller.signal.aborted) setIsLoadingCoins(false);
      }
    }

    void loadCoinCount();
    return () => controller.abort();
  }, [player.id, balanceRefreshKey]);

  return (
    <div className="home">
      <div className="home-menu">
        <div className="menu-side menu-left">
          <button className="menu-button nav-button" onClick={() => onSelectView('stats')}><i className="fa-solid fa-list"></i></button>
          <button className="menu-button nav-button" onClick={() => onSelectView('replay')}><i className="fa-solid fa-arrow-rotate-left"></i></button>
        </div>
        {screen !== 'new-game' && (
          <h1 className="home-title">Pokipo</h1>
        )}
        {screen === 'new-game' && (
          <p className="small-title">Pokipo</p>
        )}
        <div className="menu-side menu-right">
          <div className="player-identity">
            <span>{player.username}</span>
            <button className="logout-button" onClick={onLogout}>Log out</button>
          </div>
          <p className="coin-count" aria-label={`${player.username}'s coins`}>
            {isLoadingCoins ? '...' : coinCount === null ? '—' : coinCount}
          </p>
          <img className="coin-icon" src="/imgs/money/money.png" alt="Pokipo Logo" />
          <button className="menu-button nav-button" onClick={() => onSelectView('shop')}><i className="fa-solid fa-cart-shopping"></i></button>
        </div>
      </div>
      {coinError && <p role="alert">{coinError}</p>}
      {screen === 'menu' && (
        <button className="menu-button play-button" onClick={() => onSelectView('new-game')}><i className="fa-solid fa-play"></i></button>
      )}
    </div>
  );
};

export default MainMenuPage;