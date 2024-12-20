import * as PIXI from "@pixi/graphics";
import {Bullet} from "./Bullet";
import {ScaleFactor} from "./ScaleFactor";
import {Particle} from "./Particle";
import { AABB } from "./AABB";
import {Agent} from "./Agent";

const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;
const scaleFactor = ScaleFactor;
const fixSize = 1.2;

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export const Action = {
    Up: 'Up',
    Down: 'Down',
    Left: 'Left',
    Right: 'Right',
    UpLeft: 'UpLeft',
    UpRight: 'UpRight',
    DownLeft: 'DownLeft',
    DownRight: 'DownRight',
    Shoot: 'Shoot'
};

export class Tank extends Agent{
    _destroyed = false;
    _coordinateSpawnY;
    _coordinateSpawnX;
    _color;
    _speed;
    _keys;
    _controls;
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
    _shortCooldown = false; // Cooldown between each bullet
    _maxBullets;
    _bulletsCooldown = 1; // number of bullet shoot simultaneously < maxBullets
    _player;
    _particles = [];
    _dangerousBullet;
    _tankTracks;
    _trackMarks;
    _trackMarkCounter = 0;
    _trackMarkThreshold = 3 ;
    _maxBounces = 2;

    createParticle(x, y, typeOfParticle) {
        this._particles.push(new Particle(this._app, x, y, typeOfParticle));
    }

    updateParticles() {
        if (!this._app.stage) return;
        this._particles = this._particles.filter(particle => particle.update());
    }

    deleteParticles() {
        this._particles.forEach(particle => particle.delete());

    }

    //function that return the distance between two objects
    checkDistance(tank, object) {
        //distance given by the formula  : sqrt((x2-x1)^2 + (y2-y1)^2
        return Math.sqrt((tank.x - object.x) ** 2 + (tank.y - object.y) ** 2);
    }


    get x() {
        return this._body.x;
    }

    get y() {
        return this._body.y;
    }

    constructor(color, controls, stadiumWidth, stadiumHeight, stadiumObject, app, spawnX, spawnY, maxBullets = 4, player) {
        super((spawnX-(50 * fixSize * scaleFactor)/2), (spawnY-(50 * fixSize * scaleFactor)/2), 50 * fixSize * scaleFactor / 2, 50 * fixSize * scaleFactor / 2, app, stadiumObject);
        this._coordinateSpawnX = spawnX;
        this._coordinateSpawnY = spawnY;

        this._player = player;

        this._color = color;

        this._maxBullets = maxBullets;

        this._speed = 3 * fixSize * scaleFactor;
        this._speedWhileRotating = this._speed * 0.7;
        this._rotationSpeed = 0.05 * fixSize;
        this._keys = {};

        this._controls = controls;
        this._body = new PIXI.Graphics();
        this._tankTracks = new PIXI.Graphics();
        this._trackMarks = new PIXI.Graphics();
        this._trackMarks.zIndex = 4;
        app.stage.addChild(this._trackMarks);
        this._tankHead = new PIXI.Graphics();

        this._stadiumWidth = stadiumWidth;
        this._stadiumHeight = stadiumHeight;
        this._gameManager = stadiumObject;

        this._bulletPath = new PIXI.Graphics();
        this._bulletPath.visible = false; // Masquez-le par défaut

        this._previousX = 0;
        this._previousY = 0;
        this._previousRotation = 0;

        if (this._player) {
            // Listeners pour les touches
            window.addEventListener("keydown", (e) => {
                this._keys[e.key] = true;
            });

            window.addEventListener("keyup", (e) => {
                this._keys[e.key] = false;
            });
        }
        this._body.zIndex = 15;
        this.display();
        
        this._body.x = this._coordinateSpawnX;
        this._body.y = this._coordinateSpawnY;
    }

    see() {
        return this._gameManager;
    }

    display(){
        this.displayBody();
        this.displayTracks();
        this.displayHead();
    }

    //function that return the closest bullet that can hit the tank, if there is none return null
    safeMove(bulletsArray) {
        let dangerousBullets = [];

        if (bulletsArray.length === 0) return null; // if there is no bullet in the stadium the tank is safe
        for (let i = 0; i < bulletsArray.length; i++) {
            if (bulletsArray[i].willIntersect(this)) dangerousBullets.push(bulletsArray[i]);
        }
        if (dangerousBullets.length === 0) return null; // if no bullet incomming the tank is safe
        let closestBullet = dangerousBullets[0];

        for (let bullet in dangerousBullets) {
            if (this.checkDistance(this, bullet) < this.checkDistance(this, closestBullet)) closestBullet = bullet; // we get the closest bullet incomming
        }
        this._dangerousBullet = closestBullet; // we save the closest bullet incomming
        return closestBullet;
    }
    //change the cannon Rotation by x degree passed in parameter
    changeCannonRotation(degree) {
        this._tankHead.rotation += degree * (Math.PI / 180);

    }


    move(axis, value) {
        this._body[axis] += value;
        this._aabb.move(axis, value);
    }

