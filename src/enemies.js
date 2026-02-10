export class EnemiesManager {
    constructor(scene, platforms, itemPositions, flagPosition) {
        this.scene = scene;
        this.platforms = platforms;
        this.itemPositions = itemPositions;
        this.flagPosition = flagPosition;

        this.enemies = scene.physics.add.group();
        this.enemyData = [];

        this.lastEnemySpawnX = -500;
        this.minSpawnDistance = 220;

        //DIFICULDADE
        if (scene.enemySpeed !== undefined) {
            this.enemySpeed = scene.enemySpeed;
        } else {
            this.enemySpeed = 120;
        }

        this.spawnChance = scene.enemySpawnChance ?? 3;
        this.minSpawnDistance = scene.minSpawnDistance ?? 220;

    }

    isPositionNearItem(x, range = 140) {
        return this.itemPositions.some(item =>
            Math.abs(item.x - x) < range
        );
    }

    update(scrollX, playerX) {
        this.createRandomEnemy(scrollX, playerX);

        // scroll dos inimigos
        this.enemyData.forEach(enemy => {
            enemy.sprite.x = enemy.x - scrollX;
        });
    }

    createRandomEnemy(scrollX, playerX) {
        if (Phaser.Math.Between(0, 100) > this.spawnChance) return;

        const playerWorldX = scrollX + playerX;

        if (playerWorldX - this.lastEnemySpawnX < this.minSpawnDistance) return;
        if (playerWorldX > this.flagPosition.x - 600) return;

        const minX = playerWorldX + 250;
        const maxX = playerWorldX + 650;
        const x = Phaser.Math.Between(minX, maxX);

        if (this.isPositionNearItem(x)) return;

        const startY = Phaser.Math.Between(-60, -180);

        const enemy = this.enemies.create(x, startY, 'monster');
        enemy.setScale(Phaser.Math.FloatBetween(1.6, 2.3));
        enemy.setVelocityY(Phaser.Math.Between(this.enemySpeed, this.enemySpeed + 120));
        enemy.body.setAllowGravity(false);

        this.scene.physics.add.collider(enemy, this.platforms, () => {
            enemy.setVelocityY(0);
        });

        this.enemyData.push({ x, sprite: enemy });
        this.lastEnemySpawnX = x;
    }

    getGroup() {
        return this.enemies;
    }
}
