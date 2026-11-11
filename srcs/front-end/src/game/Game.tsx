
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from './GameScene';

export default function Game() {
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
            scene: [GameScene]
        });

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div ref={gameRef} className="game-container" />
    );
}
