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
        const app = new PIXI.Application({ width: WindowWidth, height: WindowHeight, backgroundColor: 0x1099bb });
        pixiContainerRef.current.appendChild(app.view);

        // Creation du stade
        const stadiumHeight = WindowHeight  * 0.9;
        const stadiumWidth = WindowWidth * 0.9;
        const stadium = new Stadium(stadiumWidth, stadiumHeight);
        app.stage.addChild(stadium._bodyStadium);

        // Ajout des murs
        stadium.addWall(500, 500, 100, 100);
        
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
        tanks[0] = new Tank(0x827B60, { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", shoot:" "}, stadiumWidth, stadiumHeight, app);
        tanks[1] = new Tank(0x667c3e, { up: "z", left: "q", down: "s", right: "d", shoot:"Shift" }, stadiumWidth, stadiumHeight, app);

        let brownTank = tanks[0];
        let greenTank = tanks[1];

        brownTank._tankBody.x=100;
        brownTank._tankBody.y=100;

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
    }, [WindowHeight, WindowWidth]);

    return (
        <div ref={pixiContainerRef}></div>
    );
};

export default MainPage;
