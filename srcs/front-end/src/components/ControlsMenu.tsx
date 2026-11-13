
import type { ControlPreset } from '../game/Controls';
import './ControlsMenu.css';

type ControlsMenuProps = {
    selectedPreset: ControlPreset;
    onSelectPreset: (preset: ControlPreset) => void;
    onPlay: () => void;
};

export default function ControlsMenu({
    selectedPreset,
    onSelectPreset,
    onPlay
}: ControlsMenuProps) {
    return (
        <div className="controls-menu">
            <h1>Configuration des touches</h1>

            <p>Choisis ta configuration préférée.</p>

            <div className="preset-list">
                <button
                    className={selectedPreset === 'azerty' ? 'selected' : ''}
                    onClick={() => onSelectPreset('azerty')}
                >
                    <strong>AZERTY</strong>
                    <span>Q Z S D</span>
                </button>

                <button
                    className={selectedPreset === 'qwerty' ? 'selected' : ''}
                    onClick={() => onSelectPreset('qwerty')}
                >
                    <strong>QWERTY</strong>
                    <span>W A S D</span>
                </button>

            </div>

            <div className="controls-description">
                <p><strong>Déplacement :</strong> touches directionnelles</p>
                <p><strong>Saut :</strong> touche de saut ou Espace</p>
                <p><strong>Fast Fall :</strong> touche du bas</p>
                <p><strong>Dash :</strong> Shift </p>
            </div>

            <button className="play-button" onClick={onPlay}>
                JOUER
            </button>
        </div>
    );
}
