import * as PIXI from "@pixi/graphics";

const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;
const scaleFactor = Math.min(WindowWidth, WindowHeight) / 550; // Ajustez le facteur selon vos besoins
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


        this.displayBody();
        this.displayTracks();
        this.displayHead();



        this._tankBody.x = this._coordinateSpawnX;
        this._tankBody.y = this._coordinateSpawnY;
    }

    displayHead() {

        const headRadius = 18 * scaleFactor;
        const headCenter = 25 * scaleFactor;
        const rectX = 20 * scaleFactor;
        const rectY = 10 * scaleFactor;
        const rectWidth = 10 * scaleFactor;
        const rectHeight = 50 * scaleFactor;
        const innerRectX = 21 * scaleFactor;
        const innerRectY = 11 * scaleFactor;
        const innerRectWidth = 8 * scaleFactor;
        const innerRectHeight = 48 * scaleFactor;
        const innerCircleRadius = 16 * scaleFactor;

        // Tête contour
        this._tankHead.beginFill(0x000000);
        this._tankHead.drawCircle(headCenter, headCenter, headRadius);
        this._tankHead.endFill();

        // Mire contour
        this._tankHead.beginFill(0x000000);
        this._tankHead.drawRect(rectX, rectY, rectWidth, rectHeight);
        this._tankHead.endFill();

        // Mire intérieur
        this._tankHead.beginFill(this._color);
        this._tankHead.drawRect(innerRectX, innerRectY, innerRectWidth, innerRectHeight);
        this._tankHead.endFill();

        // Tête intérieur
        this._tankHead.beginFill(this._color);
        this._tankHead.drawCircle(headCenter, headCenter, innerCircleRadius);
        this._tankHead.endFill();

        this._tankBody.addChild(this._tankHead);
    }

    displayTracks() {
        // Dimensions des jambes (tracks) ajustées selon l'échelle
        const trackWidth = 5 * scaleFactor; // Largeur des jambes
        const trackHeight = 55 * scaleFactor; // Hauteur des jambes
        const trackCornerRadius = 10 * scaleFactor; // Rayon des coins arrondis
        const trackOffsetX = 48 * scaleFactor; // Décalage de la jambe droite
        const trackOffsetY = -2 * scaleFactor; // Décalage vertical
        const metalPlateWidth = 3 * scaleFactor; // Largeur des plaques de métal
        const metalPlateHeight = 7 * scaleFactor; // Hauteur des plaques de métal
        const metalPlateSpacing = 9 * scaleFactor; // Espacement entre les plaques de métal

        // Jambes droit
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(trackOffsetX, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Plaques de métal
            this._tankBody.drawRect(trackOffsetX + 1 * scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankBody.endFill();
        }

        // Jambes gauche
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(-2 * scaleFactor, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Plaques de métal
            this._tankBody.drawRect(-1 * scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankBody.endFill();
        }
    }

    displayBody() {
        // Dimensions du corps du tank
        const bodyWidth = 50 * scaleFactor;  // Largeur proportionnelle du corps
        const bodyHeight = 50 * scaleFactor; // Hauteur proportionnelle du corps
        const bodyX = 0;  // Position X du corps (centré ou ajusté si nécessaire)
        const bodyY = 0;  // Position Y du corps (centré ou ajusté si nécessaire)

        // Dessiner le corps du tank
        this._tankBody.beginFill(this._color);
        this._tankBody.drawRect(bodyX, bodyY, bodyWidth, bodyHeight);
        this._tankBody.endFill();
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