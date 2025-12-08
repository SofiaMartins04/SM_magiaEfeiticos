export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }   

    // Carrega as imagens básicas do jogo 
    preload() {
        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('rock_tile', 'assets/rock.png');
        this.load.audio('bg_music', 'assets/sounds/background.mp3');
    }

    create() {
        this.scene.start('HomeScene');
    }
}