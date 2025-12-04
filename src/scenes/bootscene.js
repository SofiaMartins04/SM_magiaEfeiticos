export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }   

    preload() {
        // Load any assets needed for the boot scene here
        this.load.image('ceu', 'assets/ceu.jpg');

    }

    create() {
        // Start the Start scene after booting
        this.scene.start('Start');
    }
}