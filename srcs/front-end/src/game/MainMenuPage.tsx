import { useEffect, useState } from 'react';
import './MainMenuPage.css';
import type { Screen } from './PageTypes';

interface HomeScreenProps {
  onSelectView: (view: Screen) => void;
  screen: Screen;
}

interface PlayerBalance {
  id: number;
  money: number;
}

function isPlayerBalanceList(value: unknown): value is PlayerBalance[] {
  return Array.isArray(value) && value.every((player) =>
    typeof player === 'object'
    && player !== null
    && 'id' in player
    && typeof player.id === 'number'
    && 'money' in player
    && typeof player.money === 'number'
  );
}

function MainMenuPage({ onSelectView, screen }: HomeScreenProps) {
  const [coinCount, setCoinCount] = useState<number | null>(null);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [coinError, setCoinError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCoinCount() {
      try {
        const response = await fetch('/api/players', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Could not load player balance (HTTP ${response.status}).`);
        }

        const result: unknown = await response.json();
        if (!isPlayerBalanceList(result)) {
          throw new Error('The server returned player data in an unexpected format.');
        }

        setCoinCount(result[0]?.money ?? null);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setCoinError(loadError instanceof Error ? loadError.message : 'Could not load player balance.');
      } finally {
        if (!controller.signal.aborted) setIsLoadingCoins(false);
      }
    }

    void loadCoinCount();
    return () => controller.abort();
  }, []);

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
          <p className="coin-count" aria-label="First player's coins">
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