import { useState } from 'react';
import './HomePage.css';
import ColorGrid from './ColorGrid';

function HomePage() {
    const [showGrid, setShowGrid] = useState(false);

    const handleNewGame = () => setShowGrid(true);
    const handleJoinGame = () => console.log('Join game');
    const handleViewStats = () => console.log('View stats');
    const handleShop = () => console.log('Shop');

    return (
        <div className="home">
            <h1 className="home-title">Transcendence</h1>

            {showGrid ? (
                <>
                    <ColorGrid />
                    <button className="menu-button back-button" onClick={() => setShowGrid(false)}>
                        Back
                    </button>
                </>
            ) : (
                <nav className="home-menu">
                    <button className="menu-button" onClick={handleNewGame}>New game</button>
                    <button className="menu-button" onClick={handleJoinGame}>Join game</button>
                    <button className="menu-button" onClick={handleViewStats}>View stats</button>
                    <button className="menu-button" onClick={handleShop}>Shop</button>
                </nav>
            )}
        </div>
    );
}

export default HomePage;