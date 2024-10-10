import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import {Tank} from './Tank';
import {Stadium} from './Stadium';

const MainPage = () => {
    const pixiContainerRef = useRef(null);
    const WindowWidth = window.innerWidth;
    const WindowHeight = window.innerHeight;
    useEffect(() => {
        // Création de l'application Pixi
        const app = new PIXI.Application({ width: WindowWidth, height: WindowHeight, backgroundColor: 0x463928 });
        pixiContainerRef.current.appendChild(app.view);

        // Creation du stade
        const stadiumHeight = WindowHeight  * 0.8;
        const stadiumWidth = WindowWidth * 0.8;
        const stadium = new Stadium(stadiumWidth, stadiumHeight);
        app.stage.addChild(stadium._bodyStadium);

        // Ajout des murs
        stadium.generateStadiumFromFile('maps/test.txt');
        //stadium.generateRandomStadium();

        // Variables pour la position de la souris
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
        let mouseX = 0;
        let mouseY = 0;
        app.stage.on('mousemove', (event) =>
        {
            mouseX = event.global.x;
            mouseY = event.global.y;
        });


        // Creation des tanks
        const tanks = [];

        tanks[0] = new Tank(0x827B60,
            { up: "z", left: "q", down: "s", right: "d", shoot:" "},
            stadiumWidth, stadiumHeight, stadium, app,   
            184, 144
        );
        tanks[1] = new Tank(0x667c3e,
            { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", shoot:"Shift"},
            stadiumWidth, stadiumHeight, stadium, app,
            922, 660
        );


        let brownTank = tanks[0];
        let greenTank = tanks[1];


        //faire apparaitre le tank vert dans le stadium
        greenTank._coordinateSpawnX = stadiumWidth - greenTank._tankBody.width;
        greenTank._coordinateSpawnY = stadiumHeight - greenTank._tankBody.height;
        greenTank._tankBody.x = greenTank._coordinateSpawnX;
        greenTank._tankBody.y = greenTank._coordinateSpawnY;

        app.stage.addChild(brownTank._tankBody);
        app.stage.addChild(greenTank._tankBody);

        app.stage.on('click', () => {
            // Supposons que vous tiriez avec le premier tank (brownTank)
            brownTank.performAction('shoot');
            app.stage.addChild(brownTank._bulletPath); // Assurez-vous que la trajectoire est visible
        });


        app.ticker.add(() => {
            for (let i = 0; i < tanks.length; i++) {
                let tank = tanks[i];
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

                for (let bullet of stadium._bullets) {
                    if (bullet._distance > tank._tankBody.width && tank.isInside(bullet._bodyBullet.x, bullet._bodyBullet.y)) {
                        console.log("touche");
                        continue;
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
    }, [WindowHeight, WindowWidth]);

    return (
        <div ref={pixiContainerRef}></div>
    );
};

export default MainPage;