    //function that return if the tank can shoot a static object ( wall or tank) based on his actual position, we use the tankHead and tankBody rotation to calculate the possible shoot and we do a 360° rotation
    canShootStaticObject(staticObject) {
        this.changeCannonRotation(9); // 10 ° rotation
        let path = this.getBulletPathCurveOP();

        for (let segment of path) {

            if (this.isSegmentTouchingTank(staticObject, segment.startX, segment.startY, segment.endX, segment.endY)) {
                return true;
            }
        }
        return false
    }

    //function that return if the tank can shoot a moving object ( bullet) based on his actual position, we use the tankHead and tankBody rotation to calculate the possible shoot and we do a 360° rotation
    canShootMovingObject(bullet) {

        let result = bullet.willIntersect(this);

       // console.log(result);
        return result.distance >= 0 && result.distance <= this._body.width;



    }

    //shoot on the x,y Object position passed in parameter
    shoot() {
        this.updatePositionIA(this._gameManager, Action.Shoot, this._speed);

    }
    //function that align the cannon to the incomming bullet and shoot
    shootIncommingBullet(bullet) {
         const bulletCoordinate = bullet.getBounds();

         this.performAgentAction(Action.Shoot,bulletCoordinate.x,bulletCoordinate.y);
         this._dangerousBullet = null;
    }

    //function that perform the correct movement action to dodge the incomming bullet
    // the tank will dodge the bullet by moving to the opposite direction of the bullet, but will be blocked by the stadium walls
    dodge(bullet) {
        const bulletCoordinate = bullet.getBounds();
        let finalAction = null;
        if (this._body.x < bulletCoordinate.x) {
            if (this._body.y < bulletCoordinate.y ) { // check if the bullet is on the right or left of the tank and the tank is not colliding with a wall
                finalAction =  Action.UpRight;
            } else {
                finalAction = Action.DownRight;
            }
        } else {
            if (this._body.y < bulletCoordinate.y) {
                finalAction = Action.UpLeft;
            } else {
                finalAction = Action.DownLeft;
            }
        }

        this.performAgentAction(finalAction,bulletCoordinate.x,bulletCoordinate.y);
        //console.log(finalAction)
        this._dangerousBullet = null;
    }












    canShootWall(wall) {
        // Calculate the angle to the walls
        const wallBounds = wall.getBodyWall().getBounds();
        const wallCenterX = wallBounds.x + wallBounds.width / 2;
        const wallCenterY = wallBounds.y + wallBounds.height / 2;
        const angleToWall = Math.atan2(wallCenterY - this._body.y, wallCenterX - this._body.x);

        // Set the tank head rotation to aim at the wall
        this._tankHead.rotation = angleToWall - this._body.rotation - Math.PI / 2;


        let path = this.getBulletPathCurve();

        for (let segment of path) {
            if (this.isSegmentTouchingWall(wall, segment.startX, segment.startY, segment.endX, segment.endY)) {

                return true;
            }
        }
        return false;
    }

