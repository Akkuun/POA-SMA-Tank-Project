import * as PIXI from 'pixi.js';
import {useState} from "react";


export class Stadium {
    _width;
    _height;
    _bodyStadium;
    _walls = [];
    _tankSpawnPositions = [];


    constructor(width, height, setTankSpawnPositions) {

        this._width = width;
        this._height = height;

        this._bodyStadium = new PIXI.Graphics();
        this._bodyStadium.beginFill(0xc0a36a);
        this._bodyStadium.lineStyle(2, 0x30271a);
        this._bodyStadium.drawRect(0, 0, this._width, this._height);
        this._bodyStadium.endFill();

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyStadium.position.set(centerX, centerY);
        this.setTankSpawnPositions = setTankSpawnPositions;
    }


    addWall(x, y, width, height) {
        const wall = new Wall(width, height);
        wall._bodyWall.position.set(x, y);
        this._bodyStadium.addChild(wall._bodyWall);
        this._walls.push(wall);
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

    isPointInside(x, y) {
        const bounds = this._bodyStadium.getBounds();
        return (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        );
    }

    display(app) {
        app.stage.addChild(this._bodyStadium);
    }



    generateStadiumFromFile(file) {
        fetch(file)
            .then(response => response.text())
            .then(text => {


                    let map = text.split('\n').map(line => line.slice(0, -1).split(''));

                    let rows = map.length;
                    let cols = map[0].length;

                    for (let i = 0; i < rows; i++) {
                        for (let j = 0; j < cols; j++) {

                           // console.log(map[i][j]);

                            // in text file, 1 is a wall, 0 is an empty space, TX is a tank's spawn position for the X's tank
                            if (map[i][j] === 'T') {
                                let TankNumber = map[i][j + 1];
                                this._tankSpawnPositions[TankNumber] = {x: j * this._width / cols, y: i * this._height / rows};
                                console.log("pour tank " + TankNumber + " : " + this._tankSpawnPositions[TankNumber].x + " " + this._tankSpawnPositions[TankNumber].y);
                                //update the top level state
                               // console.log(this._tankSpawnPositions[TankNumber]);
                                this.setTankSpawnPositions([...this._tankSpawnPositions]);

                            }


                            if (map[i][j] === '1') { // Wall Case
                                this.addWall(j * this._width / cols, i * this._height / rows, this._width / cols, this._height / rows);
                            }
                        }
                    }
                }
            )
        ;
    }

    get StadiumBounds_x() {
        return this._bodyStadium.getBounds().x;
    }

    get StadiumBounds_y() {
        return this._bodyStadium.getBounds().y;
    }

    isPointInsideAWall(x, y) {
        for (let wall of this._walls) {
            if (wall.isInside(x, y)) {
                return true;
            }
        }
        return false;
    }
}


export class Wall {
    _width;
    _height;
    _bodyWall;

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._bodyWall = new PIXI.Graphics();

        this._bodyWall.beginFill(0x463928);
        this._bodyWall.lineStyle(2, 0x30271a);
        this._bodyWall.drawRect(0, 0, this._width, this._height);
        this._bodyWall.endFill();

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyWall.position.set(centerX, centerY);
    }

    display(app) {
        app.stage.addChild(this._bodyWall);
    }

    testForAABB(tank) {
        const bounds = tank._tankBody.getBounds();
        const wallBounds = this._bodyWall.getBounds();
        return (
            bounds.x < wallBounds.x + wallBounds.width &&
            bounds.x + bounds.width > wallBounds.x &&
            bounds.y < wallBounds.y + wallBounds.height &&
            bounds.y + bounds.height > wallBounds.y
        );
    }

    resolveCollision(tank) {
        const bounds = tank._tankBody.getBounds();
        const wallBounds = this._bodyWall.getBounds();

        let dx = 0;
        let dy = 0;

        if (bounds.x < wallBounds.x) {
            dx = wallBounds.x - (bounds.x + bounds.width);
        } else if (bounds.x + bounds.width > wallBounds.x + wallBounds.width) {
            dx = wallBounds.x + wallBounds.width - bounds.x;
        }

        if (bounds.y < wallBounds.y) {
            dy = wallBounds.y - (bounds.y + bounds.height);
        } else if (bounds.y + bounds.height > wallBounds.y + wallBounds.height) {
            dy = wallBounds.y + wallBounds.height - bounds.y;
        }

        if (Math.abs(dx) < Math.abs(dy)) {
            tank._tankBody.x += dx;
        } else {
            tank._tankBody.y += dy;
        }
    }

    isInside(x, y) {
        const bounds = this._bodyWall.getBounds();
        return (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        );
    }
}
