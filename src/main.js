import { BootScene } from './scenes/bootscene.js';
import { HomeScene } from './scenes/homescene.js';
import { RulesScene } from './scenes/rulesscene.js';
import { GameScene } from './scenes/gamescene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 500,
    backgroundColor: '#000000',
    autoResize: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },

    scene: [
        BootScene,
        HomeScene,
        RulesScene,
        GameScene
    
    ],

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);