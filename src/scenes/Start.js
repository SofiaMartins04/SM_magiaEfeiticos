export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {

        this.load.image('ceu', 'assets/ceu.png');
        this.load.image('plataforma', 'assets/plataforma.png');
    }

    create() {
        const larguraDoJogo = this.sys.game.config.width;
        const alturaDoJogo = this.sys.game.config.height;

        // 1. Use this.add.image() para a imagem de fundo estática
        this.ceu = this.add.image(0, 0, 'ceu').setOrigin(0, 0).setDisplaySize(larguraDoJogo, alturaDoJogo);

        this.plataforma = this.physics.add.staticGroup();

        this.plataforma.create(600, 490, 'plataforma').setScale(3).refreshBody();

        this.plataforma.create(600, 400, 'plataforma');
        this.plataforma.create(50, 250, 'plataforma');
        this.plataforma.create(750, 220, 'plataforma');


    }

    update() {

    }
}

