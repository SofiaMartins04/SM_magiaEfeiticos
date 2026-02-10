export class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    // Carrega as imagens do menu
    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('btnComecar', 'assets/comecar.png');
        this.load.image('btnRegras', 'assets/regras.png');
        this.load.image('BtnConfig', 'assets/config.png');
    }

    // Cria o menu principal

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0d0620).setOrigin(0.5, 0.5);

        this.add.image(width / 2, height / 3, 'logo').setOrigin(0.5, 0.5).setScale(0.20);

        // Botão "Começar" (à esquerda)
        const button = this.add.image(width / 2 - 120, height / 1.3, 'btnComecar').setOrigin(0.5, 0.5).setScale(0.4);
        button.setInteractive({ useHandCursor: true });

        // Efeito quando passa o rato por cima
        button.on('pointerover', () => {
            button.setScale(0.45);
        });

        button.on('pointerout', () => {
            button.setScale(0.4);
        });

        button.on('pointerdown', () => {
            this.scene.start('GameScene');
        });


        // Botão "Regras" (à direita)
        const buttonRules = this.add.image(width / 2 + 120, height / 1.3, 'btnRegras').setOrigin(0.5, 0.5).setScale(0.4);
        buttonRules.setInteractive({ useHandCursor: true });

        buttonRules.on('pointerover', () => {
            buttonRules.setScale(0.45);
        });

        buttonRules.on('pointerout', () => {
            buttonRules.setScale(0.4);
        });

        buttonRules.on('pointerdown', () => {
            this.scene.start('RulesScene');
        });

        
        this.add.text(width - 10, height - 6, 'Sofia Martins Nº28849 ECGM', {
            fontSize: '18px',
            fill: '#888888',
            fontFamily: 'Arial'
        }).setOrigin(1, 1).setAlpha(0.9);


        // Botão CONFIG (canto superior direito)
        const buttonConfig = this.add.image(
            width - 80,
            50,
            'BtnConfig'
        ).setOrigin(0.5, 0.5).setScale(0.3);

        buttonConfig.setScrollFactor(0);
        buttonConfig.setInteractive({ useHandCursor: true });

        buttonConfig.on('pointerover', () => {
            buttonConfig.setScale(0.3);
        });

        buttonConfig.on('pointerout', () => {
            buttonConfig.setScale(0.25);
        });

        buttonConfig.on('pointerdown', () => {
            this.scene.start('SettingsScene');
        });
    }
}
