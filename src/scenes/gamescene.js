export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('Fundo', 'assets/fundo.png');
        this.load.image('rock_tile', 'assets/rock.png');
        this.load.image('estrela', 'assets/estrela.png');
        this.load.image('pocao', 'assets/pocao.png');
        this.load.image('btnVoltar', 'assets/voltar.png');
        this.load.image('monster', 'assets/moster.png');
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

        // Plataforma inicial pequena (apenas onde o jogador começa)
        this.startPlatform = this.physics.add.sprite(80, groundY, 'rock_tile');
        this.startPlatform.setScale(2, 1); // Plataforma pequena, do tamanho de 2 tiles
        this.startPlatform.setImmovable(true);
        this.startPlatform.body.setAllowGravity(false);
        this.startPlatform.refreshBody();

        // Quantidade de scroll (10 segundos ≈ 1600px)
        this.worldEnd = 9200;
        this.scrollX = 0;
        
        // Sistema de tempo
        this.timeLimit = 60000; // 60 segundos em milissegundos
        this.startTime = this.time.now;
        this.gameOver = false;
        this.timerText = this.add.text(width / 2, 16, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0); 
        
        // Sistema de pontos
        this.score = 0;
        this.scoreText = this.add.text(width - 16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0); 

        const playerY = groundY - 18; 
        this.player = this.physics.add.sprite(80, playerY, 'wizard', 7);
        this.player.setScale(2); 
        this.player.setOrigin(0.5, 1); // Origin no pé do boneco
        this.player.setBounce(0, 0);
        this.player.setDrag(0); 
        this.player.setCollideWorldBounds(false); 
        this.player.setGravityY(0); 
        this.player.body.setSize(20, 35); 

        // Plataformas para saltar - padrões variados do início ao fim do jogo
        this.platforms = this.physics.add.group();
        this.platformData = [];
        
        let currentX = 300;
        const patterns = [
            // Padrão 1: Escada subindo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -25 },
                { dx: 280, dy: -50 },
                { dx: 420, dy: -75 }
            ],
            // Padrão 2: Dupla com espaço
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            // Padrão 3: Escada descendo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: 25 },
                { dx: 280, dy: 50 }
            ],
            // Padrão 4: Dupla com espaço
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            // Padrão 5: Escada subindo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -25 },
                { dx: 280, dy: -50 }
            ]
        ];
        
        const patternSpacings = [700, 450, 550, 450, 550];
        let patternIndex = 0;
        
        // Gerar padrões até ao fim do jogo
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
        
        this.platformData.forEach(data => {
            const platform = this.platforms.create(data.x, data.y, 'rock_tile');
            platform.setScale(data.scale, 1);
            platform.setImmovable(true); // Imóvel
            platform.setVelocity(0, 0); // Sem movimento
            platform.body.setAllowGravity(false); // Sem gravidade
            platform.body.setSize(platform.width, platform.height); // Garantir hitbox correta
            platform.refreshBody();
        });

        // Criar grupos de items (estrelas e poções)
        this.stars = this.physics.add.group();
        this.potions = this.physics.add.group();
        this.itemPositions = []; // Guardar posições originais dos items
        
        // Distribuir 3 estrelas (20 pontos cada) e 4 poções (10 pontos cada) com alturas variadas
        const itemData = [
            { x: 800, y: 200, type: 'star' },      // Alta
            { x: 1500, y: 300, type: 'potion' },   // Média-baixa
            { x: 2200, y: 150, type: 'potion' },   // Muito alta
            { x: 3200, y: 280, type: 'star' },     // Média
            { x: 4500, y: 350, type: 'potion' },   // Baixa
            { x: 6000, y: 180, type: 'star' },     // Alta
            { x: 7500, y: 300, type: 'potion' },   // Média
            { x: 8200, y: 220, type: 'star' },     // Quase no final
        ];
        
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
        
        // Criar inimigos nas plataformas
        this.enemies = this.physics.add.group();
        this.enemyPositions = [];
        
        // 5 inimigos distribuídos em diferentes plataformas
        const enemyData = [
            { x: 1000, y: 280 },    // Plataforma inicial
            { x: 1850, y: 290 },    // Plataforma média
            { x: 3000, y: 260 },    // Plataforma no meio
            { x: 5500, y: 250 },    // Plataforma alta
            { x: 7000, y: 270 },    // Plataforma próximo do final
            { x: 8400, y: 280 },    // Plataforma no final
        ];
        
        enemyData.forEach(enemy => {
            const monster = this.enemies.create(enemy.x, enemy.y, 'monster');
            monster.setScale(2); // Aumentado bastante (de 0.3 para 2)
            monster.setImmovable(true);
            monster.setVelocity(0, 0);
            monster.body.setAllowGravity(false);
            this.enemyPositions.push({ x: enemy.x, y: enemy.y, sprite: monster });
        });
        
        // Colisão com inimigos (Perde 10 pontos)
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        
        // Colisões com items
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.physics.add.overlap(this.player, this.potions, this.collectPotion, null, this);

        // Colisão do player com plataforma inicial e outras plataformas
        this.physics.add.collider(this.player, this.startPlatform);
        this.platformCollider = this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.createAnimations();
    }

    hitEnemy(player, enemy) {
        // Destruir o inimigo após tocar
        enemy.destroy();
        
        // Perder 10 pontos (não pode ficar negativo)
        this.score = Math.max(0, this.score - 10);
        this.scoreText.setText(`Score: ${this.score}`);
    }

    collectStar(player, star) {
        star.destroy();
        this.score += 20;
        this.scoreText.setText(`Score: ${this.score}`);
        this.checkWin();
    }

    showGameOver() {
        this.player.setVelocity(0, 0);
        this.timerText.setText('');
        this.scoreText.setText('');
        
        const { width, height } = this.scale;
        
        // Overlay escuro
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
        
        // Texto "GAME OVER"
        this.gameOverText = this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
            fontSize: '80px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Mostrar pontuação final
        this.add.text(width / 2, height / 2, `Pontuação: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);
        
        // Botão "Recomeçar" com imagem
        const restartButton = this.add.image(width / 2, height / 2 + 80, 'btnVoltar').setScale(0.3);
        restartButton.setScrollFactor(0);
        restartButton.setInteractive({ useHandCursor: true });
        
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.35);
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(0.3);
        });
        
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    collectPotion(player, potion) {
        potion.destroy();
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        this.checkWin();
    }

    checkWin() {
        if (this.score >= 100 && !this.gameOver) {
            this.gameOver = true;
            this.player.setVelocity(0, 0);
            
            // Criar overlay escuro
            const { width, height } = this.scale;
            const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
                .setOrigin(0.5, 0.5)
                .setScrollFactor(0);
            
            // Texto "YOU WIN!"
            this.add.text(width / 2, height / 2 - 80, 'YOU WIN!', {
                fontSize: '80px',
                fill: '#00ff00',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                align: 'center'
            }).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            // Mostrar pontuação final
            this.add.text(width / 2, height / 2, `Pontuação Final: ${this.score}`, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5, 0.5).setScrollFactor(0);
            
            // Botão "Recomeçar"
            const restartButton = this.add.image(width / 2 , height / 1.15, 'btnVoltar').setOrigin(0.5, 0.5).setScale(0.3);

            restartButton.setInteractive({ useHandCursor: true });
            
            restartButton.on('pointerover', () => {
                restartButton.setStyle({ fill: '#ffff00' });
            });
            
            restartButton.on('pointerout', () => {
                restartButton.setStyle({ fill: '#ffffff' });
            });
            
            restartButton.on('pointerdown', () => {
                this.scene.restart();
            });
        }
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

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('wizard', { frames: [7] }),
            frameRate: 10,
            repeat: -1
        });

        
    }

   
    update() {
        const { width } = this.scale;
        const centerX = width / 2;
        const rightEdge = width - 50;
        
        // Reposicionar plataforma inicial baseado no scroll
        this.startPlatform.x = 80 - this.scrollX;
        
        // Reposicionar plataformas baseado no scroll para mantê-las fixas no mundo
        this.platformData.forEach((data, index) => {
            const platform = this.platforms.children.entries[index];
            platform.x = data.x - this.scrollX;
            platform.y = data.y;
        });
        
        // Reposicionar items baseado no scroll
        this.itemPositions.forEach(item => {
            item.sprite.x = item.x - this.scrollX;
            item.sprite.y = item.y;
        });
        
        // Reposicionar inimigos baseado no scroll
        this.enemyPositions.forEach(enemy => {
            enemy.sprite.x = enemy.x - this.scrollX;
            enemy.sprite.y = enemy.y;
        });
        
        // Forçar recalculação de colisões (Phaser não faz isto automaticamente para corpos imóveis)
        this.platforms.children.entries.forEach(platform => {
            platform.body.updateFromGameObject();
        });
        
        // Verificar se o player caiu (GAME OVER)
        const { height } = this.scale;
        if (this.player.y > height && !this.gameOver) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Atualizar tempo e verificar se ultrapassou o limite
        const elapsedTime = this.time.now - this.startTime;
        const remainingTime = Math.max(0, Math.floor((this.timeLimit - elapsedTime) / 1000));
        this.timerText.setText(`${remainingTime}s`);
        
        // Game over por tempo
        if (elapsedTime > this.timeLimit && !this.gameOver) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Se game over, não continua a processar o resto do update
        if (this.gameOver) {
            return;
        }
        
        if (this.cursors.right.isDown) {

          
            if (this.player.x < centerX && this.scrollX === 0) {
                this.player.setVelocityX(100);
                this.player.anims.play('right', true);
            }
            else if (this.scrollX < this.worldEnd) {
                //Mover o mundo enquanto o wizard está no centro
                this.player.setVelocityX(0);  // wizard parado no centro
                this.scrollX += 2;           // mover mundo mais lentamente
                this.player.anims.play('right', true);
                this.updateWorldScroll();
            }
            else if (this.player.x < rightEdge) {
                // O mundo acabou mas o wizard anda até ao fim do ecrã
                this.player.setVelocityX(100);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
        }
       
        else if (this.cursors.left.isDown) {

            // voltar fisicamente até ao centro se scroll acabou
            if (this.player.x > centerX && this.scrollX === this.worldEnd) {
                this.player.setVelocityX(-100);
                this.player.anims.play('left', true);
            }

            // scroll para trás
            else if (this.scrollX > 0) {
                this.player.setVelocityX(0);
                this.scrollX -= 2;
                this.player.anims.play('left', true);
                this.updateWorldScroll();
            }

            // normal até à borda esquerda
            else if (this.player.x > 50) {
                this.player.setVelocityX(-100);
                this.player.anims.play('left', true);
            }

            else {
                // parado no início
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
        }

        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // Salto - independente do movimento horizontal
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-420);
        }

        this.updateWorldScroll();
    }

   
    updateWorldScroll() {
        this.background.tilePositionX = this.scrollX * 0.2; // parallax
        // As plataformas ficam fixas no mundo, não se mexem com o scroll
    }
}
