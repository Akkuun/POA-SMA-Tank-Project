import * as PIXI from 'pixi.js';

export class Particle {
    constructor(app, x, y, typeOfParticle) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.size = 8;
        this.lifeSpan = 40;
        this.startTime = Date.now();
        this.velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10,
        };
        this.alphaDecay = 0.02;

        switch (typeOfParticle) {
            case 1:
                // Dessin de l'éclat principal (blanc)
                this.sprite = new PIXI.Graphics();
                const numLines = 8; // Nombre de lignes d'explosion blanche

                for (let i = 0; i < numLines; i++) {
                    const angle = (i / numLines) * Math.PI * 2;
                    const lineLength = Math.random() * 10 + 5;

                    const endX = Math.cos(angle) * lineLength;
                    const endY = Math.sin(angle) * lineLength;

                    this.sprite.lineStyle(2, 0xff0000); // Éclat jaune
                    this.sprite.moveTo(0, 0);
                    this.sprite.lineTo(endX, endY);
                }

                // Ajouter un éclat plus petit en jaune
                const numYellowLines = 5; // Nombre de lignes d'explosion jaune
                const yellowOffsetX = 5; // Décalage pour que l'explosion jaune soit à côté
                const yellowOffsetY = 5;

                for (let i = 0; i < numYellowLines; i++) {
                    const angle = (i / numYellowLines) * Math.PI * 2;
                    const lineLength = Math.random() * 5 + 3; // Taille plus petite pour l'éclat jaune

                    const endX = Math.cos(angle) * lineLength + yellowOffsetX;
                    const endY = Math.sin(angle) * lineLength + yellowOffsetY;

                    this.sprite.lineStyle(1.5, 0xffff00); // Éclat jaune
                    this.sprite.moveTo(yellowOffsetX, yellowOffsetY);
                    this.sprite.lineTo(endX, endY);
                }

                // Positionner le centre de l'explosion à x, y
                this.sprite.x = x;
                this.sprite.y = y;
                break;

            default:
                return;
        }

        this.app.stage.addChild(this.sprite);

    }

    update() {
        if(!this.sprite) return false;
        if(this.app.stage.children.indexOf(this.sprite) === -1) return false;


        const elapsed = Date.now() - this.startTime;
        this.size -= 0.05;

        // Appliquer la vitesse pour simuler une explosion en expansion
        this.sprite.x += this.velocity.x;
        this.sprite.y += this.velocity.y;

        // Réduire l'échelle et l'opacité progressivement
        this.sprite.scale.set(this.size / 5);
        this.sprite.alpha -= this.alphaDecay;

        if (elapsed > this.lifeSpan || this.sprite.alpha <= 0) {
            this.sprite.destroy();
            return false;
        }
        return true;
    }

    //function that deletes all the particles
    delete() {
        this.sprite.destroy();


    }
}