    //function that return the action to do based on the environnement -> IA strategies
    choseAgentAction(mouseX, mouseY) {
//PSEUDO CODE
        /*  let move = this.safeMove(); // check if the tank is in danger -> null if the tank is safe or return the x,y position of the closest bullet
          if (move != null) { //if the tank will be hit by a bullet, try to hit the bullet or dodge it
              if (this.canShootMovingObject(this._dangerousBullet)) {
                  return this.shoot(this._dangerousBullet.x,this._dangerousBullet.y);
              } else {
                  //return this.move(move.x, move.y);
                  this.performActionIA(this.move(move.x,move.y),mouseX,mouseY);
              }
          } else { // if the tank is not in danger, try to hit a tank or a wall , tank is prioritized then destructible wall

              for(let i = 0; i < this._stadiumObject._tanks.length; i++) {
                  if (this === this._stadiumObject._tanks[i]) continue;
                  if (this.canShootStaticObject(this._stadiumObject._tanks[i])) { // shoot the tank without mooving
                      return this.shoot(this._stadiumObject._tanks[i].x,this._stadiumObject._tanks[i].y); // shoot otherTank x,y
                  }
              }
              for (let wall in this._stadiumObject._walls) { //shoot the wall without mooving
                  if (!wall._destruct) continue; // skip non destructible wall
                  if (this.canShootStaticObject(wall)) {
                      return this.shoot(wall.x,wall.y);
                  }
              }
              return null; // or wait environmment to change
          }
          return null;*/


        let move = this.safeMove(this._gameManager._bullets);

        if (move != null) { // the tank is in danger , 1st priority is to shoot the bullet incoming , 2nd priority is to dodge the bullet
            if (this.canShootMovingObject(this._dangerousBullet)) { // if the tank can shoot the bullet incoming
                this.shootIncommingBullet(this._dangerousBullet); // align the cannon to the bullet and shoot
            } else {
                //  console.log("move");
                this.dodge(this._dangerousBullet); // dodge the incoming bullet
            }
            return null;
        }

        // the tank is not in danger , 1st priority is to shoot the tank (if possible) , 2nd priority is to shoot the destructible wall
        for (let tank of this._gameManager._tanks) {
            if (this !== tank && this.canShootStaticObject(tank)) {
                this.shoot();
                return null;
            }
        }
        //if the tank is not in danger and there is no tank to shoot , try to shoot the destructible wall
        // for(let wall of this._stadiumObject._destructiveWalls) {
        //     if (this.canShootWall(wall)) {
        //       //  console.log("shoot wall");
        //        this.shoot();
        //        return null;
        //     }
        // }

        //if the tank is not in danger and there is no tank to shoot , try to find another tank to shoot by going on zone coordinates, so tanks will meat each other on this point
        // let centerx = this._gameManager._bodyStadium.x + this._gameManager._bodyStadium.width / 2;
        //let centery = this._gameManager._bodyStadium.y + this._gameManager._bodyStadium.height / 2;
        //we need to find a good point to meet the other tank, so we will try to go to the center of the stadium
        //the point need to be free of wall, so we will try to go to the right or left depending on the signe of the difference, and do the same for y

        //find a point withouth being in a wall and still in the stadium
        let zone = this._gameManager.getZone();

        //if x is the closet to the point "zone" of the stadium, try to go to the right or left depending on the signe of the difference, and do the same for y
        //also we could save the last input of this part, cause if the tank is blocked by a wall, it will then go in the other part of the "if" cases
        let x = this._body.x;
        let y = this._body.y;

        // Compute the direction to move towards the center
        let moveX = zone.x > x ? Action.Right : Action.Left;
        let moveY = zone.y > y ? Action.Down : Action.Up;

        // Check if the tank is closer to the center horizontally or vertically


        if (Math.abs(zone.x - x) > Math.abs(zone.y - y)) {
            // Try to move horizontally first

            if (!this._gameManager.isPointInsideAWall(x + (moveX === Action.Right ? this._speed : -this._speed), y)) {
                this.performAgentAction(moveX);
            } else if (!this._gameManager.isPointInsideAWall(x, y + (moveY === Action.Down ? this._speed : -this._speed))) {
                // If horizontal move is blocked, try to move vertically
                this.performAgentAction(moveY);
            }
            if (!this._gameManager.isPointInsideAWall(x + (moveX === Action.Right ? this._speed : -this._speed), y)) {
                this.performAgentAction(moveX);
            } else if (!this._gameManager.isPointInsideAWall(x, y + (moveY === Action.Down ? this._speed : -this._speed))) {
                // If horizontal move is blocked, try to move vertically

                this.performAgentAction(moveY);
            }
        } else {
            // Try to move vertically first

            if (!this._gameManager.isPointInsideAWall(x, y + (moveY === Action.Down ? this._speed : -this._speed))) {
                this.performAgentAction(moveY);
            } else if (!this._gameManager.isPointInsideAWall(x + (moveX === Action.Right ? this._speed : -this._speed), y)) {
                // If vertical move is blocked, try to move horizontally

                this.performAgentAction(moveX);
            }
        }



        return null;


    }


    // do a specific action base on the tank's action
    performAgentAction(action, mouseX, mouseY) {
        if (mouseX && mouseY) {
            this.updateCannonPosition(mouseX, mouseY);
        }
        this.updatePosition(this._gameManager, action);
    }

    remove() {
        this._gameManager._tanks.splice(this._gameManager._tanks.indexOf(this), 1);
    }


    rayCastNearestEmptySpace(startX, startY, angle) { // Retourne la distance jusqu'à l'espace hors mur le plus proche
        let x = startX;
        let y = startY;
        let step = 1;
        while (this._gameManager.isPointInside(x, y) && this._gameManager.isPointInsideAWall(x, y)) {
            x = startX + Math.cos(angle) * step;
            y = startY + Math.sin(angle) * step;
            step++;
        }
        if (this._gameManager.isPointInside(x, y)) {
            return distance(startX, startY, x, y);
        } else {
            return Infinity;
        }
    }

    //put the bullet path in the tank attribute
    updateBulletPath() {
        while (this._bulletPath.children[0]) {
            this._bulletPath.removeChild(this._bulletPath.children[0])
        }
        const path = this.getBulletPath();
        this._bulletPath.addChild(path);
        setTimeout(() => {
            this._bulletPath.removeChild(this._bulletPath);
        }, 1000);
    }

    getBoundsForCollision() {
        return {
            left: this._body.x,
            right: this._body.x + this._body.width,
            top: this._body.y,
            bottom: this._body.y + this._body.height
        }
    }

