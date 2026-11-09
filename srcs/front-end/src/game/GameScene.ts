
import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#171923');

        this.add.text(400, 250, 'PIXEL RUSH', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 310, 'Your race starts here :)', {
            fontSize: '18px',
            color: '#a0aec0'
        }).setOrigin(0.5);
    }
}
