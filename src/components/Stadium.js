import * as PIXI from 'pixi.js';

export class Stadium {
    _width;
    _height;
    _bodyStadium;

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._bodyStadium = new PIXI.Graphics();
        this._bodyStadium.beginFill(0x800080);
        this._bodyStadium.drawRect(0, 0, this._width, this._height);
        this._bodyStadium.endFill();

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyStadium.position.set(centerX, centerY);
    }

    testForAABB(object) {
        const bounds = object.getBounds();
        const stadiumBounds = this._bodyStadium.getBounds();
        return (
            bounds.x < stadiumBounds.x ||
            bounds.x + bounds.width > stadiumBounds.x + stadiumBounds.width ||
            bounds.y < stadiumBounds.y ||
            bounds.y + bounds.height > stadiumBounds.y + stadiumBounds.height
        );
    }

    isTankInside(tank) {
        const bounds = tank._tankBody.getBounds();
        const stadiumBounds = this._bodyStadium.getBounds();
        return (
            bounds.x >= stadiumBounds.x && //si le x du tank est supérieur ou égal au x du stade
            bounds.x + bounds.width <= stadiumBounds.x + stadiumBounds.width && // si le x du tank + sa largeur est inférieur ou égal au x du stade + sa largeur
            bounds.y >= stadiumBounds.y && // si le y du tank est supérieur ou égal au y du stade
            bounds.y + bounds.height <= stadiumBounds.y + stadiumBounds.height // si le y du tank + sa hauteur est inférieur ou égal au y du stade + sa hauteur
        ); //alors le tank est bien dans le stade
    }

    display(app) {
        app.stage.addChild(this._bodyStadium);
    }


}