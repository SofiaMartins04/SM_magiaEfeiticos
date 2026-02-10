import { Settings } from '../settings.js';

export class SettingsScene extends Phaser.Scene {

    constructor() {
        super('SettingsScene');
    }

       // Carrega as imagens do menu
    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('btnVoltar', 'assets/voltar.png');
        this.load.image('BtnConfig', 'assets/config.png');
        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('Fundo2', 'assets/fundo_floresta.png');
        this.load.image('Settings', 'assets/settings.png');


    }

    create() {
        const OFFSET_X = 180;   
        const OFFSET_Y = -20;   

        const { width, height } = this.scale;

        let volume = Settings.volume ?? 1;
        let lastVolume = volume; // guarda o volume anterior

        this.add.rectangle(width / 2, height / 2, width, height, 0x0d0620).setOrigin(0.5, 0.5);

        this.add.image(width / 2, height / 8 , 'Settings').setOrigin(0.5, 0.5).setScale(0.30);

        // Texto "Fundo:"
        this.add.text(120, 135, 'Fundo:', {
            fontSize: '25px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const PREVIEW_WIDTH = 210;
        const PREVIEW_HEIGHT = 110;

        const yLabel = 160 + OFFSET_Y;
        const yImg = 185 + OFFSET_Y;


        // FLORESTA 

        const forestX = 70 + OFFSET_X;

        const forestBox = this.add.rectangle(forestX, yLabel, 18, 18)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(forestX + 30, yLabel, 'Floresta', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const forestImg = this.add.image(
            forestX + PREVIEW_WIDTH / 2 - 20,
            yImg + PREVIEW_HEIGHT / 2,
            'Fundo2'
        );
        forestImg.setDisplaySize(PREVIEW_WIDTH, PREVIEW_HEIGHT);

        // ESTRELADO 

        const starX = forestX + PREVIEW_WIDTH + 80;

        const starBox = this.add.rectangle(starX, yLabel, 18, 18)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(starX + 30, yLabel, 'Fundo', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const starImg = this.add.image(
            starX + PREVIEW_WIDTH / 2 - 20,
            yImg + PREVIEW_HEIGHT / 2,
            'Fundo'
        );
        starImg.setDisplaySize(PREVIEW_WIDTH, PREVIEW_HEIGHT);

        // SELEÇÃO

        const updateSelection = () => {
            // Floresta
            if (Settings.background === 1) {
                forestBox.setFillStyle(0xffffff);
            } else {
                forestBox.setFillStyle();
            }

            // Fundo / Estrelado
            if (Settings.background === 0) {
                starBox.setFillStyle(0xffffff);
            } else {
                starBox.setFillStyle();
            }
        };

        forestBox.on('pointerdown', () => {
            Settings.background = 1;
            updateSelection();
        });

        starBox.on('pointerdown', () => {
            Settings.background = 0;
            updateSelection();
        });

        updateSelection();
        
        // Botão Voltar (igual aos outros)
        const buttonBack = this.add.image(
            width -100,
            height / 1.15,
            'btnVoltar'
        ).setOrigin(0.5).setScale(0.3);

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
    
        //SOM 

        const soundX = 80;
        const soundY = 390;

        const soundIcon = this.add.text(soundX, soundY, '🔊', {
            fontSize: '26px'
        }).setOrigin(0, 0.5)
         .setInteractive({ useHandCursor: true });

        // Título
        this.add.text(soundX, soundY - 50, 'Som:', {
            fontSize: '25px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        //barra
        const barX = soundX + 50;
        const barWidth = 160;
        const barHeight = 10;

        // fundo (cinzento)
        const volumeBarBg = this.add.rectangle(
            barX, soundY,
            barWidth, barHeight,
            0x666666
        ).setOrigin(0, 0.5);

        // parte ativa (azul)
        const volumeBarFill = this.add.rectangle(
            barX, soundY,
            barWidth * volume, barHeight,
            0x3399ff
        ).setOrigin(0, 0.5);


        // Knob (círculo)
        const knob = this.add.circle(
            barX + barWidth * volume,
            soundY,
            8,
            0xffffff
        ).setInteractive({ draggable: true });

        this.input.setDraggable(knob);


        // DRAG
        this.input.on('drag', (pointer, gameObject, dragX) => {

            // limita o movimento da bolinha
            const minX = barX;
            const maxX = barX + barWidth;

            gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);

            // calcula volume (0–1)
            volume = (gameObject.x - barX) / barWidth;
            volume = Phaser.Math.Clamp(volume, 0, 1);

            // guarda
            Settings.volume = volume;

            // atualiza barra azul
            volumeBarFill.width = barWidth * volume;

            // muda emoji
            if (volume === 0) {
                soundIcon.setText('🔇');
            } else if (volume < 0.5) {
                soundIcon.setText('🔉');
            } else {
                soundIcon.setText('🔊');
            }

            // aplica volume real ao jogo
            this.sound.volume = volume;
        });


        // MUTE

       // estado inicial
        this.sound.volume = volume;

        if (volume === 0) soundIcon.setText('🔇');
        else if (volume < 0.5) soundIcon.setText('🔉');
        else soundIcon.setText('🔊');

        soundIcon.on('pointerdown', () => {
            if (volume > 0) {
                // MUTAR
                lastVolume = volume;
                volume = 0;
            } else {
                // VOLTAR AO SOM
                volume = lastVolume || 1;
            }

            Settings.volume = volume;
            this.sound.volume = volume;

            // atualiza knob
            knob.x = barX + barWidth * volume;

            // atualiza barra azul
            volumeBarFill.width = barWidth * volume;

            // muda emoji
            if (volume === 0) {
                soundIcon.setText('🔇');
            } else if (volume < 0.5) {
                soundIcon.setText('🔉');
            } else {
                soundIcon.setText('🔊');
            }
        });

        // DIFICULDADE 

        this.add.text(370, 340, 'Dificuldade:', {
            fontSize: '25px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        const diffY = 390;

        // Fácil
        const easyBox = this.add.rectangle(380, diffY, 18, 18)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(400, diffY, 'Fácil', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        // Difícil
        const hardBox = this.add.rectangle(510, diffY, 18, 18)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(530, diffY, 'Difícil', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        // Atualizar visual
        const updateDifficulty = () => {
            easyBox.setFillStyle(
                Settings.difficulty === 'easy' ? 0xffffff : null
            );

            hardBox.setFillStyle(
                Settings.difficulty === 'hard' ? 0xffffff : null
            );
        };

        easyBox.on('pointerdown', () => {
            Settings.difficulty = 'easy';
            updateDifficulty();
        });

        hardBox.on('pointerdown', () => {
            Settings.difficulty = 'hard';
            updateDifficulty();
        });

        updateDifficulty();

    }
}