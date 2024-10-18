import * as PIXI from 'pixi.js';

export class Particle {
    constructor(app, x, y, typeOfParticle) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.size = 8;
        this.lifeSpan = 40;
        this.startTime = Date.now();
        switch (typeOfParticle) {
            case 1 :
                this.sprite = new PIXI.Graphics();
                this.sprite.beginFill(0xffffff);
                this.sprite.drawCircle(0, 0, this.size);
                this.sprite.endFill();
                this.sprite.x = x;
                this.sprite.y = y;

                break;
            default:
                return;
        }
        this.app.stage.addChild(this.sprite);
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        this.size -= 0.05;

        this.sprite.scale.set(this.size / 5);

        if (elapsed > this.lifeSpan) {
            this.sprite.destroy();
            return false;
        }
        return true;
    }
}


