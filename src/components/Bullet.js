import * as PIXI from 'pixi.js';

export class Bullet {
    _bodyBullet;
    _rotationSpeed;
    _speed;
    _app;
    _path;
    _distance = 0;
    _tank;
    _stadium;

    constructor(app, stadium) {
        this._app = app;
        this._stadium = stadium;
        
        this._bodyBullet = new PIXI.Graphics();
        this._rotationSpeed = 0.05;
        this._speed = 3;

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

        this._stadium.addBullet(this);
    }

    display(){
        this._app.stage.addChild(this._bodyBullet);
    }

    /*
    update() {
        this._bodyBullet.rotation += this._rotationSpeed;
    }
    */

    setDirection(rotation) {
        this._bodyBullet.rotation = rotation;
    }

    setPosition(x, y) {
        this._bodyBullet.x = x;
        this._bodyBullet.y = y;
    }

    getPosition(){
        return {x: this._bodyBullet.x
            , y: this._bodyBullet.y
        };
    }

    getBounds(){
        return this._bodyBullet.getBounds();
    }

    remove(){
        this._app.ticker.remove(this.update);
        this._app.stage.removeChild(this._bodyBullet);
        if (this._tank !== null) {
            this._stadium._bullets.splice(this._stadium._bullets.indexOf(this), 1);
            this._tank._bulletsCooldown--; // La balle a été tirée et n'est plus en jeu, le tank pourra en tirer une autre
            this._tank = null;
        }
    }

    getLineXYatDistanceFromStart( distance) {
        // Stocker la longueur de chaque segment de la trajectoire
        let line = [];
        for (let i =0; i < this._path.length; i++){
            line.push(Math.sqrt((
                Math.pow(this._path[i].endX - this._path[i].startX, 2) + Math.pow(this._path[i].endY - this._path[i].startY, 2)
            )));
        } 

        // Trouver l'index du segment de la trajectoire où se trouve la distance
        let distanceTraveled = 0;
        let index = 0;
        let i = 0;
        for (; i < line.length; i++) {
            distanceTraveled += line[i];
            if (distanceTraveled > distance) {
                index = i;
                break;
            }
        }
        if (i === line.length) {
            return null; // Chemin terminé
        }

        // Trouver les coordonnées x et y à la distance donnée en fonction de l'index du segment de la trajectoire
        let X = this._path[index].startX;
        let Y = this._path[index].startY;
        let remainingDistance = distance;
        for (let i = 0; i < index; i++) {
            remainingDistance -= line[i];
        }
        X += (remainingDistance / line[index]) * (this._path[index].endX - this._path[index].startX);
        Y += (remainingDistance / line[index]) * (this._path[index].endY - this._path[index].startY);

        return ({x: X, y: Y, rotation: this._path[index].rotation});
    }


    shoot(Tank){
        const cannonLength = 50;
        const offsetX = 0;
        const offsetY = 0;
        const cannonTipX = Tank._tankBody.x + offsetX + cannonLength * Math.sin(-Tank._tankHead.rotation-Tank._tankBody.rotation);
        const cannonTipY = Tank._tankBody.y + offsetY + cannonLength * Math.cos(Tank._tankHead.rotation + Tank._tankBody.rotation);
        this.setPosition(cannonTipX, cannonTipY);
        this.setDirection(Tank._tankHead.rotation+Tank._tankBody.rotation);

        this._path = Tank.getBulletPathCurve();
        this._tank = Tank;
        this.animate(); 
    }

    update() {
        if (this._tank === null) return;
        let nextPosition = this.getLineXYatDistanceFromStart(this._distance);
        if (nextPosition === null) { // La balle a atteint la fin de la trajectoire
            this.remove();
            return;
        }
        this.setPosition(nextPosition.x, nextPosition.y);
        this.setDirection(nextPosition.rotation - Math.PI / 2);
        this._distance += this._speed;
    }

    willIntersect(tank) {
        // Renvoie la direction par laquelle la balle va toucher le tank si elle va le toucher, ainsi que la distance, false sinon
        let d = this._distance;
        let current = this.getLineXYatDistanceFromStart(d);
        while (current != null) {
            if (tank.isInside(current.x, current.y)) return {"rotation": current.rotation, "distance" : d-this._distance}; 
            d+=5;
            current = this.getLineXYatDistanceFromStart(d);
        }
        return false;
    }

    animate() {
        this._app.ticker.add(() => {
            this.update();
        });
    }
}

