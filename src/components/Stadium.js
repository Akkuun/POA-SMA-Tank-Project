import * as PIXI from 'pixi.js';

export class Stadium {
    _width;
    _height;
    _tiles_x;
    _tiles_y;
    _bodyStadium;
    _walls = [];

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._bodyStadium = new PIXI.Graphics();
        this._bodyStadium.beginFill(0xc0a36a);
        this._bodyStadium.drawRect(0, 0, this._width, this._height);
        this._bodyStadium.endFill();

        // Calculer le nombre de tiles, en fonction du ratio de l'écran pour les garder carrées
        let ratio = this._width / this._height;
        this._tiles_x = Math.floor(Math.sqrt(ratio) * 14);
        this._tiles_y = Math.floor(14 / Math.sqrt(ratio));

        // Calculer la position centrale
        const centerX = (window.innerWidth - this._width) / 2;
        const centerY = (window.innerHeight - this._height) / 2;
        this._bodyStadium.position.set(centerX, centerY);
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

    display(app) {
        app.stage.addChild(this._bodyStadium);
    }

    generateStadiumFromFile(file) {
        fetch(file)
            .then(response => response.text())
            .then(text => {
                let lines = text.split('\n');
                let nbLigne = lines.length-1; // Ignorer la dernière ligne vide
                for (let i = 0; i < nbLigne; i++) {
                    let line = lines[i];
                    let nbCol = line.length-1; // Ignorer le retour à la ligne à la fin de chaque ligne
                    for (let j = 0; j < nbCol; j++) {
                        if (line[j] === '1') {
                            this.addWall(j * this._width / nbCol, i * this._height / nbLigne, this._width / nbCol, this._height / nbLigne);
                        }
                    }
                }
            }
        );
    }
    get StadiumBounds_x() {
        return this._bodyStadium.getBounds().x;
    }
    get StadiumBounds_y() {
        return this._bodyStadium.getBounds().y;
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
}