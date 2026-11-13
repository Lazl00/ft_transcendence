
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import GameScene from './GameScene';
import type { GameControls } from './Controls';

type GameProps = {
    controls: GameControls;
};

export default function Game({ controls }: GameProps) {
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

            scene: [new GameScene(controls)],

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
    }, [controls]);

    return (
        <div
            ref={gameRef}
            className="game-container"
        />
    );
}
