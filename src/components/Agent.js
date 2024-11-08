import { AABB } from "./AABB";

export class Agent {
    _body;
    _aabb;
    _app;
    _gameManager;
    _actions;

    constructor(x, y, width, height, app, gameManager, actions) {
        this._body = null;
        this._app = app;
        this._aabb = new AABB({x: x, y: y}, {x: x+width, y: y+height}, app, true);
        this._gameManager = gameManager;
        this._actions = actions;
    }

    display() {
        throw new Error("Method 'display()' must be implemented.");
    }

    performAgentAction(action) {
        throw new Error("Method 'performAction()' must be implemented.");
    }

    choseAgentAction() {
        throw new Error("Method 'choseAction()' must be implemented.");
    }
}