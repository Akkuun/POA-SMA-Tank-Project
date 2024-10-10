import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Tank } from './Tank';
import { Stadium } from './Stadium';

const MainPage = () => {
    const pixiContainerRef = useRef(null);
    const [tankSpawnPositions, setTankSpawnPositions] = useState([]);
    const WindowWidth = window.innerWidth;
    const WindowHeight = window.innerHeight;

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
                        if (map[i][j] === 'T') {
                            let tankNumber = map[i][j + 1] - 1;
                            positions[tankNumber] = { x: j * WindowWidth / cols, y: i * WindowHeight / rows };
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
        if (tankSpawnPositions.length === 0) return; // Attendre que les positions soient définies

        const app = new PIXI.Application({ width: WindowWidth, height: WindowHeight, backgroundColor: 0x463928 });
        pixiContainerRef.current.appendChild(app.view);

        const stadiumHeight = WindowHeight * 0.8;
        const stadiumWidth = WindowWidth * 0.8;
        const stadium = new Stadium(stadiumWidth, stadiumHeight);
        app.stage.addChild(stadium._bodyStadium);

        stadium.generateStadiumFromFile('maps/testSpawn.txt');

        // Variables pour la position de la souris
        let mouseX = 0;
        let mouseY = 0;
        app.stage.on('mousemove', (event) => {
            mouseX = event.global.x;
            mouseY = event.global.y;
        });

        const tanksColor = [0x827B60, 0x667c3e];
        const tanks = [];

        // Création des tanks
        for (let i = 0; i < tankSpawnPositions.length; i++) {
            let tankSpawnPosition = tankSpawnPositions[i];

            if (tankSpawnPosition) { // Vérifiez que la position est définie
                const tank = new Tank(tanksColor[i],
                    { up: "z", left: "q", down: "s", right: "d", shoot: " " },
                    stadiumWidth, stadiumHeight, stadium, app,
                    tankSpawnPosition.x, tankSpawnPosition.y
                );
                tanks.push(tank);
                app.stage.addChild(tank._tankBody); // Ajout des tanks au stage
            }
        }

        app.stage.on('click', () => {
            if (tanks[0]) {
                tanks[0].performAction('shoot');
                app.stage.addChild(tanks[0]._bulletPath);
            }
        });

        // Mise à jour des tanks
        app.ticker.add(() => {
            for (let tank of tanks) {
                if (!tank) continue; // Vérifiez que le tank est bien défini
                tank.updateRotations(mouseX, mouseY);
                tank.updatePosition(stadium);

                for (let otherTank of tanks) {
                    if (tank !== otherTank && tank.checkCollision(otherTank)) {
                        tank.resolveCollision(otherTank);
                    }
                }
                for (let wall of stadium._walls) {
                    if (wall.testForAABB(tank)) {
                        wall.resolveCollision(tank);
                    }
                }
            }
        });

        // Mise à jour de la position des canons
        app.ticker.add(() => {
            for (let tank of tanks) {
                if (tank) {
                    tank.updateCannonPosition(mouseX, mouseY);
                }
            }
        });

        return () => {
            app.destroy(true, true);
        };
    }, [tankSpawnPositions, WindowHeight, WindowWidth]);

    return (
        <div ref={pixiContainerRef}></div>
    );
};

export default MainPage;