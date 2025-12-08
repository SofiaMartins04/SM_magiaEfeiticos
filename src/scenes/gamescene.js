export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('Fundo', 'assets/ceu.png');
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
        const groundY = height - 30;

        this.ground = this.add.tileSprite(0,groundY,width,tileHeight,'rock_tile').setOrigin(0, 0);

        // Quantidade de scroll (60 segundos ≈ 1600px)
        this.worldEnd = 9600;
        this.scrollX = 0;


        this.createAnimations();

        const playerY = groundY - 30; // altura do wizard
        this.player = this.physics.add.sprite(80, playerY, 'wizard', 7);
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
    }


    createAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('wizard', { frames: [9, 10, 11] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('wizard', { frames: [3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'wizard', frame: 7 }],
            frameRate: 20
        });
    }

   
    update() {
        const { width } = this.scale;
        const centerX = width / 2;
        const rightEdge = width - 50;

      
        if (this.cursors.right.isDown) {

          
            if (this.player.x < centerX && this.scrollX === 0) {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
                return;
            }

            //Mover o mundo enquanto o wizard está no centro
            if (this.scrollX < this.worldEnd) {
                this.player.setVelocityX(0);  // wizard parado no centro
                this.scrollX += 4;           // mover mundo
                this.player.anims.play('right', true);
                this.updateWorldScroll();
                return;
            }

            // O mundo acabou mas o wizard anda até ao fim do ecrã
            if (this.player.x < rightEdge) {
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
                return;
            }

           
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

       
        else if (this.cursors.left.isDown) {

            // voltar fisicamente até ao centro se scroll acabou
            if (this.player.x > centerX && this.scrollX === this.worldEnd) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
                return;
            }

            // scroll para trás
            if (this.scrollX > 0) {
                this.player.setVelocityX(0);
                this.scrollX -= 4;
                this.player.anims.play('left', true);
                this.updateWorldScroll();
                return;
            }

            // normal até à borda esquerda
            if (this.player.x > 50) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
                return;
            }

            // parado no início
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

     
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        this.updateWorldScroll();
    }

   
    updateWorldScroll() {
        this.background.tilePositionX = this.scrollX * 0.2; // parallax
        this.ground.tilePositionX = this.scrollX;           // chão completo
    }
}
