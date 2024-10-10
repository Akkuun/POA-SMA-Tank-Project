import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Tank} from './Tank';
import {Stadium} from './Stadium';

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
                            positions[tankNumber] = {x: j * WindowWidth / cols, y: i * WindowHeight / rows};
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
        pixiContainerRef.current.appendChild(app.view);

        const stadiumHeight = WindowHeight * 0.8;
        const stadiumWidth = WindowWidth * 0.8;
        const stadium = new Stadium(stadiumWidth, stadiumHeight);
        app.stage.addChild(stadium._bodyStadium);

        stadium.generateStadiumFromFile('maps/testSpawn.txt'); // Stadium Wall generation from file

        // Mouse positions
        let mouseX = 0;
        let mouseY = 0;
        app.stage.on('mousemove', (event) => {
            mouseX = event.global.x;
            mouseY = event.global.y;
        });

        const tanksColor = [0x00FF00, 0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]; // tank's color available
        const tanks = [];

        //tanks generation
        for (let i = 0; i < tankSpawnPositions.length; i++) {
            let tankSpawnPosition = tankSpawnPositions[i];
            // Tank object creation
            if (tankSpawnPosition) {
                const tank = new Tank(tanksColor[i],
                    {up: "z", left: "q", down: "s", right: "d", shoot: " "},
                    stadiumWidth, stadiumHeight, stadium, app,
                    tankSpawnPosition.x, tankSpawnPosition.y
                );
                tanks.push(tank);
                app.stage.addChild(tank._tankBody); // tanks added to the stage
            }
        }


        // app.stage.on('click', () => {
        //
        //     console.log('shoot');
        //     tanks[0].performAction('shoot');
        //     app.stage.addChild(tanks[0]._bulletPath);
        //
        // });

        // Mise à jour des tanks
        app.ticker.add(() => {
            for (let tank of tanks) {

                tank.updateRotations(mouseX, mouseY);
                tank.updatePosition(stadium);

                for (let otherTank of tanks) {
                    if (tank !== otherTank && tank.checkCollision(otherTank)) {
                        tank.resolveCollision(otherTank);
                    }
                    tank.updateCannonPosition(mouseX, mouseY);

                }
                for (let wall of stadium._walls) {
                    if (wall.testForAABB(tank)) {
                        wall.resolveCollision(tank);
                    }
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