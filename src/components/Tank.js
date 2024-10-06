import * as PIXI from "@pixi/graphics";
import {Bullet} from "./Bullet";

const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;
const scaleFactor = Math.min(WindowWidth, WindowHeight) / 700; //Main factor to scale the tank

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

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
    _speedWhileRotating;
    _targetRotation;
    _stadiumWidth;
    _stadiumHeight;
    _bulletPath;
    _previousX;
    _previousY;
    _previousRotation;
    _stadiumObject;
    _app;
    _shortCooldown = false; // Cooldown entre chaque tir
    _maxBullets;
    _bulletsCooldown = 0; // Nombre de balles tirées simultanément, toujours < maxBullets
    constructor(color, controls, stadiumWidth, stadiumHeight, stadiumObject, app, spawnX=0, spawnY=0, maxBullets=5) {
        this._coordinateSpawnX = spawnX;
        this._coordinateSpawnY = spawnY;
        this._app=app;

        this._color = color;

        this._maxBullets = maxBullets;

        this._speed = 2;
        this._speedWhileRotating = this._speed * 0.7;
        this._rotationSpeed = 0.02;
        this._keys = {};

        this._controls = controls;
        this._tankBody = new PIXI.Graphics();
        this._tankHead = new PIXI.Graphics();

        this._stadiumWidth = stadiumWidth;
        this._stadiumHeight = stadiumHeight;
        this._stadiumObject = stadiumObject;

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
    performAction(action) {


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
            left: this._tankBody.x,
            right: this._tankBody.x + this._tankBody.width,
            top: this._tankBody.y,
            bottom: this._tankBody.y + this._tankBody.height
        }
    }

    rayCastNearestEmptySpace(startX, startY, angle) { // Retourne la distance jusqu'à l'espace hors mur le plus proche
        let x = startX;
        let y = startY;
        let step = 1;
        while (this._stadiumObject.isPointInside(x, y) && this._stadiumObject.isPointInsideAWall(x, y)) {
            x = startX + Math.cos(angle) * step;
            y = startY + Math.sin(angle) * step;
            step++;
        }
        if (this._stadiumObject.isPointInside(x, y)) {
            return distance(startX, startY, x, y);
        } else {
            return Infinity;
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

        const bodyCenterX = this._tankBody.x;
        const bodyCenterY = this._tankBody.y;

        const cannonOffset = 25 * scaleFactor;  // Distance entre le centre du tank et l'extrémité du canon
        const cannonLength = 25 * scaleFactor;  // Longueur du canon

        // Calcule la rotation globale avec un ajustement de +PI
        let globalRotation = this._tankBody.rotation + this._tankHead.rotation + Math.PI / 2;

        let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
        let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;

        bulletPath.moveTo(cannonX, cannonY);

        const stadiumBounds = this._stadiumObject._bodyStadium.getBounds();
        let lineLength = 0;
        let maxBounces = 3; // Nombre maximum de rebonds
        let bounces = 0;

        while (bounces < maxBounces) {
            lineLength = 0;
            let collisionDetected = false;

            // Continue à tracer la ligne jusqu'à ce qu'on touche un mur
            while (!collisionDetected) {
                lineLength += 0.5;
                let endX = cannonX + Math.cos(globalRotation) * lineLength;
                let endY = cannonY + Math.sin(globalRotation) * lineLength;
                bulletPath.lineTo(endX, endY);

                // Détection de collision avec les bords du stade
                if (endX <= stadiumBounds.x || endX >= stadiumBounds.x + stadiumBounds.width) {
                    // Rebond sur un mur vertical (gauche ou droite)
                    globalRotation = Math.PI - globalRotation; // Inversion sur l'axe X
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else if (endY <= stadiumBounds.y || endY >= stadiumBounds.y + stadiumBounds.height) {
                    // Rebond sur un mur horizontal (haut ou bas)
                    globalRotation = -globalRotation; // Inversion sur l'axe Y
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else {
                    for (let wall of this._stadiumObject._walls) {
                        if (wall.isInside(endX, endY)) {
                            // Tester la distance jusqu'à l'espace vide le plus proche pour chaque rebond possible
                            let rotations = [Math.PI - globalRotation, -globalRotation]; 
                            let distances = rotations.map(rotation => this.rayCastNearestEmptySpace(endX, endY, rotation));
                            // Trouver la distance minimale, et donc la rotation correspondante
                            let minDistance = Math.min(...distances);
                            let minIndex = distances.indexOf(minDistance);
                            globalRotation = rotations[minIndex];
                            collisionDetected = true;
                            cannonX = endX;
                            cannonY = endY;
                            break;
                        }
                    }

                }
            }

            // Incrémenter le nombre de rebonds
            bounces += 1;
        }

        return bulletPath;
    }

    // Pareil que getBulletPath mais retourne le début et la fin de chaque segment de la trajectoire au lieu d'afficher le chemin. Utilisé pour l'animation
    getBulletPathCurve() {
        const bodyCenterX = this._tankBody.x;
        const bodyCenterY = this._tankBody.y;

        const cannonOffset = 25 * scaleFactor;  // Distance entre le centre du tank et l'extrémité du canon
        const cannonLength = 25 * scaleFactor;  // Longueur du canon

        // Calcule la rotation globale avec un ajustement de +PI
        let globalRotation = this._tankBody.rotation + this._tankHead.rotation + Math.PI / 2;

        let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
        let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;

        let path = [{startX: cannonX, startY: cannonY, endX: cannonX, endY: cannonY, rotation: globalRotation}]; 

        const stadiumBounds = this._stadiumObject._bodyStadium.getBounds();
        let lineLength = 0;
        let maxBounces = 3; // Nombre maximum de rebonds
        let bounces = 0;

        while (bounces < maxBounces) {
            lineLength = 0;
            let collisionDetected = false;

            // Continue à tracer la ligne jusqu'à ce qu'on touche un mur
            while (!collisionDetected) {
                lineLength += 0.5;
                let endX = cannonX + Math.cos(globalRotation) * lineLength;
                let endY = cannonY + Math.sin(globalRotation) * lineLength;

                // Détection de collision avec les bords du stade
                if (endX <= stadiumBounds.x || endX >= stadiumBounds.x + stadiumBounds.width) {
                    // Rebond sur un mur vertical (gauche ou droite)
                    globalRotation = Math.PI - globalRotation; // Inversion sur l'axe X
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else if (endY <= stadiumBounds.y || endY >= stadiumBounds.y + stadiumBounds.height) {
                    // Rebond sur un mur horizontal (haut ou bas)
                    globalRotation = -globalRotation; // Inversion sur l'axe Y
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else {
                    for (let wall of this._stadiumObject._walls) {
                        if (wall.isInside(endX, endY)) {
                            // Tester la distance jusqu'à l'espace vide le plus proche pour chaque rebond possible
                            let rotations = [Math.PI - globalRotation, -globalRotation];
                            let distances = rotations.map(rotation => this.rayCastNearestEmptySpace(endX, endY, rotation));
                            // Trouver la distance minimale, et donc la rotation correspondante
                            let minDistance = Math.min(...distances);
                            let minIndex = distances.indexOf(minDistance);
                            globalRotation = rotations[minIndex];
                            collisionDetected = true;
                            cannonX = endX;
                            cannonY = endY;
                            break;
                        }
                    }

                }
            }
            
            // Incrémenter le nombre de rebonds
            bounces += 1;
            
            path[path.length - 1].endX = cannonX;
            path[path.length - 1].endY = cannonY;
            if (bounces < maxBounces) {
                path.push({startX: cannonX, startY: cannonY, endX: cannonX, endY: cannonY, rotation: globalRotation});
            }
        }

        return path;
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
            this._tankBody.drawRect(trackOffsetX + scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
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

        let speed = this._targetRotation === this._tankBody.rotation ? this._speed : this._speedWhileRotating;

        const hasMoved = this._previousX !== this._tankBody.x || this._previousY !== this._tankBody.y;
        const hasRotated = this._previousRotation !== (this._tankHead.rotation + this._tankBody.rotation);



        if (this._keys[this._controls.up] && !this._shortCooldown) {
            this._tankBody.y -= speed;
        }
        if (this._keys[this._controls.left] && !this._shortCooldown) {
            this._tankBody.x -= speed;
        }
        if (this._keys[this._controls.down] && !this._shortCooldown) {
            this._tankBody.y += speed;
        }
        if (this._keys[this._controls.right] && !this._shortCooldown) {
            this._tankBody.x += speed;
        }

        if(this._keys[this._controls.shoot]){
            if (!this._shortCooldown && this._bulletsCooldown < this._maxBullets) {
                console.log("shoot tank "+this._color);
                let bullet = new Bullet(this._app);
                bullet.display();
                bullet.shoot(this);

                // Cooldown entre chaque tir et +1 balle tirée actuellement
                this._shortCooldown = true; 
                this._bulletsCooldown++;
                setTimeout(() => {
                    this._shortCooldown = false;
                }, 200);
                
                setTimeout(() => {
                    bullet.remove(); // Supprimez la balle après 5 secondes
                }, 5000);
            }
        }


        let tankBounds = this._tankBody.getBounds();
        let stadiumBounds = stadium._bodyStadium.getBounds();

        if (!stadium.isTankInside(this)) { // Check if the tank is outside the stadium

            if (tankBounds.x < stadiumBounds.x) {
                this._tankBody.x += this._speed;
            }
            if (tankBounds.x + tankBounds.width > stadiumBounds.x + stadiumBounds.width) {
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
        if ((hasMoved || hasRotated) && stadium.isTankInside(this) && (this._keys[this._controls.up] || this._keys[this._controls.down] || this._keys[this._controls.left] || this._keys[this._controls.right])) {
            // temporary fix to avoid multiple bullet path at the beginning, true fix is using spawn position to not move the tank at the beginning
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
        let dX = this._keys[this._controls.right] ? 1 : -this._keys[this._controls.left] ? -1 : 0;
        let dY = this._keys[this._controls.down] ? 1 : -this._keys[this._controls.up] ? -1 : 0;
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

