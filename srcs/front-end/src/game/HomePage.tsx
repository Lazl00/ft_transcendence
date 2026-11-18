import { useState } from 'react';
import './HomePage.css';
import ColorGrid, { placeholderMap } from './ColorGrid';
import MainMenuPage from './MainMenuPage';
import StatsPage from './StatsPage';
import type { Screen } from './PageTypes';
import ShopPage from './ShopPage';

// The HomePage component manages the navigation between different screens of the game.
function HomePage() {
    const [currentView, setCurrentView] = useState<Screen>('menu');

    // Function to render the appropriate screen based on the current state
    const renderScreen = () => {
        switch (currentView) {
            case 'menu':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                </>;
            case 'new-game':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <ColorGrid map={placeholderMap} />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>;
                </>;
            case 'replay':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <h2>Replay</h2>
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'stats':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <h2>Stats Screen</h2>
                    <StatsPage />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'shop':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <ShopPage />
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            default:
                return <MainMenuPage onSelectView={setCurrentView} screen={currentView} />;
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