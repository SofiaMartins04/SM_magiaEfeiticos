export class RulesScene extends Phaser.Scene {
    constructor() {
        super('RulesScene');
    }

    // Carrega as imagens necessárias para as regras
    preload() {
        this.load.image('btnVoltar', 'assets/voltar.png');
        this.load.image('rules', 'assets/rules.png');
    }

    // Cria a cena das regras
    create() {
         const { width, height } = this.scale;

        // fundo
        this.add.rectangle(width / 2, height / 2, width, height, 0x0d0620).setOrigin(0.5, 0.5);

        this.add.image(width / 1.90, height / 6 , 'rules').setOrigin(0.5, 0.5).setScale(0.70);

        const rulesText = `O objetivo é chegar à bandeira final antes que os 60 segundos acabem!

        Usa as setas do teclado para te moveres e saltares pelas plataformas.
        Pelo caminho, apanha Estrelas (+ 20 pontos) e Poções (+ 10 pontos) para ganhares pontos, 
        mas evita os Inimigos (-10 pontos). 
        
        Se caíres do mapa ou o tempo esgotar, é Game Over!`;

        this.add.text(width / 2, height / 2 + 20, rulesText, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5, 0.65);

        // Botão "Voltar"
        const buttonBack = this.add.image(width / 2 , height / 1.25, 'btnVoltar').setOrigin(0.5, 0.5).setScale(0.3);
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
