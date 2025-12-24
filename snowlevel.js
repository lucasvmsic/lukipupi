<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Snow Adventure Pro</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <script src="snowlevel.js"></script>
    <style>
        body { margin: 0; background: #e0f2fe; overflow: hidden; }
        canvas { display: block; touch-action: none; }
    </style>
</head>
<body>
<script>
const W = 800, H = 1200;

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.load.audio('crash_snd', 'caballo.mp3');
        this.load.image('snow_p', 'https://labs.phaser.io/assets/particles/white.png');
        this.load.image('fondo', 'fondonieve.jpg');
        this.load.image('novio', 'novio.png');
        this.load.image('perro', 'perro.png');
        this.load.image('bola', 'bola.png');
        this.load.image('jijija_img', 'jijijija.png');
        this.load.audio('jijija_snd', 'jijijija.mp3');
    }
    create() {
        // GENERACIÓN DE TEXTURAS REFORZADA PARA ANDROID
        const g = this.add.graphics();
        
        // Carretera
        g.fillStyle(0xf8fafc); g.fillRect(0,0,W,100);
        g.fillStyle(0x475569); g.fillRect(150,0,500,100);
        g.fillStyle(0xffffff, 0.5); g.fillRect(W/2-5, 20, 10, 60);
        g.generateTexture('roadTex', W, 100);

        // Qashqai (Titanium Slate)
        g.clear();
        g.fillStyle(0x5e5b54); g.fillRoundedRect(0,0,120,190,25);
        g.fillStyle(0x1e293b); g.fillRoundedRect(15,45,90,100,10);
        g.fillStyle(0xfef08a); g.fillCircle(25,20,12); g.fillCircle(95,20,12);
        g.generateTexture('carTex', 120, 190);

        // CABALLO (Garantizar visibilidad con bordes negros)
        g.clear();
        g.lineStyle(4, 0x000000); // Borde para que se vea sí o sí
        g.fillStyle(0x4b2c20); 
        g.fillRoundedRect(5, 45, 110, 50, 15);
        g.strokeRoundedRect(5, 45, 110, 50, 15);
        g.fillRoundedRect(90, 5, 30, 70, 10);
        g.fillRoundedRect(100, 5, 45, 25, 5);
        g.generateTexture('horseTex', 150, 100);
        
        g.destroy(); // Limpiar memoria
        this.scene.start('CarLevel');
    }
}

class CarLevel extends Phaser.Scene {
    constructor() { super('CarLevel'); }
    create() {
        this.isPlaying = true; this.elapsed = 0;
        this.bg = this.add.tileSprite(W/2, H/2, W, H, 'roadTex');
        
        this.add.particles('snow_p').createEmitter({
            x: { min: 0, max: W }, y: -20, speedY: { min: 200, max: 400 },
            scale: { start: 0.2, end: 0 }, alpha: 0.5, lifespan: 4000
        });

        this.car = this.physics.add.sprite(W/2, H-200, 'carTex').setDepth(10);
        this.car.setCollideWorldBounds(true);
        this.horses = this.physics.add.group();

        this.timeTxt = this.add.text(W/2, 100, '00:24', { 
            fontSize: '65px', fontStyle: '900', fill: '#0f172a', stroke: '#fff', strokeThickness: 5 
        }).setOrigin(0.5);

        this.time.addEvent({ delay: 900, callback: this.spawnHorse, callbackScope: this, loop: true });
        this.physics.add.overlap(this.car, this.horses, this.onCrash, null, this);
    }

    spawnHorse() {
        if(!this.isPlaying) return;
        let h = this.physics.add.sprite(Phaser.Math.Between(180, 620), -100, 'horseTex');
        h.setVelocityY(600 + (this.elapsed * 12));
        this.horses.add(h);
    }

    onCrash() {
        if(!this.isPlaying) return;
        this.isPlaying = false;
        this.sound.play('crash_snd');
        this.cameras.main.shake(300, 0.03);
        this.physics.pause();
        let btn = this.add.rectangle(W/2, H/2, 400, 120, 0x0f172a).setInteractive();
        this.add.text(W/2, H/2, 'REINTENTAR', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        btn.on('pointerdown', () => this.scene.restart());
    }

    update(_, delta) {
        if(!this.isPlaying) return;
        this.elapsed += delta / 1000;
        this.bg.tilePositionY -= 20;
        
        let timeLeft = Math.max(0, 24 - Math.floor(this.elapsed));
        this.timeTxt.setText('00:' + (timeLeft < 10 ? '0' : '') + timeLeft);

        if(this.input.activePointer.isDown) {
            this.car.x = Phaser.Math.Linear(this.car.x, Phaser.Math.Clamp(this.input.activePointer.x, 150, 650), 0.25);
        }

        if(this.elapsed >= 24) {
            this.isPlaying = false;
            this.cameras.main.fadeOut(800, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('SnowLevel'));
        }
        this.horses.children.iterate(h => { if(h && h.y > H + 100) h.destroy(); });
    }
}

const config = {
    type: Phaser.AUTO, width: W, height: H,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [BootScene, CarLevel, SnowLevel]
};
new Phaser.Game(config);
</script>
</body>
</html>