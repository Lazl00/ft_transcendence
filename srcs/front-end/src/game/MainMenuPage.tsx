import './MainMenuPage.css';
import type { Screen } from './PageTypes';

interface HomeScreenProps {
  onSelectView: (view: Screen) => void;
  screen: Screen;
}

function MainMenuPage({ onSelectView, screen }: HomeScreenProps) {
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
          <p className="coin-count">1000</p>
          <img className="coin-icon" src="/imgs/money/money.png" alt="Pokipo Logo" />
          <button className="menu-button nav-button" onClick={() => onSelectView('shop')}><i className="fa-solid fa-cart-shopping"></i></button>
        </div>
      </div>
      {screen === 'menu' && (
        <button className="menu-button play-button" onClick={() => onSelectView('new-game')}><i className="fa-solid fa-play"></i></button>
      )}
    </div>
  );
};

export default MainMenuPage;