    getBulletPath() {
        const bulletPath = new PIXI.Graphics();
        bulletPath.lineStyle(2, 0xff0000);

        const bodyCenterX = this._body.x;
        const bodyCenterY = this._body.y;

        //const cannonOffset = 25 * scaleFactor;  // length between center of the tank and the edge of canon
        const cannonLength = 25 * fixSize * scaleFactor;  // length of the canon

        // calculation of the global rotation withe adjustment of +PI
        let globalRotation = this._body.rotation + this._tankHead.rotation + Math.PI / 2;

        let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
        let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;

        bulletPath.moveTo(cannonX, cannonY);

        const stadiumBounds = this._gameManager._bodyStadium.getBounds();
        let lineLength = 0;
        let maxBounces = 2; // maximum number of bounces
        let bounces = 0;

        while (bounces < maxBounces) {
            lineLength = 0;
            let collisionDetected = false;

            // Continue to draw the line until we hit a wall
            while (!collisionDetected) {
                lineLength += 0.5;
                let endX = cannonX + Math.cos(globalRotation) * lineLength;
                let endY = cannonY + Math.sin(globalRotation) * lineLength;
                bulletPath.lineTo(endX, endY);

                // Detection of collision with the edges of the stadium
                if (endX <= stadiumBounds.x || endX >= stadiumBounds.x + stadiumBounds.width) {
                    // Rebound on a vertical wall (left or right)
                    globalRotation = Math.PI - globalRotation; // Inversion on the X axis
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else if (endY <= stadiumBounds.y || endY >= stadiumBounds.y + stadiumBounds.height) {
                    // Rebound on a horizontal wall (top or bottom)
                    globalRotation = -globalRotation; // Inversion on the Y axis
                    collisionDetected = true;
                    cannonX = endX;
                    cannonY = endY;
                } else {
                    for (let wall of this._gameManager._walls) {
                        if (wall.isInside(endX, endY)) {
                            if (wall.getDestruct()) {
                                return bulletPath;
                            }
                            // Test the distance to the nearest empty space for each possible rebound
                            let rotations = [Math.PI - globalRotation, -globalRotation];
                            let distances = rotations.map(rotation => this.rayCastNearestEmptySpace(endX, endY, rotation));
                            // Find the minimum distance, and thus the corresponding rotation
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

            // Increment the number of rebounds
            bounces += 1;
        }

        return bulletPath;
    }






    getBulletPathCurveOP() {
        const bodyCenterX = this._body.x;
        const bodyCenterY = this._body.y;
        const cannonLength = 25 * fixSize * scaleFactor;
        const pi = Math.PI;
        let globalRotation = this._body.rotation + this._tankHead.rotation + pi / 2;

        let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
        let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;

        const path = [{ startX: cannonX, startY: cannonY, endX: cannonX, endY: cannonY, rotation: globalRotation }];
        const stadiumBounds = this._gameManager._bodyStadium.getBounds();
        const maxBounces = this._maxBounces;
        const step = 0.5;

        for (let bounces = 0; bounces < maxBounces; bounces++) {
            let collisionDetected = false;
            let endX, endY;
            let destructWallAtDistance = Infinity;
            let destructWallFunction = () => false;

            while (!collisionDetected) {
                const cosRotation = Math.cos(globalRotation);
                const sinRotation = Math.sin(globalRotation);
                endX = cannonX + cosRotation * step;
                endY = cannonY + sinRotation * step;

                if (endX <= stadiumBounds.x || endX >= stadiumBounds.x + stadiumBounds.width) {
                    globalRotation = pi - globalRotation;
                    collisionDetected = true;
                } else if (endY <= stadiumBounds.y || endY >= stadiumBounds.y + stadiumBounds.height) {
                    globalRotation = -globalRotation;
                    collisionDetected = true;
                } else {
                    for (let wall of this._gameManager._walls) {
                        if (wall.isInside(endX, endY) && !wall._destructed) {
                            if (wall.getDestruct()) {
                                destructWallAtDistance = path.length;
                                destructWallFunction = () => {
                                    if (!wall._destructed) {
                                        wall._destructed = true;
                                        this._gameManager.destructWall(wall);
                                        return true;
                                    }
                                    return false;
                                };
                            }
                            const rotations = [pi - globalRotation, -globalRotation];
                            const distances = rotations.map(rotation => this.rayCastNearestEmptySpace(endX, endY, rotation));
                            globalRotation = rotations[distances.indexOf(Math.min(...distances))];
                            collisionDetected = true;
                            break;
                        }
                    }
                }
                cannonX = endX;
                cannonY = endY;
            }

            const lastSegment = path[path.length - 1];
            lastSegment.endX = cannonX;
            lastSegment.endY = cannonY;
            lastSegment.destructWallAtSegment = destructWallAtDistance;
            lastSegment.destructWall = destructWallFunction;

            if (bounces < maxBounces - 1) {
                path.push({ startX: cannonX, startY: cannonY, endX: cannonX, endY: cannonY, rotation: globalRotation });
            }
        }
        return path;
    }







    // Pareil que getBulletPath mais retourne le début et la fin de chaque segment de la trajectoire au lieu d'afficher le chemin. Utilisé pour l'animation
    getBulletPathCurve() {
        const bodyCenterX = this._body.x;
        const bodyCenterY = this._body.y;

        //const cannonOffset = 25 * fixSize * scaleFactor;  // Distance entre le centre du tank et l'extrémité du canon
        const cannonLength = 25 * fixSize * scaleFactor;  // Longueur du canon

        // Calcule la rotation globale avec un ajustement de +PI
        let globalRotation = this._body.rotation + this._tankHead.rotation + Math.PI / 2;

        let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
        let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;

        let path = [{startX: cannonX, startY: cannonY, endX: cannonX, endY: cannonY, rotation: globalRotation}];

        const stadiumBounds = this._gameManager._bodyStadium.getBounds();
        let lineLength = 0;
        let acumulatedLength = 0;
        let maxBounces = this._maxBounces; // Nombre maximum de rebonds
        let bounces = 0;

        while (bounces < maxBounces) {
            lineLength = 0;
            let collisionDetected = false;
            let destructWallAtDistance = Infinity;
            let destructWallFunction = () => {return false;};

            // Continue à tracer la ligne jusqu'à ce qu'on touche un mur
            while (!collisionDetected) {
                lineLength += 0.5;
                acumulatedLength += 0.5;
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
                    for (let wall of this._gameManager._walls) {
                        if (wall.isInside(endX, endY) && !wall._destructed) {

                            if (wall.getDestruct()) {
                                destructWallAtDistance = acumulatedLength;
                                destructWallFunction = () => {
                                    if (!wall._destructed) {
                                        wall._destructed = true;
                                        this._gameManager.destructWall(wall);
                                        return true;
                                    }
                                    return false;
                                };
                            }
                            // if (wall.getDestruct()) {
                            //     path[path.length - 1].endX = endX;
                            //     path[path.length - 1].endY = endY;
                            //     if (bounces < maxBounces) {
                            //         path.push({
                            //             startX: cannonX,
                            //             startY: cannonY,
                            //             endX: cannonX,
                            //             endY: cannonY,
                            //             rotation: globalRotation,
                            //             destructWallAtSegment: true,
                            //             destructWall: () => {
                            //                 if (!wall._destructed) {
                            //                     wall._destructed = true;
                            //                     this._stadiumObject.destructWall(wall);
                            //                     return true;
                            //                 }
                            //                 return false;
                            //             }
                            //         });
                            //     }
                            //     return path;

                            // }


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
            path[path.length - 1].destructWallAtSegment = destructWallAtDistance;
            path[path.length - 1].destructWall = destructWallFunction;
            if (bounces < maxBounces) {
                path.push({
                    startX: cannonX,
                    startY: cannonY,
                    endX: cannonX,
                    endY: cannonY,
                    rotation: globalRotation
                });
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
                //this._tankBody.y -= overlapY / 2;
                //otherTank._tankBody.y += overlapY / 2;
                this.move("y", -overlapY / 2);
                otherTank.move("y", overlapY / 2);
            } else {
                //this._tankBody.y += overlapY / 2;
                //otherTank._tankBody.y -= overlapY / 2;
                this.move("y", overlapY / 2);
                otherTank.move("y", -overlapY / 2);
            }
        } else {
            if (bounds.left < otherBounds.left) {
                //this._tankBody.x -= overlapX / 2;
                //otherTank._tankBody.x += overlapX / 2;
                this.move("x", -overlapX / 2);
                otherTank.move("x", overlapX / 2);
            } else {
                //this._tankBody.x += overlapX / 2;
                //otherTank._tankBody.x -= overlapX / 2;
                this.move("x", overlapX / 2);
                otherTank.move("x", -overlapX / 2);
            }
        }
    }

    displayHead() {

        const headRadius = 18 * fixSize * scaleFactor;
        const headCenter = 25 * fixSize * scaleFactor;
        const rectX = 20 * fixSize * scaleFactor;
        const rectY = 10 * fixSize * scaleFactor;
        const rectWidth = 10 * fixSize * scaleFactor;
        const rectHeight = 50 * fixSize * scaleFactor;
        const innerRectX = 21 * fixSize * scaleFactor;
        const innerRectY = 11 * fixSize * scaleFactor;
        const innerRectWidth = 8 * fixSize * scaleFactor;
        const innerRectHeight = 48 * fixSize * scaleFactor;
        const innerCircleRadius = 16 * fixSize * scaleFactor;

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
        this._tankHead.x = this._body.x + 25 * fixSize * scaleFactor;
        this._tankHead.y = this._body.y + 25 * fixSize * scaleFactor;

        this._body.addChild(this._tankHead);
    }

    displayTracks() {

        const trackWidth = 5 * fixSize * scaleFactor;
        const trackHeight = 55 * fixSize * scaleFactor;
        const trackCornerRadius = 10 * fixSize * scaleFactor;
        const trackOffsetX = 48 * fixSize * scaleFactor; // Horizontal offset
        const trackOffsetY = -2 * fixSize * scaleFactor; // Vertical offset
        const metalPlateWidth = 3 * fixSize * scaleFactor;
        const metalPlateHeight = 7 * fixSize * scaleFactor;

        const metalPlateSpacing = 9 * fixSize * scaleFactor;



        // Right Track
        this._tankTracks.beginFill(0x000000); // Contour
        this._tankTracks.drawRoundedRect(trackOffsetX, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankTracks.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankTracks.beginFill(0xC0c0c0); // Metal plates
            this._tankTracks.drawRect(trackOffsetX + fixSize * scaleFactor, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankTracks.endFill();
        }

        // Left Track
        this._tankTracks.beginFill(0x000000); // Contour
        this._tankTracks.drawRoundedRect(trackOffsetY, trackOffsetY, trackWidth, trackHeight, trackCornerRadius);
        this._tankTracks.endFill();
        for (let i = 0; i < 6; i++) {
            this._tankTracks.beginFill(0xC0c0c0); // Metal plates
            this._tankTracks.drawRect(trackOffsetY+1, i * metalPlateSpacing, metalPlateWidth, metalPlateHeight);
            this._tankTracks.endFill();
        }

        this._body.addChild(this._tankTracks);

    }

    isMoving() {
        return this._previousX !== this._body.x || this._previousY !== this._body.y;
    }

    leaveTrackMark() {
        const trackMark = new PIXI.Graphics();
        const trackWidth = 5 * fixSize * scaleFactor;
        const trackHeight = 7 * fixSize * scaleFactor; // Height of each metal plate
        const trackCornerRadius = 2 * fixSize * scaleFactor; // Smaller corner radius for metal plates
        const trackOffsetX = (48 - 2) / 2 * fixSize * scaleFactor; // Horizontal offset
        const trackOffsetY = (-2 * 13) - 3 * fixSize * scaleFactor; // Vertical offset
        const metalPlateSpacing = 9 * fixSize * scaleFactor; // Spacing between metal plates

        const cosRotation = Math.cos(this._body.rotation)
        const sinRotation = Math.sin(this._body.rotation);

        const rightTrackX = this._body.x + trackOffsetX * cosRotation - trackOffsetY * sinRotation;
        const rightTrackY = this._body.y + trackOffsetX * sinRotation + trackOffsetY * cosRotation;

        const leftTrackX = this._body.x - trackOffsetX * cosRotation - trackOffsetY * sinRotation;
        const leftTrackY = this._body.y - trackOffsetX * sinRotation + trackOffsetY * cosRotation;

        // Right Track Mark
            trackMark.beginFill(0x000000, 0.5); // Semi-transparent metal color
            trackMark.drawRoundedRect(0, metalPlateSpacing, trackWidth, trackHeight, trackCornerRadius);
            trackMark.endFill();
        trackMark.position.set(rightTrackX, rightTrackY);
        trackMark.rotation = this._body.rotation;

        // Left Track Mark
        const leftTrackMark = new PIXI.Graphics();
            leftTrackMark.beginFill(0x000000, 0.5); // Semi-transparent metal color
            leftTrackMark.drawRoundedRect(0, metalPlateSpacing, trackWidth, trackHeight, trackCornerRadius);
            leftTrackMark.endFill();
        leftTrackMark.position.set(leftTrackX, leftTrackY);
        leftTrackMark.rotation = this._body.rotation;

        this._trackMarks.addChild(trackMark);
        this._trackMarks.addChild(leftTrackMark);

        setTimeout(() => {
            this._trackMarks.removeChild(trackMark);
            this._trackMarks.removeChild(leftTrackMark);
        }, 1000*30); // Remove after 1 second
    }



    displayBody() {
        // Body dimensions
        const bodyWidth = 50 * fixSize * scaleFactor;
        const bodyHeight = 50 * fixSize * scaleFactor;
        const bodyX = 0;  // X body position (centered or adjusted if necessary)
        const bodyY = 0;  // Y body position (centered or adjusted if necessary)

        // Body draw
        this._body.beginFill(this._color);
        this._body.drawRect(bodyX, bodyY, bodyWidth, bodyHeight);
        this._body.endFill();

        // Pivot point for the body to rotate
        this._body.pivot.set(this._body.width / 2, this._body.height / 2);
    }

    updatePositionPlayer(stadium, speed) {
        if (this._player) {
            if (this._keys[this._controls.up] && !this._shortCooldown) {
                //this._tankBody.y -= speed;
                this.move("y", -speed);
            }
            if (this._keys[this._controls.left] && !this._shortCooldown) {
                //this._tankBody.x -= speed;
                this.move("x", -speed);
            }
            if (this._keys[this._controls.down] && !this._shortCooldown) {
                //this._tankBody.y += speed;
                this.move("y", speed);
            }
            if (this._keys[this._controls.right] && !this._shortCooldown) {
                //this._tankBody.x += speed;
                this.move("x", speed);
            }

            if (this._keys[this._controls.shoot]) {
                if (!this._shortCooldown && this._bulletsCooldown < this._maxBullets) {
                    let bullet = new Bullet(this._app, this._gameManager);

                    bullet.display();
                    bullet.shoot(this);

                    // Cooldown entre chaque tir et +1 balle tirée actuellement
                    this._shortCooldown = true;
                    this._bulletsCooldown++;
                    setTimeout(() => {
                        this._shortCooldown = false;
                    }, 350);


                }
            }
        }
    }

    updatePositionIA(stadium, action, speed) {
        switch (action) {
            case Action.Up:
                //this._tankBody.y -= speed;
                this.move("y", -speed);
                break;
            case Action.Left:
                //this._tankBody.x -= speed;
                this.move("x", -speed);
                break;
            case Action.Down:
                //this._tankBody.y += speed;
                this.move("y", speed);
                break;
            case Action.Right:
                //this._tankBody.x += speed;
                this.move("x", speed);
                break;
            case Action.UpLeft:
                //this._tankBody.y -= speed;
                //this._tankBody.x -= speed;
                this.move("y", -speed);
                this.move("x", -speed);
                break;
            case Action.UpRight:
                //this._tankBody.y -= speed;
                //this._tankBody.x += speed;
                this.move("y", -speed);
                this.move("x", speed);
                break;
            case Action.DownLeft:
                //this._tankBody.y += speed;
                //this._tankBody.x -= speed;
                this.move("y", speed);
                this.move("x", -speed);
                break;
            case Action.DownRight:
                //this._tankBody.y += speed;
                //this._tankBody.x += speed;
                this.move("y", speed);
                this.move("x", speed);
                break;
            case Action.Shoot:
                if (!this._shortCooldown && this._bulletsCooldown < this._maxBullets) {
                    let bullet = new Bullet(this._app, this._gameManager);
                    bullet.display();
                    bullet.shoot(this);


                    const bodyCenterX = this._body.x;
                    const bodyCenterY = this._body.y;

                    const cannonLength = 25 * scaleFactor;  // Longueur du canon

                    let globalRotation = this._body.rotation + this._tankHead.rotation + Math.PI / 2;

                    let cannonX = bodyCenterX + Math.cos(globalRotation) * cannonLength;
                    let cannonY = bodyCenterY + Math.sin(globalRotation) * cannonLength;
                    //particule for shooting
                    if (this._app.stage) {
                        this.createParticle(cannonX, cannonY, 1);

                    }

                    // Cooldown entre chaque tir
                    this._shortCooldown = true;
                    this._bulletsCooldown++;
                    setTimeout(() => {
                        this._shortCooldown = false;
                    }, 200);
                }
                break;
            default:
                break;
        }
    }

    updatePosition(stadium, action = null) {
        this._previousX = this._body.x;
        this._previousY = this._body.y;
        let speed = this._targetRotation === this._body.rotation ? this._speed : this._speedWhileRotating;

        const hasMoved = this._previousX !== this._body.x || this._previousY !== this._body.y;
        const hasRotated = this._previousRotation !== (this._tankHead.rotation + this._body.rotation);

        if (this._player) {
            this.updatePositionPlayer(stadium, speed);
        } else {
            this.updatePositionIA(stadium, action, speed);
        }

        if (this.isMoving()) {
            this._trackMarkCounter++;
            if (this._trackMarkCounter >= this._trackMarkThreshold) {
                this.leaveTrackMark2();
                this._trackMarkCounter = 0;
            }
        }

        let tankBounds = this._body.getBounds();
        let stadiumBounds = stadium._bodyStadium.getBounds();

        if (!stadium.isTankInside(this)) { // Check if the tank is outside the stadium

            if (tankBounds.x < stadiumBounds.x) {
                this._body.x += this._speed;
                this._aabb.move("x", this._speed);
            }
            if (tankBounds.x + tankBounds.width > stadiumBounds.x + stadiumBounds.width) {
                this._body.x -= this._speed;
                this._aabb.move("x", -this._speed);
            }
            if (tankBounds.y < stadiumBounds.y) {
                this._body.y += this._speed;
                this._aabb.move("y", this._speed);
            }
            if (tankBounds.y + tankBounds.height > stadiumBounds.y + stadiumBounds.height) {
                this._body.y -= this._speed;
                this._aabb.move("y", -this._speed);
            }
        }

        //if the tank posititons has changed, we update the bullet path to avoid too much computation
        if ((hasMoved || hasRotated) && stadium.isTankInside(this) && (this._keys[this._controls.up] || this._keys[this._controls.down] || this._keys[this._controls.left] || this._keys[this._controls.right])) {
            // temporary fix to avoid multiple bullet path at the beginning, true fix is using spawn position to not move the tank at the beginning
            //    console.log("the tanks has moved and we update the bullet path");
            // this.performAction('getBulletPath');   uncomment to see the bullet path line
            this._previousX = this._body.x;
            this._previousY = this._body.y;
            this._previousRotation = this._tankHead.rotation + this._body.rotation;
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
        let delta = this._targetRotation - this._body.rotation;
        // Keep the delta between -PI and PI
        while (delta > Math.PI) {
            delta -= Math.PI * 2;
        }
        while (delta < -Math.PI) {
            delta += Math.PI * 2;
        }
        // Rotate the body
        if (Math.abs(delta) < this._rotationSpeed) {
            this._body.rotation = this._targetRotation;
        } else {
            this._body.rotation += this._rotationSpeed * Math.sign(delta);
        }
    }

    updateCannonPosition(mouseX, mouseY) {
        this._tankHead.rotation = Math.atan2(mouseY - this._body.y, mouseX - this._body.x) - Math.PI / 2 - this._body.rotation;
    }

    isInside(x, y) {
        const bounds = this._body.getBounds();
        return (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        );
    }

    //function thar return if the endSegment is touching the tank
    isTouchingTank(tank, x, y) {

        const bounds = tank.getBoundsForCollision();

        return (
            x >= bounds.left &&
            x <= bounds.right &&
            y >= bounds.top &&
            y <= bounds.bottom

        );
    }

    isSegmentTouchingTank(tank, startX, startY, endX, endY) {
        const bounds = tank.getBoundsForCollision();

        // Check if either end of the segment is inside the tank
        if (this.isTouchingTank(tank, startX, startY) || this.isTouchingTank(tank, endX, endY)) {
            return true;
        }

        // Check if the segment intersects any of the tank's edges
        const edges = [
            {x1: bounds.left, y1: bounds.top, x2: bounds.right, y2: bounds.top},
            {x1: bounds.right, y1: bounds.top, x2: bounds.right, y2: bounds.bottom},
            {x1: bounds.right, y1: bounds.bottom, x2: bounds.left, y2: bounds.bottom},
            {x1: bounds.left, y1: bounds.bottom, x2: bounds.left, y2: bounds.top}
        ];

        for (let edge of edges) {
            if (this.doSegmentsIntersect(startX, startY, endX, endY, edge.x1, edge.y1, edge.x2, edge.y2)) {
                return true;
            }
        }

        return false;
    }

// Helper function to check if two segments intersect
    doSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        function ccw(ax, ay, bx, by, cx, cy) {
            return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
        }

        return (ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4)) &&
            (ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4));
    }


    isSegmentTouchingWall(wall, startX, startY, endX, endY) {

        // Check if either end of the segment is inside the wall
        if (wall.isInside(startX, startY) || wall.isInside(endX, endY)) {
            return true;
        }

        // Check if the segment intersects any of the wall's edges
        const edges = wall.getEdges();

        for (let edge of edges) {
            if (this.doSegmentsIntersect(startX, startY, endX, endY, edge.x1, edge.y1, edge.x2, edge.y2)) {
                return true;
            }
        }

        return false;
    }



    leaveTrackMark2() {
        const trackMark = new PIXI.Graphics();
        const trackWidth = 5 * fixSize * scaleFactor;
        const trackHeight = 7 * fixSize * scaleFactor; // Height of each metal plate
        const trackCornerRadius = 2 * fixSize * scaleFactor; // Smaller corner radius for metal plates
        const trackOffsetX = (48 - 2) / 2 * fixSize * scaleFactor; // Horizontal offset
        const trackOffsetY = (-2 * 13) - 3 * fixSize * scaleFactor; // Vertical offset
        const metalPlateSpacing = 9 * fixSize * scaleFactor; // Spacing between metal plates
        const cosRotation = Math.cos(this._body.rotation);
        const sinRotation = Math.sin(this._body.rotation);
        const rightTrackX = this._body.x + trackOffsetX * cosRotation - trackOffsetY * sinRotation;
        const rightTrackY = this._body.y + trackOffsetX * sinRotation + trackOffsetY * cosRotation;
        const leftTrackX = this._body.x - trackOffsetX * cosRotation - trackOffsetY * sinRotation;
        const leftTrackY = this._body.y - trackOffsetX * sinRotation + trackOffsetY * cosRotation; // Right Track Mark

        trackMark.beginFill(0x000000, 0.5); // Semi-transparent metal color
        trackMark.drawRoundedRect(0, metalPlateSpacing, trackWidth, trackHeight, trackCornerRadius);
        trackMark.endFill();
        trackMark.position.set(rightTrackX, rightTrackY);
        trackMark.rotation = this._body.rotation; // Left Track Mark
        const leftTrackMark = new PIXI.Graphics();
        leftTrackMark.beginFill(0x000000, 0.5); // Semi-transparent metal color
        leftTrackMark.drawRoundedRect(0, metalPlateSpacing, trackWidth, trackHeight, trackCornerRadius);
        leftTrackMark.endFill();
        leftTrackMark.position.set(leftTrackX, leftTrackY);
        leftTrackMark.rotation = this._body.rotation;
        this._trackMarksContainer.addChild(trackMark);
        this._trackMarksContainer.addChild(leftTrackMark);
        setTimeout(() => {
            this._trackMarksContainer.removeChild(trackMark);
            this._trackMarksContainer.removeChild(leftTrackMark);
            }, 1000 * 30); // Remove after 30 seconds
        }

    setTrackMarksContainer(container) {
        this._trackMarksContainer = container;
    }
}

