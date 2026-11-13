
import { useEffect, useState } from 'react';
import './App.css';

import Game from './game/Game';
import ControlsMenu from './components/ControlsMenu';

import {
    CONTROL_PRESETS,
    type ControlPreset
} from './game/Controls';

function App() {
    const [selectedPreset, setSelectedPreset] = useState<ControlPreset>(() => {
        const saved = localStorage.getItem('controlPreset');

        if (
            saved === 'azerty' ||
            saved === 'qwerty'
        ) {
            return saved;
        }

        return 'azerty';
    });

    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        localStorage.setItem('controlPreset', selectedPreset);
    }, [selectedPreset]);

    const controls = CONTROL_PRESETS[selectedPreset];

    return (
        <main>
            {gameStarted ? (
                <Game controls={controls} />
            ) : (
                <ControlsMenu
                    selectedPreset={selectedPreset}
                    onSelectPreset={setSelectedPreset}
                    onPlay={() => setGameStarted(true)}
                />
            )}
        </main>
    );
}

export default App;
