export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'wizard', 7);
        this.sprite.setScale(2);
        this.sprite.setOrigin(0.5, 1); // Origin no pé do boneco
        this.sprite.setCollideWorldBounds(true);
        
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.createAnimations();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('wizard', { frames: [9, 10, 11] }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('wizard', { frames: [3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'turn',
            frames: [{ key: 'wizard', frame: 7 }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'up',
            frames: this.scene.anims.generateFrameNumbers('wizard', { frames: [7] }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(scrollX, worldEnd, gameWidth) {
        const centerX = gameWidth / 2;
        const rightEdge = gameWidth - 50;

        if (this.cursors.right.isDown) {
            if (this.sprite.x < centerX && scrollX === 0) {
                this.sprite.setVelocityX(160);
                this.sprite.anims.play('right', true);
            }
            else if (scrollX < worldEnd) {
                this.sprite.setVelocityX(0);
                this.sprite.anims.play('right', true);
            }
            else if (this.sprite.x < rightEdge) {
                this.sprite.setVelocityX(160);
                this.sprite.anims.play('right', true);
            }
            else {
                this.sprite.setVelocityX(0);
                this.sprite.anims.play('turn');
            }
        }
        else if (this.cursors.left.isDown) {
            if (this.sprite.x > centerX && scrollX === worldEnd) {
                this.sprite.setVelocityX(-160);
                this.sprite.anims.play('left', true);
            }
            else if (scrollX > 0) {
                this.sprite.setVelocityX(0);
                this.sprite.anims.play('left', true);
            }
            else if (this.sprite.x > 50) {
                this.sprite.setVelocityX(-160);
                this.sprite.anims.play('left', true);
            }
            else {
                this.sprite.setVelocityX(0);
                this.sprite.anims.play('turn');
            }
        }
        else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('turn');
        }

        // Salto - independente do movimento horizontal
        if (this.cursors.up.isDown && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-330);
        }
    }

    getSprite() {
        return this.sprite;
    }
}
