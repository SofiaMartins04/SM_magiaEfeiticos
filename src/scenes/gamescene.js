import { EnemiesManager } from '../enemies.js';
import { Player } from '../player.js';
import { Settings } from '../settings.js';

export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    // imagens do jogo
    preload() {
        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('Fundo2', 'assets/fundo_floresta.png');

        this.load.image('rock_tile', 'assets/rock.png');
        this.load.image('estrela', 'assets/estrela.png');
        this.load.image('pocao', 'assets/pocao.png');
        
        this.load.image('btnVoltar', 'assets/voltar.png');
        this.load.image('monster', 'assets/moster.png');
        this.load.image('flag', 'assets/flag.png');
        this.load.image('game_over', 'assets/game_over.png');
        this.load.image('win', 'assets/win.png');
        this.load.image('btnRecomecar', 'assets/recomecar.png');
        this.load.image('btnMenu', 'assets/menu.png');
        this.load.image('btnConfig', 'assets/config.png');
        this.load.spritesheet('wizard', 'assets/wizard.png',
            { frameWidth: 32, 
            frameHeight: 36 }
        );

        this.load.audio('game_over_sound', 'assets/sounds/game_over.mp3');
        this.load.audio('win_sound', 'assets/sounds/win.mp3');
        this.load.audio('good_sound', 'assets/sounds/good.mp3');
        this.load.audio('error_sound', 'assets/sounds/error.mp3');
    }

    // Configura o mapa e elementos do jogo
    create() {
        const { width, height } = this.scale;

        const bgKey = Settings.background === 1 ? 'Fundo2' : 'Fundo';


        this.background = this.add.tileSprite(
            0, 0, width, height, bgKey
        ).setOrigin(0, 0);
        this.gameOverSound = this.sound.add('game_over_sound');
        this.winSound = this.sound.add('win_sound', { volume: 20 });
        this.goodSound = this.sound.add('good_sound');
        this.errorSound = this.sound.add('error_sound');
        
        const tileHeight = 32;
        const groundY = height - tileHeight;

        // Cria a plataforma onde o jogador começa
        this.startPlatform = this.physics.add.sprite(80, groundY, 'rock_tile');
        this.startPlatform.setScale(2, 1);
        this.startPlatform.setImmovable(true);
        this.startPlatform.body.setAllowGravity(false);
        this.startPlatform.refreshBody();

        this.player = new Player(this, 80, groundY - 18);

        // mapa
        this.worldEnd = 9200;
        this.scrollX = 0;
        
        // Timer do jogo - 60 segundos para completar
        this.timeLimit = 60000;
        this.startTime = this.time.now;
        this.gameOver = false;
        this.timerText = this.add.text(width / 2, 16, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0); 

        //DIFICULDADE
        if (Settings.difficulty === 'hard') {
            this.timeLimit = 45000;
            this.enemySpeed = 180;
            this.enemySpawnChance = 10;   // mais inimigos
            this.minSpawnDistance = 160;
        } else {
            this.timeLimit = 60000;
            this.enemySpeed = 100;
            this.enemySpawnChance = 3;    // menos inimigos
            this.minSpawnDistance = 260;
        }


        
        // Sistema de pontos
        this.score = 0;
        this.scoreText = this.add.text(width - 16, 16, 'Pontos: 0', {
            fontSize: '26px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0);
        
        // Botão para voltar ao menu
        const menuButton = this.add.image(55, 35, 'btnMenu').setScale(0.25);
        menuButton.setScrollFactor(0);
        menuButton.setInteractive({ useHandCursor: true });
        
        menuButton.on('pointerover', () => {
            menuButton.setScale(0.3);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setScale(0.25);
        });
        
        menuButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });

    
        // Cria as plataformas do mapa
        this.platforms = this.physics.add.group();
        this.platformData = [];
        
        let currentX = 300;
        // Define vários padrões de plataformas
        const patterns = [
            // para cima
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -25 },
                { dx: 280, dy: -50 },
                { dx: 420, dy: -75 }
            ],
            // plataformas juntas
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            // a descer 
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: 25 },
                { dx: 280, dy: 50 }
            ],
            // Duas plataformas juntas 
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            //  a subir
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -25 },
                { dx: 280, dy: -50 }
            ]
        ];
        
        const patternSpacings = [700, 450, 550, 450, 550];
        let patternIndex = 0;
        
        // Monta todas as plataformas do mapa e usa os padrões
        while (currentX < this.worldEnd - 500) {
            const baseY = 350;
            const pattern = patterns[patternIndex % patterns.length];
            const spacing = patternSpacings[patternIndex % patternSpacings.length];
            
            pattern.forEach(platformOffset => {
                const x = currentX + platformOffset.dx;
                const y = baseY + platformOffset.dy;
                const scale = platformOffset.dx === 0 && platformOffset.dy === 0 ? 1.2 : 1.0;
                this.platformData.push({ x, y, scale });
            });
            
            currentX += spacing;
            patternIndex++;
        }
        
        // Cria cada plataforma na scene
        this.platformData.forEach(data => {
            const platform = this.platforms.create(data.x, data.y, 'rock_tile');
            platform.setScale(data.scale, 1);
            platform.setImmovable(true);
            platform.setVelocity(0, 0);
            platform.body.setAllowGravity(false);
            platform.body.setSize(platform.width, platform.height);
            platform.refreshBody();
        });

        // grupos: as estrelas e as poções
        this.stars = this.physics.add.group();
        this.potions = this.physics.add.group();
        this.itemPositions = [];
        
        // coloca as estrelas e poções em vários sítios do mapa
        const itemData = [
            { x: 800, y: 200, type: 'star' },
            { x: 1500, y: 300, type: 'potion' },
            { x: 2200, y: 150, type: 'potion' },
            { x: 3200, y: 280, type: 'star' },
            { x: 4500, y: 350, type: 'potion' },
            { x: 6000, y: 180, type: 'star' },
            { x: 7500, y: 300, type: 'potion' },
            { x: 8200, y: 220, type: 'star' },
        ];
        
        // adiciona cada item ao jogo
        itemData.forEach(item => {
            if (item.type === 'star') {
                const star = this.stars.create(item.x, item.y, 'estrela');
                star.setScale(0.25); 
                star.setImmovable(true);
                star.setVelocity(0, 0);
                star.body.setAllowGravity(false);
                this.itemPositions.push({ x: item.x, y: item.y, sprite: star });
            } else {
                const potion = this.potions.create(item.x, item.y, 'pocao');
                potion.setScale(0.25); 
                potion.setImmovable(true);
                potion.setVelocity(0, 0);
                potion.body.setAllowGravity(false);
                this.itemPositions.push({ x: item.x, y: item.y, sprite: potion });
            }
        });
        
        // Cria a bandeira no final do mapa (objetivo do jogo)
        this.flag = this.physics.add.sprite(8900, 300, 'flag');
        this.flag.setScale(0.4);
        this.flag.setImmovable(true);
        this.flag.body.setAllowGravity(false);
        this.flagPosition = { x: 8900, y: 210 };

        this.enemiesManager = new EnemiesManager(
            this,
            this.platforms,
            this.itemPositions,
            this.flagPosition
        );
        
        // o jogador toca num inimigo
        this.physics.add.overlap(this.player.sprite, this.enemiesManager.getGroup(), this.hitEnemy, null, this);
        
        // o jogador toca na bandeira
        this.physics.add.overlap(this.player.sprite, this.flag, this.reachFlag, null, this);
        
        // o jogador recolhe itens
        this.physics.add.overlap(this.player.sprite, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player.sprite, this.potions, this.collectPotion, null, this);

        // o jogador possa estar em pé nas plataformas
        this.physics.add.collider(this.player.sprite, this.startPlatform);
        this.platformCollider = this.physics.add.collider(this.player.sprite, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    hitEnemy(player, enemy) {
        // o jogador toca num inimigo, o inimigo desaparece
        enemy.destroy();
        if (this.errorSound) {
            this.errorSound.play();
        }
        
        // Perde 10 pontos
        this.score = Math.max(0, this.score - 10);
        this.scoreText.setText(`Pontos: ${this.score}`);
    }

    reachFlag(player, flag) {
        // Quando chega à bandeira, o jogador ganha (WIN)
        if (!this.gameOver) {
            this.gameOver = true;
            this.showWin();
        }
    }

    collectStar(player, star) {
        // Apanha a estrela
        star.destroy();
        this.itemPositions = this.itemPositions.filter(item => item.sprite !== star);
        this.enemiesManager.itemPositions = this.itemPositions;
        this.score += 20;
        this.scoreText.setText(`Pontos: ${this.score}`);
        if (this.goodSound) {
            this.goodSound.play();
        }
        this.checkWin();
    }

        // o jogador apanha uma poção
    collectPotion(player, potion) {
        potion.destroy();
        this.itemPositions = this.itemPositions.filter(item => item.sprite !== potion);
        this.enemiesManager.itemPositions = this.itemPositions;
        this.score += 10;
        this.scoreText.setText(`Pontos: ${this.score}`);
        if (this.goodSound) {
            this.goodSound.play();
        }
        this.checkWin();
    }

    showWin() {
        // Para o jogador de se mover
        this.player.sprite.setVelocity(0, 0);
        this.timerText.setText('');
        this.scoreText.setText('');
        if (this.winSound) {
            this.winSound.play();
        }
        
        const { width, height } = this.scale;
        
        //fundo escuro 
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
        
        // Mostra a imagem "ganhou"
        this.add.image(width / 2, height / 2 - 80, 'win').setScale(1).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Mostra a pontuação 
        this.add.text(width / 2, height / 2 + 30, `Pontos: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Botão para recomeçar o jogo (esquerda)
        const restartButton = this.add.image(width / 2 - 80, height / 2 + 120, 'btnRecomecar').setScale(0.4);
        restartButton.setScrollFactor(0);
        restartButton.setInteractive({ useHandCursor: true });
        
        // Efeito de hover no botão
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.45);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4);
        });
        
        // Quando clicar no botão, recomeça o jogo
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });

        // Botão para voltar ao menu (direita)
        const menuButton = this.add.image(width / 2 + 80, height / 2 + 120, 'btnMenu').setScale(0.4);
        menuButton.setScrollFactor(0);
        menuButton.setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setScale(0.45);
        });
        menuButton.on('pointerout', () => {
            menuButton.setScale(0.4);
        });
        menuButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        }); 
    }

    showGameOver() {
        // Para o jogador de se mover
        this.player.sprite.setVelocity(0, 0);
        this.timerText.setText('');
        this.scoreText.setText('');
        if (this.gameOverSound) {
            this.gameOverSound.play();
        }
        
        const { width, height } = this.scale;
        
        // fundo escuro
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
        
        // Mostra a imagem "game over"
        this.add.image(width / 2, height / 2 - 80, 'game_over').setScale(1.5).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Mostra a pontuação final
        this.add.text(width / 2, height / 2 + 30 , `Pontuação: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0);
        
        // Botão para recomeçar o jogo (esquerda)
        const restartButton = this.add.image(width / 2 - 80, height / 2 + 120, 'btnRecomecar').setScale(0.4);
        restartButton.setScrollFactor(0);
        restartButton.setInteractive({ useHandCursor: true });
        
        // Efeito de hover no botão
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.45);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4);
        });
        
        // Quando clicar no botão, recomeça o jogo
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });

        // Botão para voltar ao menu (direita)
        const menuButton = this.add.image(width / 2 + 80, height / 2 + 120, 'btnMenu').setScale(0.4);
        menuButton.setScrollFactor(0);
        menuButton.setInteractive({ useHandCursor: true });

        menuButton.on('pointerover', () => {
            menuButton.setScale(0.45);
        });
        menuButton.on('pointerout', () => {
            menuButton.setScale(0.4);
        });
        menuButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        }); 
    }

    // Verifica se o jogador ganhou 
    checkWin() {
        if (this.score >= 100 && !this.gameOver) {
            this.gameOver = true;
            this.player.sprite.setVelocity(0, 0);
                if (this.winSound) {
                    this.winSound.play();
                }
            
            // fundo escuro 
            const { width, height } = this.scale;
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setOrigin(0.5, 0.5)
                .setScrollFactor(0);
            
            // Mostra a imagem ganhou
            this.add.image(width / 2, height / 2 - 80, 'win').setScale(1).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            // Mostra a pontuação
            this.add.text(width / 2, height / 2 + 30, `Pontos: ${this.score}`, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5, 0).setScrollFactor(0);
            
            // Botão para recomeçar (esquerda)
            const restartButton = this.add.image(width / 2 - 80, height / 2 + 120, 'btnRecomecar').setScale(0.4);

            restartButton.setInteractive({ useHandCursor: true });
            
            restartButton.on('pointerover', () => {
                 restartButton.setScale(0.45);
            });
            
            restartButton.on('pointerout', () => {
                 restartButton.setScale(0.4);
            });
            
            restartButton.on('pointerdown', () => {
                this.scene.restart();
            });

            // Botão para menu (direita)
            const menuButton = this.add.image(width / 2 + 80, height / 2 + 120, 'btnMenu').setScale(0.4);      

            menuButton.setInteractive({ useHandCursor: true });

            menuButton.on('pointerover', () => {
                menuButton.setScale(0.45);
            });

            menuButton.on('pointerout', () => {
                menuButton.setScale(0.4);
            });     

            menuButton.on('pointerdown', () => {
                this.scene.start('HomeScene');
            });
        }
    }

    update() {
        const { width } = this.scale;
        const centerX = width / 2;
        const rightEdge = width - 50;
        
        const screenCenter = this.scale.width / 2;
        const leftLimit = 80;
        const rightLimit = this.scale.width - 80;

        const input = this.player.update();

        // Move a plataforma inicial conforme o scroll do mapa
        this.startPlatform.x = 80 - this.scrollX;
        
        // posição de todas as plataformas no ecrã
        this.platformData.forEach((data, index) => {
            const platform = this.platforms.children.entries[index];
            platform.x = data.x - this.scrollX;
            platform.y = data.y;
        });
        
        // posição de todos os items no ecrã
        this.itemPositions.forEach(item => {
            item.sprite.x = item.x - this.scrollX;
            item.sprite.y = item.y;
        });
        
        // posição da bandeira no ecrã
        this.flag.x = this.flagPosition.x - this.scrollX;
        this.flag.y = this.flagPosition.y;
        

        // colisões das plataformas (importante para plataformas que não se mexem)
        this.platforms.children.entries.forEach(platform => {
            platform.body.updateFromGameObject();
        });
        
        // o jogador caiu (game over)
        const { height } = this.scale;
        if (this.player.sprite.y > height && !this.gameOver) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // mostra o tempo restante
        const elapsedTime = this.time.now - this.startTime;
        const remainingTime = Math.max(0, Math.floor((this.timeLimit - elapsedTime) / 1000));
        this.timerText.setText(`${remainingTime}s`);
        
        // o tempo acabou (game over)
        if (elapsedTime > this.timeLimit && !this.gameOver) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        if (this.gameOver) {
            return;
        }


        if (input.right) {

            if (this.player.sprite.x < centerX && this.scrollX === 0) {
                this.player.sprite.setVelocityX(160);
                this.player.sprite.anims.play('right', true);
            }
            else if (this.scrollX < this.worldEnd) {
                this.player.sprite.setVelocityX(0);
                this.scrollX += 2;
                this.player.sprite.anims.play('right', true);
            }
            else if (this.player.sprite.x < rightLimit) {
                this.player.sprite.setVelocityX(160);
                this.player.sprite.anims.play('right', true);
            }
            else {
                this.player.sprite.setVelocityX(0);
            }
        }

        else if (input.left) {

            if (this.player.sprite.x > centerX && this.scrollX === this.worldEnd) {
                this.player.sprite.setVelocityX(-160);
                this.player.sprite.anims.play('left', true);
            }
            else if (this.scrollX > 0) {
                this.player.sprite.setVelocityX(0);
                this.scrollX -= 2;
                this.player.sprite.anims.play('left', true);
            }
            else if (this.player.sprite.x > leftLimit) {
                this.player.sprite.setVelocityX(-160);
                this.player.sprite.anims.play('left', true);
            }
            else {
                this.player.sprite.setVelocityX(0);
            }
        }

        else {
            this.player.sprite.setVelocityX(0);
            this.player.sprite.anims.play('turn');
        }

        if (input.jump && this.player.sprite.body.touching.down) {
            this.player.sprite.setVelocityY(-420);
        }

        this.updateWorldScroll();
        this.enemiesManager.update(this.scrollX, this.player.sprite.x);
    }

    // Atualiza o fundo conforme o scroll do mapa
    updateWorldScroll() {
        this.background.tilePositionX = this.scrollX * 0.2;
    }
}
