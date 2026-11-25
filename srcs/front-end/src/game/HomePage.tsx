import { useState, useCallback } from 'react';
import Game from './Game';
import './HomePage.css';
//import ColorGrid, { placeholderMap } from './ColorGrid';
import MainMenuPage from './MainMenuPage';
import StatsPage from './StatsPage';
import type { Screen } from './PageTypes';
import ShopPage from './ShopPage';
import type { PlayerSession } from './PlayerSession';

// The HomePage component manages the navigation between different screens of the game.
interface HomePageProps {
    player: PlayerSession;
    onLogout: () => void;
}

function HomePage({ player, onLogout }: HomePageProps) {
    const [currentView, setCurrentView] = useState<Screen>('menu');
    const [balanceRefreshKey, setCounter] = useState(0); // Dummy state to force re-render when needed

    const onResultSaved = useCallback(() => setCounter((prev) => prev + 1), []); // Function to force re-render

    // Function to render the appropriate screen based on the current state
    const renderScreen = () => {
        // Pass the same selected player into each screen that shows player-specific information.
        switch (currentView) {
            case 'menu':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />
                </>;
            case 'new-game':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />
                    {/* <ColorGrid map={placeholderMap} /> */}
					<Game playerId={player.id} onResultSaved={onResultSaved} />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>;
                </>;
            case 'replay':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />
                    <h2>Replay</h2>
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'stats':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />
                    <h2>Stats Screen</h2>
                    <StatsPage player={player} />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'shop':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />
                    <ShopPage />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            default:
                return <MainMenuPage onSelectView={setCurrentView} screen={currentView} player={player} onLogout={onLogout} balanceRefreshKey={balanceRefreshKey} />;
        }
    };

    // Rendering the HomePage component with the current screen and title
    return (
        <div className="home-page">
            {renderScreen()}
        </div>
    );
}

export default HomePage;
