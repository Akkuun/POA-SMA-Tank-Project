import * as PIXI from "@pixi/graphics";


export class Tank {
    _coordinateSpawnY;
    _coordinateSpawnX;
    _color;
    _speed;
    _keys;
    _controls;
    _tankBody;
    _tankHead;
    constructor(color,controls) {
        this._coordinateSpawnX=0;
        this._coordinateSpawnY=0;
        this._color = color;

        this._speed = 2;
        this._keys = {};

        this._controls=controls;
        this._tankBody = new PIXI.Graphics();
        this._tankHead = new PIXI.Graphics();

        // Listeners pour les touches
        window.addEventListener("keydown", (e) => {
            this._keys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this._keys[e.key] = false;
        });

        // listener pour le curseur
        /*window.addEventListener("mousemove", (e) => {
            this.updateCannonPosition(e.clientX, e.clientY);
        });*/
    }



    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }


    get coordinateSpawnY() {
        return this._coordinateSpawnY;
    }

    set coordinateSpawnY(value) {
        this._coordinateSpawnY = value;
    }

    get coordinateSpawnX() {
        return this._coordinateSpawnX;
    }

    set coordinateSpawnX(value) {
        this._coordinateSpawnX = value;
    }


    get tankBody() {
        return this._tankBody;
    }

    set tankBody(value) {
        this._tankBody = value;
    }

    get controls() {
        return this._controls;
    }

    set controls(value) {
        this._controls = value;
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    display(){

        // Corps
        this._tankBody.beginFill(this._color);
        this._tankBody.drawRect(0, 0, 50, 50);
        this._tankBody.endFill();

        // Jambes
        // droit
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(48, -2, 5, 55, 10);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Plaques de métal
            this._tankBody.drawRect(49, i * 9, 3, 7);
            this._tankBody.endFill();
        }

        //gauche
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(-2, -2, 5, 55, 10);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Plaques de métal
            this._tankBody.drawRect(-1, i * 9, 3, 7);
            this._tankBody.endFill();
        }

        this._tankHead.beginFill(0x000000); // Tete contour
        this._tankHead.drawCircle(25, 25, 18);
        this._tankHead.endFill();
        this._tankHead.beginFill(0x000000);// Mire contour
        this._tankHead.drawRect(20, 10, 10, 50);
        this._tankHead.endFill();
        this._tankHead.beginFill(this._color); // Mire interieur
        this._tankHead.drawRect(21, 11, 8, 48);
        this._tankHead.endFill();
        this._tankHead.beginFill(this._color); // Tete interieur
        this._tankHead.drawCircle(25, 25, 16);
        this._tankHead.endFill();
        this._tankBody.addChild(this._tankHead);

        this._tankBody.x = this._coordinateSpawnX;
        this._tankBody.y = this._coordinateSpawnY;
    }

    updatePosition() {
        if (this._keys[this._controls.up]) {
            this._tankBody.y -= this._speed;
        }
        if (this._keys[this._controls.left]) {
            this._tankBody.x -= this._speed;
        }
        if (this._keys[this._controls.down]) {
            this._tankBody.y += this._speed;
        }
        if (this._keys[this._controls.right]) {
            this._tankBody.x+= this._speed;
        }
    }

    updateCannonPosition(mouseX, mouseY) {

        let rect = this._tankBody.getBounds();
        let centerX = rect.x + rect.width / 2;
        let centerY = rect.y + rect.height / 2;

        // Met à jour la rotation de la mire
        this._tankHead.rotation = Math.atan2(mouseY - centerY, mouseX - centerX);
    }


}