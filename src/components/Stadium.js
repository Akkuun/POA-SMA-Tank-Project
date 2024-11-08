import * as PIXI from 'pixi.js';
import {useState} from "react";
import { ScaleFactor } from './ScaleFactor';
import { AABB, Intersection } from './AABB';

const scaleFactor = ScaleFactor;

export class Stadium {
    _width;
    _height;
    _bodyStadium;
    _walls = [];
    _destructiveWalls = [];
    _bullets = [];
    _tanks = [];
    _tankSpawnPositions = [];

    _app;

    constructor(width, height, app) {
        this._width = width;
        this._height = height;
        this._app = app;

        this._bodyStadium = new PIXI.Graphics();
        this._bodyStadium.beginFill(0xc0a36a);
        this._bodyStadium.lineStyle(2, 0x30271a);
        this._bodyStadium.drawRect(0, 0, this._width, this._height);
        this._bodyStadium.endFill();

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyStadium.position.set(centerX, centerY);
    }

    addBullet(bullet) {
        this._bullets.push(bullet);
    }

    addTank(tank) {
        this._tanks.push(tank);
    }

    addWall(x, y, width, height, canDestruct) {
        const wall = new Wall(x,y,width, height, canDestruct, {x: this._bodyStadium.x, y: this._bodyStadium.y}, this._app);
        //wall.initAABB({x: this._bodyStadium.x, y: this._bodyStadium.y}, this._app);
        this._bodyStadium.addChild(wall._bodyWall);
        if(canDestruct) this._destructiveWalls.push(wall);
        this._walls.push(wall);
    }

    getWall(){
        return this._walls;
    }

    destructWall(wallg) {
        // Supprimer le mur de la liste des murs
        const wallIndex = this._walls.indexOf(wallg);
        //si le mur est destructible, on le supprime de la liste des murs destructibles
        // if(wallg._destruct){
        //     //retirer le mur de la liste des murs destructibles ._destructiveWalls
        //     // recuperation de l'index du mur dans la liste des murs destructibles
        //     // destruction du mur avec l'index recuperé
        //     const wallDestructIndex = this._destructiveWalls.indexOf(wallg);
        //     if (wallDestructIndex > -1) {
        //         this._destructiveWalls.splice(wallDestructIndex, 1);
        //     }
        // }

        //destuction du mur dans la liste des murs

        if (wallIndex > -1) {
            this._walls.splice(wallIndex, 1);
        }
        if (wallg._bodyAABB) {
            // Retirer l'affichage de sa AABB
            this._app.stage.removeChild(wallg._bodyAABB);
    
            // Détruire l'objet graphique de l'AABB du mur pour libérer les ressources
            wallg._bodyAABB.destroy({ children: true, texture: true, baseTexture: true });
        }

        // Retirer le mur de la scène PIXI
        this._app.stage.removeChild(wallg._bodyWall);

        // Détruire l'objet graphique du mur pour libérer les ressources
        wallg._bodyWall.destroy({ children: true, texture: true, baseTexture: true });
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
        const bounds = tank._body.getBounds();
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
                        if (map[i][j] === '1') {
                            this.addWall(j * this._width / cols, i * this._height / rows, this._width / cols, this._height / rows, false, this._app);
                        }else if(map[i][j] === '2'){
                            this.addWall(j * this._width / cols, i * this._height / rows, this._width / cols, this._height / rows, true, this._app);
                        }
                    }
                }
            });
    }

    get StadiumBounds_x() {
        return this._bodyStadium.getBounds().x;
    }
    get StadiumBounds_y() {
        return this._bodyStadium.getBounds().y;
    }

    get bullets(){
        return this._bullets;
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


export class Wall extends AABB{
    _width;
    _height;
    _bodyWall;
    _destruct;
    _destructed;

    constructor(x,y, width, height, canDestruct, aabboffset, app) {
        super({x: x, y: y}, {x: x+width/2, y: y+height/2}, app);
        super.move('x', aabboffset?.x || 0);
        super.move('y', aabboffset?.y || 0);
        this._width = width;
        this._height = height;
        this._destruct = canDestruct;
        this._destructed = false;
        this._bodyWall = new PIXI.Graphics();


        if(canDestruct){
            this._bodyWall.beginFill(0xff8000);
        }else{
            this._bodyWall.beginFill(0x463928);
        }
        this._bodyWall.lineStyle(2, 0x30271a);
        this._bodyWall.drawRect(0, 0, this._width, this._height);
        this._bodyWall.endFill();

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyWall.position.set(x, y);
    }

    testForAABB(tank) {
        return this.intersectsAABB(tank._aabb);
    }

    resolveCollision(tank, intersection) {
        tank.move(intersection._axis, intersection._delta[intersection._axis] * intersection._normal[intersection._axis]);
    }

    getBodyWall(){
        return this._bodyWall;
    }

    getDestruct(){
        return this._destruct;
    }

    isInside (x, y) {
        const bounds = this._bodyWall.getBounds();
        return (
            x >= bounds.x &&
            x <= bounds.x + bounds.width &&
            y >= bounds.y &&
            y <= bounds.y + bounds.height
        );
    }

    //return x1, y1, x2, y2
    getEdges(){

        return [this._bodyWall.getBounds().x, this._bodyWall.getBounds().y, this._bodyWall.getBounds().x + this._width, this._bodyWall.getBounds().y + this._height];

    }


}
