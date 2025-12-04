export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {

        this.load.image('ceu', 'assets/ceu.png');
        this.load.image('plataforma', 'assets/plataforma.png');
        this.load.spritesheet('feiticeiro', 
            'assets/feiticeiro.png', 
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        const larguraDoJogo = this.sys.game.config.width;
        const alturaDoJogo = this.sys.game.config.height;

        // 1. Use this.add.image() para a imagem de fundo estática
        this.ceu = this.add.image(0, 0, 'ceu').setOrigin(0, 0).setDisplaySize(larguraDoJogo, alturaDoJogo);

        this.plataforma = this.physics.add.staticGroup();

        this.plataforma.create(600, 490, 'plataforma').setScale(3).refreshBody();

        this.plataforma.create(220, 320, 'plataforma');
        this.plataforma.create(20, 190, 'plataforma');
        this.plataforma.create(780, 250, 'plataforma');
        this.plataforma.create(700, 100, 'plataforma');


        // Criação do personagem jogador
        this.player = this.physics.add.sprite(100, 450, 'feiticeiro');
        
        // Propriedades do jogador
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //configurar animações
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('feiticeiro', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'feiticeiro', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('feiticeiro', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Colisões entre o jogador e as plataformas
        this.physics.add.collider(this.player, this.plataforma);
        
        // Configurar controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {

        if (this.cursors) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }

            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-330);
            }
        }


    }
}

