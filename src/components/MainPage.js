import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

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

        // Nettoyage de l'application Pixi lors du démontage du composant
        return () => {
            app.destroy(true, true);
        };
    }, []);

    return (
        <div ref={pixiContainerRef}></div>
    );
};

export default MainPage;
