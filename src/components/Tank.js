import * as PIXI from "@pixi/graphics";
import {Bullet} from "./Bullet";

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
    _rotationSpeed;
    _targetRotation;
    _stadiumWidth;
    _stadiumHeight;
    _bulletPath;
    _previousX;
    _previousY;
    _previousRotation;

    constructor(color,controls, stadiumWidth, stadiumHeight) {
    _app;
    constructor(color,controls, stadiumWidth, stadiumHeight, app) {
        this._app=app;

        this._coordinateSpawnX=0;
        this._coordinateSpawnY=0;
        this._color = color;

        this._speed = 2;
        this._rotationSpeed = 0.03;
        this._keys = {};

        this._controls=controls;
        this._tankBody = new PIXI.Graphics();
        this._tankHead = new PIXI.Graphics();

        this._stadiumWidth = stadiumWidth;
        this._stadiumHeight = stadiumHeight;

        this._bulletPath = new PIXI.Graphics();
        this._bulletPath.visible = false; // Masquez-le par défaut

        this._previousX = 0;
        this._previousY = 0;
        this._previousRotation = 0;

        // Listeners pour les touches
        window.addEventListener("keydown", (e) => {
            this._keys[e.key] = true;
        });

        window.addEventListener("keyup", (e) => {
            this._keys[e.key] = false;
        });

        this.displayBody();
        this.displayTracks();
        this.displayHead();

        this._tankBody.x = this._coordinateSpawnX;
        this._tankBody.y = this._coordinateSpawnY;
    }
    // do a specific action base on the tank's action
    performAction(action){


        // eslint-disable-next-line default-case
        switch (action) {
            case 'shoot': // if the tank need to shoot, we update the bullet path and make it visible
                console.log("shoot");
                this.updateBulletPath();
                this._bulletPath.visible = true;
                break;
            case 'getBulletPath':
                if (this._bulletPath.visible) return;
                this.updateBulletPath();
                break;
        }
    }

    getBoundsForCollision() {
        return {
            left : this._tankBody.x,
            right : this._tankBody.x + this._tankBody.width,
            top : this._tankBody.y,
            bottom : this._tankBody.y + this._tankBody.height
        }
    }
        //put the bullet path in the tank attribute
        updateBulletPath() {
            this._bulletPath.clear();
            const path = this.getBulletPath();
            this._bulletPath.addChild(path);
        }

    getBulletPath() {
        const bulletPath = new PIXI.Graphics();
        bulletPath.lineStyle(2, 0xff0000);
        bulletPath.moveTo(this._tankHead.x, this._tankHead.y);

        let x = this._tankHead.x;
        let y = this._tankHead.y;
        let angle = this._tankHead.rotation + this._tankBody.rotation;
        let step = 5;
        let i = 0;

        while (i < 1000) {
            x += step * Math.cos(angle);
            y += step * Math.sin(angle);
            bulletPath.lineTo(x, y);
            i++;
            if (x < 0 || x > this._stadiumWidth || y < 0 || y > this._stadiumHeight) {
                angle = Math.PI - angle;
            }
        }
        return bulletPath;
    }

    checkCollision(otherTank) {
        let bounds = this.getBoundsForCollision();
        let otherBounds = otherTank.getBoundsForCollision();
        return (
            bounds.left < otherBounds.right &&
            bounds.right > otherBounds.left &&
            bounds.top < otherBounds.bottom &&
            bounds.bottom > otherBounds.top
        );
    }

    resolveCollision(otherTank) {
        let bounds = this.getBoundsForCollision();
        let otherBounds = otherTank.getBoundsForCollision();

        const overlapX = Math.min(bounds.right, otherBounds.right) - Math.max(bounds.left, otherBounds.left);
        const overlapY = Math.min(bounds.bottom, otherBounds.bottom) - Math.max(bounds.top, otherBounds.top);

        if (overlapX > overlapY) {
            if (bounds.top < otherBounds.top) {
                this._tankBody.y -= overlapY / 2;
                otherTank._tankBody.y += overlapY / 2;
            } else {
                this._tankBody.y += overlapY / 2;
                otherTank._tankBody.y -= overlapY / 2;
            }
        } else {
            if (bounds.left < otherBounds.left) {
                this._tankBody.x -= overlapX / 2;
                otherTank._tankBody.x += overlapX / 2;
            } else {
                this._tankBody.x += overlapX / 2;
                otherTank._tankBody.x -= overlapX / 2;
            }
        }
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

        // Attach point for the head to the body to rotate
        this._tankHead.pivot.set(headCenter, headCenter);
        this._tankHead.x = this._tankBody.x + 25 * scaleFactor;
        this._tankHead.y = this._tankBody.y + 25 * scaleFactor;

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

        // Pivot point for the body to rotate
        this._tankBody.pivot.set(this._tankBody.width / 2, this._tankBody.height / 2);
    }

    updatePosition(stadium) {
        const hasMoved = this._previousX !== this._tankBody.x || this._previousY !== this._tankBody.y;
        const hasRotated = this._previousRotation !== (this._tankHead.rotation + this._tankBody.rotation);



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
            this._tankBody.x += this._speed;
        }
        if(this._keys[this._controls.shoot]){
            console.log("shoot tank "+this._color);
            let bullet = new Bullet(this._app);
            bullet.display();
            bullet.shoot(this);
            setTimeout(() => {
                bullet.remove(); // Supprimez la balle après 5 secondes
            }, 5000);

        }

        let tankBounds = this._tankBody.getBounds();
        let stadiumBounds = stadium._bodyStadium.getBounds();

        if (!stadium.isTankInside(this)) { // Check if the tank is outside the stadium

            if (tankBounds.x < stadiumBounds.x) {
                this._tankBody.x += this._speed;
            }
            if(tankBounds.x + tankBounds.width > stadiumBounds.x + stadiumBounds.width) {
                this._tankBody.x -= this._speed;
            }
            if (tankBounds.y < stadiumBounds.y) {
                this._tankBody.y += this._speed;
            }
            if (tankBounds.y + tankBounds.height > stadiumBounds.y + stadiumBounds.height) {
                this._tankBody.y -= this._speed;
            }
        }
        //if the tank posititons has changed, we update the bullet path to avoid too much computation
        if (hasMoved || hasRotated) {
            console.log("the tanks has moved and we update the bullet path");
            this.performAction('getBulletPath');
            this._previousX = this._tankBody.x;
            this._previousY = this._tankBody.y;
            this._previousRotation = this._tankHead.rotation + this._tankBody.rotation;
        }
    }

    updateRotations(mouseX, mouseY) {
        this.updateBodyRotation();
        this.updateCannonPosition(mouseX, mouseY);
    }

    updateBodyRotation() {
        let dX = this._keys[this._controls.right] ? 1 : - this._keys[this._controls.left] ? -1 : 0;
        let dY = this._keys[this._controls.down] ? 1 : - this._keys[this._controls.up] ? -1 : 0;
        if (dX === 0 && dY === 0) {
            return;
        }
        this._targetRotation = Math.atan2(dY, dX) - Math.PI / 2;
        let delta = this._targetRotation - this._tankBody.rotation;
        // Keep the delta between -PI and PI
        while (delta > Math.PI) {
            delta -= Math.PI * 2;
        }
        while (delta < -Math.PI) {
            delta += Math.PI * 2;
        }
        // Rotate the body
        if (Math.abs(delta) < this._rotationSpeed) {
            this._tankBody.rotation = this._targetRotation;
        } else {
            this._tankBody.rotation += this._rotationSpeed * Math.sign(delta);
        }
    }

    updateCannonPosition(mouseX, mouseY) {
        this._tankHead.rotation = Math.atan2(mouseY - this._tankBody.y, mouseX - this._tankBody.x) - Math.PI / 2 - this._tankBody.rotation;
    }
}