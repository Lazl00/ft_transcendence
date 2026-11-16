import { useState } from 'react';
import './HomePage.css';
import ColorGrid, { placeholderMap } from './ColorGrid';
import MainMenuPage from './MainMenuPage';
import type { Screen } from './PageTypes';

// The HomePage component manages the navigation between different screens of the game.
function HomePage() {
    const [currentView, setCurrentView] = useState<Screen>('menu');

    // Defining the types for the different screens in the game
    // type Screen = 'menu' | 'new-game' | 'join-game' | 'stats' | 'shop';

    // State to keep track of the current screen
    // const [screen, setScreen] = useState<Screen>('menu');

    // Handlers to switch between different screens
    // const handleNewGame = () => setScreen('new-game');
    // const handleJoinGame = () => setScreen('join-game');
    // const handleViewStats = () => setScreen('stats');
    // const handleShop = () => setScreen('shop');

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
            case 'join-game':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <h2>Join Game Screen</h2>
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'stats':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <h2>Stats Screen</h2>
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            case 'shop':
                return <>
                    <MainMenuPage onSelectView={setCurrentView} screen={currentView} />
                    <h2>Shop Screen</h2>
                    <button className="back-button" onClick={() => setCurrentView('menu')}>Back</button>
                </>;
            default:
                return <MainMenuPage onSelectView={setCurrentView} screen={currentView} />;
        }
    };
    // const renderScreen = () => {
    //     switch (screen) {
    //         case 'menu':
    //             return <nav className="home-menu">
    //                         <button className="menu-button" onClick={handleNewGame}>New game</button>
    //                         <button className="menu-button" onClick={handleJoinGame}>Join game</button>
    //                         <button className="menu-button" onClick={handleViewStats}>View stats</button>
    //                         <button className="menu-button" onClick={handleShop}>Shop</button>
    //                     </nav>;
    //         case 'new-game':
    //             return <>
    //                 <ColorGrid map={placeholderMap} />
    //                 <button className="menu-button back-button" onClick={() => setScreen('menu')}>
    //                     Back
    //                 </button>
    //             </>;
    //         case 'join-game':
    //             return <>
    //                 <h2>Join Game Screen</h2>
    //                 <button className="menu-button back-button" onClick={() => setScreen('menu')}>
    //                     Back
    //                 </button>
    //             </>;
    //         case 'stats':
    //             return <>
    //                 <h2>Stats Screen</h2>
    //                 <button className="menu-button back-button" onClick={() => setScreen('menu')}>
    //                     Back
    //                 </button>
    //             </>;
    //         case 'shop':
    //             return <>
    //                 <h2>Shop Screen</h2>
    //                 <button className="menu-button back-button" onClick={() => setScreen('menu')}>
    //                         Back
    //                 </button>
    //             </>;
    //         default:
    //             return null;
    //     }
    // };

    // Rendering the HomePage component with the current screen and title
    return (
        <div className="home-page">
            {renderScreen()}
        </div>
    );
}

export default HomePage;