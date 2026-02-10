export class Player {

    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.physics.add.sprite(x, y, 'wizard', 7);
        this.sprite.setScale(2);
        this.sprite.setOrigin(0.5, 1);

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.createAnimations();
    }

    createAnimations() {
        if (this.scene.anims.exists('left')) return;

        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('wizard', { frames: [9,10,11] }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('wizard', { frames: [3,4,5] }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'turn',
            frames: [{ key: 'wizard', frame: 7 }],
            frameRate: 20
        });
    }

    update() {
        return {
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
            jump: this.cursors.up.isDown
        };
    }
}
