import * as PIXI from 'pixi.js';

export class Bullet {
    _bodyBullet;

    constructor() {
        this._bodyBullet = new PIXI.Graphics();

        this._bodyBullet.beginFill(0x7c7c7c); //#7c7c7c
        this._bodyBullet.drawEllipse(100,100,15,15);
        this._bodyBullet.endFill();

        this._bodyBullet.beginFill(0xc4ac4c);
        this._bodyBullet.drawRect(86,105,28,75);
        this._bodyBullet.drawRect(85,110,30,75);
        this._bodyBullet.endFill();

    }

    display(app){
        app.stage.addChild(this._bodyBullet);
    }
}