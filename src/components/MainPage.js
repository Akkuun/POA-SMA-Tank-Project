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
        const stadiumHeight = 700;
        const stadiumWidth = 700;
        const stadium = new Stadium(stadiumWidth, stadiumHeight);
        app.stage.addChild(stadium._bodyStadium);

        // Creation des tanks
        const brownTank = new Tank(0x827B60, { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight" }, stadiumWidth, stadiumHeight);
        const greenTank = new Tank(0x667c3e, { up: "z", left: "q", down: "s", right: "d" }, stadiumWidth, stadiumHeight);

        brownTank._tankBody.x=100;
        brownTank._tankBody.y=100;

        //faire apparaitre le tank vert dans le stadium
        greenTank._coordinateSpawnX = stadiumWidth - greenTank._tankBody.width;
        greenTank._coordinateSpawnY = stadiumHeight - greenTank._tankBody.height;
        greenTank._tankBody.x = greenTank._coordinateSpawnX;
        greenTank._tankBody.y = greenTank._coordinateSpawnY;

        app.stage.addChild(brownTank._tankBody);
        app.stage.addChild(greenTank._tankBody);

        app.ticker.add(() => {
            brownTank.updatePosition(stadium);
            greenTank.updatePosition(stadium);
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
