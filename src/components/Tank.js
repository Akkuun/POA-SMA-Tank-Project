import * as PIXI from "@pixi/graphics";


export class Tank {
    _spawny;
    _spawnx;
    _couleur;
    _speed;
    _keys;
    _controls;
    _tankBody
    constructor(couleur,controls) {
        this._spawnx=0;
        this._spawny=0;
        this._couleur = couleur;

        this._speed = 2;
        this._keys = {};

        this._controls=controls;
        this._tankBody = new PIXI.Graphics();

        // Listeners pour les touches
        window.addEventListener("keydown", (e) => {
            this._keys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this._keys[e.key] = false;
        });
    }



    get couleur() {
        return this._couleur;
    }

    set couleur(value) {
        this._couleur = value;
    }


    get spawny() {
        return this._spawny;
    }

    set spawny(value) {
        this._spawny = value;
    }

    get spawnx() {
        return this._spawnx;
    }

    set spawnx(value) {
        this._spawnx = value;
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
        this._tankBody.beginFill(this._couleur);
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

        this._tankBody.beginFill(0x000000); // Tete contour
        this._tankBody.drawCircle(25, 25, 18);
        this._tankBody.endFill();
        this._tankBody.beginFill(0x000000);// Mire contour
        this._tankBody.drawRect(20, 10, 10, 50);
        this._tankBody.endFill();
        this._tankBody.beginFill(this._couleur); // Mire interieur
        this._tankBody.drawRect(21, 11, 8, 48);
        this._tankBody.endFill();
        this._tankBody.beginFill(this._couleur); // Tete interieur
        this._tankBody.drawCircle(25, 25, 16);
        this._tankBody.endFill();

        this._tankBody.x = this._spawnx;
        this._tankBody.y = this._spawny;
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
}