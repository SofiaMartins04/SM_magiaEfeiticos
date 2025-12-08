export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('Fundo', 'assets/fundo.png');
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
        const groundY = height - tileHeight;

        this.ground = this.add.tileSprite(0,groundY,width,tileHeight,'rock_tile').setOrigin(0, 0);
        this.physics.add.existing(this.ground, true);

        // Quantidade de scroll (60 segundos ≈ 1600px)
        this.worldEnd = 9600;
        this.scrollX = 0;

        const playerY = groundY - 18; // altura do wizard (metade da altura da sprite)
        this.player = this.physics.add.sprite(80, playerY, 'wizard', 7);
        this.player.setScale(2);
        this.player.setOrigin(0.5, 1); // Origin no pé do boneco
        this.player.setBounce(0, 0); // Sem bounce
        this.player.setDrag(0); // Sem resistência
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(0); // Usar a gravidade padrão do mundo

        // Plataformas para saltar - padrões variados do início ao fim do jogo
        this.platforms = this.physics.add.group();
        this.platformData = [];
        
        let currentX = 300;
        const patterns = [
            // Padrão 1: Escada subindo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -30 },
                { dx: 280, dy: -60 },
                { dx: 420, dy: -90 }
            ],
            // Padrão 2: Dupla com espaço
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            // Padrão 3: Escada descendo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: 30 },
                { dx: 280, dy: 60 }
            ],
            // Padrão 4: Dupla com espaço
            [
                { dx: 0, dy: 0 },
                { dx: 150, dy: 0 }
            ],
            // Padrão 5: Escada subindo
            [
                { dx: 0, dy: 0 },
                { dx: 140, dy: -30 },
                { dx: 280, dy: -60 }
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
            platform.refreshBody();
        });

        // Colisão do player com o chão e plataformas
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.createAnimations();
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
        
        // Reposicionar plataformas baseado no scroll para mantê-las fixas no mundo
        this.platformData.forEach((data, index) => {
            const platform = this.platforms.children.entries[index];
            platform.x = data.x - this.scrollX;
        });
        
        // Bloquear passagem por trás das plataformas (colisão lateral)
        this.platforms.children.entries.forEach(platform => {
            const platformLeft = platform.x - platform.displayWidth / 2;
            const platformRight = platform.x + platform.displayWidth / 2;
            const platformTop = platform.y - platform.displayHeight / 2;
            const platformBottom = platform.y + platform.displayHeight / 2;
            
            // Se o player está ao lado de uma plataforma, empurra para trás
            if (this.player.y < platformTop && this.player.y > platformBottom - 50) {
                // Lado esquerdo
                if (this.player.x < platformLeft && this.player.x > platformLeft - 50) {
                    this.player.x = platformLeft - 35;
                }
                // Lado direito
                if (this.player.x > platformRight && this.player.x < platformRight + 50) {
                    this.player.x = platformRight + 35;
                }
            }
        });
        
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
            this.player.setVelocityY(-330);
        }

        this.updateWorldScroll();
    }

   
    updateWorldScroll() {
        this.background.tilePositionX = this.scrollX * 0.2; // parallax
        this.ground.tilePositionX = this.scrollX;           // chão completo
        // As plataformas ficam fixas no mundo, não se mexem com o scroll
    }
}
