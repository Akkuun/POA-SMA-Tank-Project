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

        // Création du carré rouge (de haut en bas)
        const redSquare = new PIXI.Graphics();
        redSquare.beginFill(0xff0000); // Rouge
        redSquare.drawRect(0, 0, 50, 50); // Un carré de 50x50
        redSquare.endFill();
        redSquare.x = 375;
        redSquare.y = 0;
        app.stage.addChild(redSquare);

        let redDirection = 1;

        // Création du carré bleu (de gauche à droite)
        const blueSquare = new PIXI.Graphics();
        blueSquare.beginFill(0x0000ff); // Bleu
        blueSquare.drawRect(0, 0, 50, 50); // Un carré de 50x50
        blueSquare.endFill();
        blueSquare.x = 0;
        blueSquare.y = 275;
        app.stage.addChild(blueSquare);

        let blueDirection = 1;

        // Animation du carré rouge (haut-bas)
        app.ticker.add(() => {
            redSquare.y += 5 * redDirection;
            if (redSquare.y > 550 || redSquare.y < 0) {
                redDirection *= -1;
            }

            // Animation du carré bleu (gauche-droite)
            blueSquare.x += 5 * blueDirection;
            if (blueSquare.x > 750 || blueSquare.x < 0) {
                blueDirection *= -1;
            }
        });

        //creation de tanks
        let brownTank = new Tank(0x827B60, { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight" });
        brownTank.display();

        let greenTank = new Tank(0x667c3e, { up: "z", left: "q", down: "s", right: "d" });
        greenTank.display();

        //pour avoir l'objet PIXI
        let brownTankBody = brownTank.tankBody;
        let greenTankBody = greenTank.tankBody;

        app.stage.addChild(brownTankBody);
        app.stage.addChild(greenTankBody);



        app.ticker.add(() => {
            brownTank.updatePosition();
            greenTank.updatePosition();
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
