import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Tank} from './Tank';
import {Stadium} from './Stadium';

const MainPage = () => {
        const pixiContainerRef = useRef(null);
        const WindowWidth = window.innerWidth;
        const WindowHeight = window.innerHeight;

        const [tankSpawnPositions, setTankSpawnPositions] = useState([]);

        const handleTankSpawnPositions = (positions) => {
            setTankSpawnPositions(positions);
        };

        useEffect(() => {


                // Création de l'application Pixi
                const app = new PIXI.Application({width: WindowWidth, height: WindowHeight, backgroundColor: 0x463928});
                pixiContainerRef.current.appendChild(app.view);

                // Creation du stade
                const stadiumHeight = WindowHeight * 0.8;
                const stadiumWidth = WindowWidth * 0.8;
                const stadium = new Stadium(stadiumWidth, stadiumHeight, handleTankSpawnPositions);
                app.stage.addChild(stadium._bodyStadium);

                const tankNumber = 2;
                // Array of tank spawn positions represented by a hook


                // Ajout des murs
                stadium.generateStadiumFromFile('maps/testSpawn.txt');
                //stadium.generateRandomStadium();

                // Variables pour la position de la souris
                app.stage.eventMode = 'static';
                app.stage.hitArea = app.screen;
                let mouseX = 0;
                let mouseY = 0;
                app.stage.on('mousemove', (event) => {
                    mouseX = event.global.x;
                    mouseY = event.global.y;
                });


                // Creation des tanks
                const tanks = [];
                const tanksColor = [0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343, 0x827B60, 0x667c3e, 0x434343];
                console.log("tankSpawnPositions");

                console.log(tankSpawnPositions[1]); // tank 0
                console.log(tankSpawnPositions[2]); // tank 1

                for (let i = 0; i < tankNumber; i++) {
                    tanks[i] = new Tank(tanksColor[i+1],
                        {up: "z", left: "q", down: "s", right: "d", shoot: " "},
                        stadiumWidth, stadiumHeight, stadium, app,
                        100, 300
                    );
                }
                // tanks[0] = new Tank(0x827B60,
                //     { up: "z", left: "q", down: "s", right: "d", shoot:" "},
                //     stadiumWidth, stadiumHeight, stadium, app,
                //     100, 300
                // );
                // tanks[1] = new Tank(0x667c3e,
                //     { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", shoot:"Shift"},
                //     stadiumWidth, stadiumHeight, stadium, app,
                //     700, 800
                // );


                let brownTank = tanks[0];
                let greenTank = tanks[1];


                app.stage.addChild(brownTank._tankBody);
                app.stage.addChild(greenTank._tankBody);

                app.stage.on('click', () => {
                    // Supposons que vous tiriez avec le premier tank (brownTank)
                    brownTank.performAction('shoot');
                    app.stage.addChild(brownTank._bulletPath); // Assurez-vous que la trajectoire est visible
                });


                app.ticker.add(() => {
                    for (let tank of tanks) {
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

                app.ticker.add(() => {
                    brownTank.updateCannonPosition(mouseX, mouseY);
                    greenTank.updateCannonPosition(mouseX, mouseY);
                });

                // Nettoyage de l'application Pixi lors du démontage du composant
                return () => {
                    app.destroy(true, true);
                };
            }, [WindowHeight, WindowWidth]
        )
        ;
        useEffect(() => {
            if (tankSpawnPositions.length > 0) {
                // Utilisez un check pour éviter d'exécuter le même code plusieurs fois inutilement.
                console.log("Tank Spawn Positions:", tankSpawnPositions);
                // Vous pouvez placer les tanks ou faire d'autres actions ici, mais seulement si la longueur des positions a changé
            }
        }, [tankSpawnPositions]);

        return (
            <div ref={pixiContainerRef}></div>
        );
    }
;

export default MainPage;
