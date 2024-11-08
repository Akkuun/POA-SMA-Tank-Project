import { AABB } from "./AABB";

export class Agent {
    _pos;
    _aabb;
    _app;
    _gameManager;
    _actions;

    constructor(x, y, width, height, app, gameManager, actions) {
        this._pos = {x: x, y: y};
        this._app = app;
        this._aabb = new AABB({x: x, y: y}, {x: x+width, y: y+height}, app, false);
        this._gameManager = gameManager;
        this._actions = actions;
    }

    display() {
        throw new Error("Method 'display()' must be implemented.");
    }

    performAction(action) {
        throw new Error("Method 'performAction()' must be implemented.");
    }

    choseAction() {
        throw new Error("Method 'choseAction()' must be implemented.");
    }
}