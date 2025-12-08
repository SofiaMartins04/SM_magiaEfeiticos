export class RulesScene extends Phaser.Scene {
    constructor() {
        super('RulesScene');
    }

    preload() {
        this.load.image('btnVoltar', 'assets/voltar.png');
        this.load.image('rules', 'assets/rules.png');
    }

    create() {
         const { width, height } = this.scale;

        // Background azul escuro
        this.add.rectangle(width / 2, height / 2, width, height, 0x0d0620).setOrigin(0.5, 0.5);

        // Título "Regras"
        this.add.image(width / 1.90, height / 6 , 'rules').setOrigin(0.5, 0.5).setScale(0.70);


         // Botão "Voltar"
        const buttonBack = this.add.image(width / 2 , height / 1.15, 'btnVoltar').setOrigin(0.5, 0.5).setScale(0.3);
        buttonBack.setInteractive({ useHandCursor: true });

        buttonBack.on('pointerover', () => {
            buttonBack.setScale(0.35);
        });

        buttonBack.on('pointerout', () => {
            buttonBack.setScale(0.3);
        });

        buttonBack.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });
    }
}
