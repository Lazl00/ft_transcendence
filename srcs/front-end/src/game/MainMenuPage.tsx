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
          <button className="menu-button nav-button" onClick={() => onSelectView('stats')}>Stats</button>
          <button className="menu-button nav-button" onClick={() => onSelectView('replay')}>Replay</button>
        </div>
        <button className="menu-button play-button" onClick={() => onSelectView('new-game')}>New Game</button>
        <div className="menu-side menu-right">
          <button className="menu-button nav-button" onClick={() => onSelectView('shop')}>Shop</button>
        </div>
      </div>
      {screen === 'menu' && <h1 className="home-title">Pokipo</h1>}
    </div>
  );
};

export default MainMenuPage;