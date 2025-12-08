export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }   

    preload() {

        this.load.image('Fundo', 'assets/ceu.png');
        this.load.image('rock_tile', 'assets/rock.png');
    }

    create() {
        

        // Inicia a cena de Jogo/Start
        this.scene.start('GameScene');
    }
}