import { useState } from 'react';
import './HomePage.css';
import ColorGrid, { placeholderMap } from './ColorGrid';

// The HomePage component manages the navigation between different screens of the game.
function HomePage() {
    // Defining the types for the different screens in the game
    type Screen = 'menu' | 'new-game' | 'join-game' | 'stats' | 'shop';

    // State to keep track of the current screen
    const [screen, setScreen] = useState<Screen>('menu');

    // Handlers to switch between different screens
    const handleNewGame = () => setScreen('new-game');
    const handleJoinGame = () => setScreen('join-game');
    const handleViewStats = () => setScreen('stats');
    const handleShop = () => setScreen('shop');

    // Function to render the appropriate screen based on the current state
    const renderScreen = () => {
        switch (screen) {
            case 'menu':
                return <nav className="home-menu">
                            <button className="menu-button" onClick={handleNewGame}>New game</button>
                            <button className="menu-button" onClick={handleJoinGame}>Join game</button>
                            <button className="menu-button" onClick={handleViewStats}>View stats</button>
                            <button className="menu-button" onClick={handleShop}>Shop</button>
                        </nav>;
            case 'new-game':
                return <>
                    <ColorGrid map={placeholderMap} />
                    <button className="menu-button back-button" onClick={() => setScreen('menu')}>
                        Back
                    </button>
                </>;
            case 'join-game':
                return <>
                    <h2>Join Game Screen</h2>
                    <button className="menu-button back-button" onClick={() => setScreen('menu')}>
                        Back
                    </button>
                </>;
            case 'stats':
                return <>
                    <h2>Stats Screen</h2>
                    <button className="menu-button back-button" onClick={() => setScreen('menu')}>
                        Back
                    </button>
                </>;
            case 'shop':
                return <>
                    <h2>Shop Screen</h2>
                    <button className="menu-button back-button" onClick={() => setScreen('menu')}>
                            Back
                    </button>
                </>;
            default:
                return null;
        }
    };

    // Rendering the HomePage component with the current screen and title
    return (
        <div className="home">
            {screen === 'menu' && <h1 className="home-title">Transcendence</h1>}

            {renderScreen()}
        </div>
    );
}

export default HomePage;