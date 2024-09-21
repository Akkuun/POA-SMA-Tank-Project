import * as PIXI from 'pixi.js';

export class Bullet {
    _bodyBullet;
    _rotationSpeed;

    constructor() {
        this._bodyBullet = new PIXI.Graphics();
        this._rotationSpeed = 0.05;

        // Définir le style de la ligne et la couleur de remplissage
        const lineWidth = 2;
        const lineColor = 0x000000;
        const fillColor = 0xd8a952;
        const startX = 6;
        const startY = 6;
        const endX = startX*3;
        const endY = startY*2;
        const controlX = startX*2;
        const controlY = startY*6;



        const rectWidth = endX - startX;
        const rectHeight = endY - startY;

        this._bodyBullet.lineStyle(lineWidth, lineColor, 1);
        this._bodyBullet.beginFill(fillColor);
        this._bodyBullet.drawRect(startX, startY-(rectHeight+startY), rectWidth, rectHeight+startY);
        this._bodyBullet.endFill();

        this._bodyBullet.beginFill(0xB36700);
        this._bodyBullet.moveTo(startX, startY);
        this._bodyBullet.lineTo(endX, startY);
        this._bodyBullet.lineTo(endX, endY);
        this._bodyBullet.quadraticCurveTo(controlX, controlY, startX, endY);
        this._bodyBullet.lineTo(startX, startY);
        this._bodyBullet.endFill();

        this._bodyBullet.pivot.set(startX + rectWidth / 2, startY - (rectHeight + startY) / 2);//centre de rotation

    }

    display(app){
        app.stage.addChild(this._bodyBullet);
    }

    update() {
        this._bodyBullet.rotation += this._rotationSpeed;
    }

    setDirection(rotation) {
        this._bodyBullet.rotation = rotation;
    }

    setPosition(x, y) {
        this._bodyBullet.x = x;
        this._bodyBullet.y = y;
    }
}