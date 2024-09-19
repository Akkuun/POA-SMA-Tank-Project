import * as PIXI from "@pixi/graphics";

const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;
const scaleFactor = Math.min(WindowWidth, WindowHeight) / 550; //Main factor to scale the tank

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

        // head contour
        this._tankHead.beginFill(0x000000);
        this._tankHead.drawCircle(headCenter, headCenter, headRadius);
        this._tankHead.endFill();

        // External cannon
        this._tankHead.beginFill(0x000000);
        this._tankHead.drawRect(rectX, rectY, rectWidth, rectHeight);
        this._tankHead.endFill();

        // Internal cannon
        this._tankHead.beginFill(this._color);
        this._tankHead.drawRect(innerRectX, innerRectY, innerRectWidth, innerRectHeight);
        this._tankHead.endFill();

        // Internal head
        this._tankHead.beginFill(this._color);
        this._tankHead.drawCircle(headCenter, headCenter, innerCircleRadius);
        this._tankHead.endFill();

        this._tankBody.addChild(this._tankHead);
    }

    displayTracks() {

        const trackWidth = 5 * scaleFactor;
        const trackHeight = 55 * scaleFactor;
        const trackCornerRadius = 10 * scaleFactor;
        const trackOffsetX = 48 * scaleFactor; // Horizontal offset
        const trackOffsetY = -2 * scaleFactor; // Vertical offset
        const metalPlateWidth = 3 * scaleFactor;
        const metalPlateHeight = 7 * scaleFactor;
        const metalPlateSpacing = 9 * scaleFactor;

        // Right Track
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(trackOffsetX, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Metal plates
            this._tankBody.drawRect(trackOffsetX +  scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankBody.endFill();
        }

        // Left Track
        this._tankBody.beginFill(0x000000); // Contour
        this._tankBody.drawRoundedRect(-2 * scaleFactor, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankBody.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankBody.beginFill(0xC0c0c0); // Metal plates
            this._tankBody.drawRect(-1 * scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankBody.endFill();
        }
    }

    displayBody() {
        // Body dimensions
        const bodyWidth = 50 * scaleFactor;
        const bodyHeight = 50 * scaleFactor;
        const bodyX = 0;  // X body position (centered or adjusted if necessary)
        const bodyY = 0;  // Y body position (centered or adjusted if necessary)

        // Body draw
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
        let centerX = rect.x + rect.width;
        let centerY = rect.y + rect.height;

        // Met à jour la rotation de la mire
        this._tankHead.rotation = Math.atan2(mouseY - centerY, mouseX - centerX);
    }


}