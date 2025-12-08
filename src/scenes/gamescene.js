import { Player } from '../player.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('rock_tile', 'assets/rock.png');
        this.load.spritesheet('wizard', 'assets/wizard.png',
            { frameWidth: 32, 
            frameHeight: 36 }
        );
    }

    create() {
        const { width, height } = this.scale;

        this.background = this.add.tileSprite(0,0,width,height,'Fundo').setOrigin(0, 0);
        
        const tileHeight = 32;
        const groundY = height - tileHeight;

        this.ground = this.add.tileSprite(0,groundY,width,tileHeight,'rock_tile').setOrigin(0, 0);
        this.physics.add.existing(this.ground, true);

        // Quantidade de scroll (60 segundos ≈ 1600px)
        this.worldEnd = 9600;
        this.scrollX = 0;

        const playerY = groundY - 18; // altura do wizard (metade da altura da sprite)
        
        // Criar o player
        this.player = new Player(this, 80, playerY);
        
        // Adicionar colisão
        this.physics.add.collider(this.player.getSprite(), this.ground);
    }

    update() {
        // Atualizar o player com informações do cenário
        this.player.update(this.scrollX, this.worldEnd, this.scale.width);

        // Lógica de scroll
        const { width } = this.scale;
        const centerX = width / 2;

        if (this.player.getSprite().x >= centerX && this.scrollX < this.worldEnd) {
            // O scroll acontece no método update do Player
        }

        // Atualizar scroll baseado no movimento do player
        if (this.player.cursors.right.isDown && this.scrollX < this.worldEnd) {
            if (this.player.getSprite().x >= centerX) {
                this.scrollX += 4;
            }
        } else if (this.player.cursors.left.isDown && this.scrollX > 0) {
            if (this.player.getSprite().x <= centerX) {
                this.scrollX -= 4;
            }
        }

        this.updateWorldScroll();
    }

    updateWorldScroll() {
        this.background.tilePositionX = this.scrollX * 0.2; // parallax
        this.ground.tilePositionX = this.scrollX;           // chão completo
    }
}
