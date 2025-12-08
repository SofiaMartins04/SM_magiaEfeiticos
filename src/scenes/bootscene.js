export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }   

    preload() {

        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('rock_tile', 'assets/rock.png');
    }

    create() {
        

        // Inicia a cena de Home
        this.scene.start('HomeScene');
    }
}