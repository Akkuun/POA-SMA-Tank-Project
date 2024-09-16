import React, { useState, useEffect } from 'react';
import { Stage, Container, Graphics } from '@pixi/react';

const MainPage = () => {
    const [yPosition, setYPosition] = useState(0);
    const [direction, setDirection] = useState(1);

    // Mettre à jour la position du carré à chaque frame
    useEffect(() => {
        const animate = () => {
            setYPosition(prevY => {
                const newY = prevY + 5 * direction;
                if (newY > 400 || newY < 0) {
                    setDirection(-direction); // Inverser la direction si on atteint les bords
                }
                return newY;
            });
        };

        const intervalId = setInterval(animate, 16); // 60 FPS

        return () => clearInterval(intervalId); // Nettoyer l'intervalle quand le composant est démonté
    }, [direction]);

    const drawSquare = (g) => {
        g.clear();
        g.beginFill(0xff0000); // Couleur rouge pour le carré
        g.drawRect(0, 0, 50, 50); // Dessine un carré de 50x50
        g.endFill();
    };

    return (
        <Stage width={800} height={600} options={{ backgroundColor: 0x1099bb }}>
            <Container x={375} y={yPosition}>
                <Graphics draw={drawSquare} />
            </Container>
        </Stage>
    );
};

export default MainPage;
