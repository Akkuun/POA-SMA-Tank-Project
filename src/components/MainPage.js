import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Tank} from './Tank';
import {Stadium} from './Stadium';
import {Action} from './Tank';

const MainPage = ({settings}) => {
    const pixiContainerRef = useRef(null);
    const [tankSpawnPositions, setTankSpawnPositions] = useState([]);
    const WindowWidth = window.innerWidth;
    const WindowHeight = window.innerHeight;
    const tanksColor = [0x00FF00, 0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]; // tank's color available

    // Accès direct aux propriétés de settings
    console.log("settings MAIN", settings[0], settings[1]); // settings[0] pour tankNumber et settings[1] pour isPlayerPlaying

    // Fonction pour obtenir les positions de spawn
    function getSpawnPositions() {
        let filePath = 'maps/testSpawn.txt';
        let positions = [];
        fetch(filePath).then(response => response.text())
            .then(text => {
                let map = text.split('\n').map(line => line.slice(0, -1).split(''));
                let rows = map.length;
                let cols = map[0].length;

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (map[i][j].charCodeAt(0) >= 'A'.charCodeAt(0) && map[i][j].charCodeAt(0) <= 'Z'.charCodeAt(0)) {


                            let tankNumber = map[i][j].charCodeAt(0) - 'A'.charCodeAt(0) + 1;

                                positions[tankNumber] = {x: j * WindowWidth / cols, y: i * WindowHeight / rows};
                         //   positions[tankNumber] = {x: j * WindowWidth / cols, y: i * WindowHeight / rows};
                        }
                    }
                }
                setTankSpawnPositions(positions);
            });
    }

    useEffect(() => {
        getSpawnPositions();
    }, []);

    useEffect(() => {
        if (tankSpawnPositions.length === 0) return; // wait for tankSpawnPositions to be set

        const app = new PIXI.Application({width: WindowWidth, height: WindowHeight, backgroundColor: 0x463928});
        app.stage.interactive = true;
app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
        pixiContainerRef.current.appendChild(app.view);

        const stadiumHeight = WindowHeight * 0.8;
        const stadiumWidth = WindowWidth * 0.8;
        const stadium = new Stadium(stadiumWidth, stadiumHeight,app);
        app.stage.addChild(stadium._bodyStadium);

        stadium.generateStadiumFromFile('maps/testSpawn.txt'); // Stadium Wall generation from file

        // Mouse positions
        let mouseX = 0;
        let mouseY = 0;
        app.stage.on('mousemove', (event) => {
            mouseX = event.data.global.x;
            mouseY = event.data.global.y;
           // console.log(mouseX,mouseY);
        });


        //tanks generation
        for (let i = 0; i < settings[0]+1; i++) {
            let tankSpawnPosition = tankSpawnPositions[i];
            // Tank object creation
            if (tankSpawnPosition) {
                const tank = new Tank(tanksColor[i],
                    {up: "z", left: "q", down: "s", right: "d", shoot: " "},
                    stadiumWidth, stadiumHeight, stadium, app,
                    tankSpawnPosition.x, tankSpawnPosition.y,
                    5 ,false
                );
                stadium.addTank(tank);
                app.stage.addChild(tank._tankBody); // tanks added to the stage
            }
        }

        // Mise à jour des tanks
        /*app.ticker.add(() => {
            for (let tank of stadium._tanks) {
                if (tank._destroyed) continue;
                if(tank._player) {
                    tank.updateRotations(mouseX, mouseY);
                    tank.updatePosition(stadium);
                } else {
                    tank.performActionIA(Action.Shoot, 500, 500);
                }

                for (let otherTank of stadium._tanks) {
                    if (tank !== otherTank && tank.checkCollision(otherTank)) {
                        tank.resolveCollision(otherTank);
                    }

                }
                for (let wall of stadium._walls) {
                    if (wall.testForAABB(tank)) {
                        wall.resolveCollision(tank);
                    }
                }
                for (let bullet of stadium._bullets) {
                    if (bullet._distance > tank._tankBody.width && tank.isInside(bullet._bodyBullet.x, bullet._bodyBullet.y)) {
                        tank.remove();
                        tank._destroyed = true;
                        tank._tankBody.x = -1000000;
                        tank._tankBody.y = -1000000;
                        app.stage.removeChild(tank);
                        continue;
                    }
                }
            }
        });*/
        app.ticker.add(() => {
            for (let tank of stadium._tanks) {
                if (tank._destroyed) continue;

                if (tank._player) {
                    tank.updateRotations(mouseX, mouseY);
                    tank.updatePosition(stadium);
                } else {
                    tank.performActionIA(Action.Shoot, 500, 500);
                }

                // Mettre à jour les particules
                tank.updateParticles();

                for (let otherTank of stadium._tanks) {
                    if (tank !== otherTank && tank.checkCollision(otherTank)) {
                        tank.resolveCollision(otherTank);
                    }
                }

                for (let wall of stadium._walls) {
                    if (wall.testForAABB(tank)) {
                        wall.resolveCollision(tank);
                    }
                }

                for (let bullet of stadium._bullets) {
                    if (bullet._distance > tank._tankBody.width && tank.isInside(bullet._bodyBullet.x, bullet._bodyBullet.y)) {
                        tank.remove();
                        tank._destroyed = true;
                        tank._tankBody.x = -1000000;
                        tank._tankBody.y = -1000000;
                        app.stage.removeChild(tank);
                        continue;
                    }
                }
            }
        });


        // Nettoyage de l'application Pixi lors du démontage du composant
        return () => {
            app.destroy(true, true);
        };
    }, [tankSpawnPositions, WindowHeight, WindowWidth]);

    return (
        <div ref={pixiContainerRef}></div>
    );
};

export default MainPage;