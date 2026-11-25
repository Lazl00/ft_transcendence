
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';

interface GameProps {
    playerId: number;
    onResultSaved: () => void;
}

function createPlayerGameScene(playerId: number, onResultSaved: () => void) {
    return class PlayerGameScene extends GameScene {
        constructor() {
            super(playerId, onResultSaved);
        }
    };
}

export default function Game({ playerId, onResultSaved }: GameProps) {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gameRef.current) {
            return;
        }

        const game = new Phaser.Game({
            type: Phaser.AUTO,
            width: 800,
            height: 500,
            parent: gameRef.current,
            scene: [createPlayerGameScene(playerId, onResultSaved)],
            physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 1500 },
                debug: true
            }
}
        });

        return () => {
            game.destroy(true);
        };
    }, [playerId, onResultSaved]);

    return (
        <div ref={gameRef} className="game-container" />
    );
}
