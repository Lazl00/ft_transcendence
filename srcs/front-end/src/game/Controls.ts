import Phaser from 'phaser';

export type ControlPreset = 'azerty' | 'qwerty';

export type GameControls = {
    left: number[];
    right: number[];
    jump: number[];
    down: number[];
    dash: number[];
};

export const CONTROL_PRESETS: Record<ControlPreset, GameControls> = {
    azerty: {
        left: [Phaser.Input.Keyboard.KeyCodes.Q],
        right: [Phaser.Input.Keyboard.KeyCodes.D],
        jump: [
            Phaser.Input.Keyboard.KeyCodes.Z,
            Phaser.Input.Keyboard.KeyCodes.SPACE
        ],
        down: [Phaser.Input.Keyboard.KeyCodes.S],
        dash: [Phaser.Input.Keyboard.KeyCodes.SHIFT,]
    },

    qwerty: {
        left: [Phaser.Input.Keyboard.KeyCodes.A],
        right: [Phaser.Input.Keyboard.KeyCodes.D],
        jump: [
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.SPACE
        ],
        down: [Phaser.Input.Keyboard.KeyCodes.S],
        dash: [Phaser.Input.Keyboard.KeyCodes.SHIFT,]
    }
};
