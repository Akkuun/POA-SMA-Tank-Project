import * as PIXI from 'pixi.js';

export class Bullet {
    _bodyBullet;
    _rotationSpeed;
    _app;

    constructor(app) {
        this._app = app;
        this._bodyBullet = new PIXI.Graphics();
        this._rotationSpeed = 0.05;

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

    display(){
        this._app.stage.addChild(this._bodyBullet);
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

    getPosition(){
        return {x: this._bodyBullet.x, y: this._bodyBullet.y};
    }

    getBounds(){
        return this._bodyBullet.getBounds();
    }

    remove(){
        this._app.stage.removeChild(this._bodyBullet);
    }

    shoot(Tank){
        const cannonLength = 50;
        const offsetX = 0;
        console.log(offsetX);
        const offsetY = 0;
        console.log(offsetY);
        const cannonTipX = Tank._tankBody.x + offsetX + cannonLength * Math.sin(-Tank._tankHead.rotation);
        const cannonTipY = Tank._tankBody.y + offsetY + cannonLength * Math.cos(Tank._tankHead.rotation);
        this.setPosition(cannonTipX, cannonTipY);
        this.setDirection(Tank._tankHead.rotation);
    }

}