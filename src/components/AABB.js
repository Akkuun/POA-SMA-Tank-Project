import * as PIXI from "@pixi/graphics";
import { ScaleFactor } from "./ScaleFactor";

// https://noonat.github.io/intersect/



export class Intersection {
    _delta;
    _normal;
    _pos;
    _t;
    _axis;

    constructor() {
        this._delta = {x: 0, y: 0};
        this._normal = {x: 0, y: 0};
        this._pos = {x: 0, y: 0};
        this._axis = '';
        this._t=-1;
    }
}

export class AABB {
    _pos;
    _half;
    _app;
    _bodyAABB;

    constructor(p0, p1, app) {
        this._pos = p0;
        this._half = {x: 0, y: 0};
        this._half.x = p1.x - p0.x;
        this._half.y = p1.y - p0.y;
        if (app) {
            this._app = app;
            this.displayAABB();
        }
    }

    displayAABB() {
        this._bodyAABB = new PIXI.Graphics();
        this._bodyAABB.lineStyle(2, 0xff0000);
        this._bodyAABB.drawRect(this._pos.x, this._pos.y, this._half.x*2, this._half.y*2);
        if (this._app && this._app.stage) this._app.stage.addChild(this._bodyAABB);
    }

    intersectsAABB(other) {
        let dx = other._pos.x - this._pos.x;
        let px = (other._half.x + this._half.x) - Math.abs(dx);
        if (px <= 0) return false;

        let dy = other._pos.y - this._pos.y;
        let py = (other._half.y + this._half.y) - Math.abs(dy);
        if (py <= 0) return false;

        console.log("px", px, "py", py, "dx", dx, "dy", dy, "px <= 0", px <= 0, "py <= 0", py <= 0);    

        const intersection = new Intersection();
        if (px < py) {
            let sx = Math.sign(dx);
            intersection._delta.x = px * sx;
            intersection._axis = 'x';
            intersection._normal.x = 1;
            intersection._pos.x = this._pos.x + this._half.x * sx;
            intersection._pos.y = other._pos.y;
        } else {
            let sy = Math.sign(dy);
            intersection._delta.y = py * sy;
            intersection._axis = 'y';
            intersection._normal.y = 1;
            intersection._pos.x = other._pos.x;
            intersection._pos.y = this._pos.y + this._half.y* sy;
        }
        return intersection;
    }

    move(axis, value) {
        this._pos[axis] += value;
        this._bodyAABB.position[axis] += value;
    }

    toString() {
        return `AABB(${this._pos.x}, ${this._pos.y}, ${this._half.x}, ${this._half.y})`;
    }
}