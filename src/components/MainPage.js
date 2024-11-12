import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Tank} from './Tank';
import {Stadium} from './Stadium';
import {Action} from './Tank';
import {stadiumWidth, stadiumHeight, ScaleFactor} from './ScaleFactor';
import {useLocation, useNavigate} from "react-router-dom";
import EndComponent from "./EndComponent";


const MainPage = ({settings}) => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const nbTank = parseInt(queryParams.get('nbTank'), 10) || 2;
    const isPlayerPlaying = queryParams.get('isPlayerPlaying') === 'true';

    const pixiContainerRef = useRef(null);
    const [tankSpawnPositions, setTankSpawnPositions] = useState([]);
    const WindowWidth = window.innerWidth;
    const WindowHeight = window.innerHeight;
    const tanksColor = [0x00FF00, 0xFF0000, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF]; // tank's color available
    const filePath = 'maps/testSpawn.txt';

    // getSpawnPositions from map file
    function getSpawnPositions() {
        let positions = [];
        fetch(filePath).then(response => response.text())
            .then(text => {
                let map = text.split('\n').map(line => line.slice(0, -1).split(''));
                let rows = map.length;
                let cols = map[0].length;


                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {

                        if (map[i][j] >= 'A' && map[i][j] <= 'Z') {


                            let tankNumber = map[i][j].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
                            positions[tankNumber] = {x: j * stadiumWidth / cols, y: i * stadiumHeight / rows};
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
        let firstActionDone = false;
        if (tankSpawnPositions.length === 0) return; // wait for tankSpawnPositions to be set

        const app = new PIXI.Application({width: WindowWidth, height: WindowHeight, backgroundColor: 0x463928});

        app.stage.interactive = true;
        app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
        pixiContainerRef.current.appendChild(app.view);

        const stadium = new Stadium(stadiumWidth, stadiumHeight, app);
        app.stage.addChild(stadium._bodyStadium);

        //we need to put here the track marks container so that it is displayed behind the tanks (because z-index doesn't work on pixis objects)
        const trackMarksContainer = new PIXI.Container();
        app.stage.addChild(trackMarksContainer);

        //create a pixi graphic that show the centre of the stadium
        /*const centre = new PIXI.Graphics();
        centre.beginFill(0x00FF00);
        centre.drawCircle(stadiumWidth/2, stadiumHeight/2, 5);
        centre.endFill();
        app.stage.addChild(centre);*/


        stadium.generateStadiumFromFile(filePath); // Stadium Wall generation from file

        // Mouse positions
        let mouseX = 0;
        let mouseY = 0;
        app.stage.on('mousemove', (event) => {
            mouseX = event.data.global.x;
            mouseY = event.data.global.y;
        });


        //tanks generation
        for (let i = 0; i < nbTank + 1; i++) {
            let tankSpawnPosition = tankSpawnPositions[i];
            // Tank object creation
            if (tankSpawnPosition) {
                tankSpawnPosition.x += stadium._bodyStadium.x;
                tankSpawnPosition.y += stadium._bodyStadium.y;
                const tank = new Tank(tanksColor[i],
                    {up: "z", left: "q", down: "s", right: "d", shoot: " "},
                    stadiumWidth, stadiumHeight, stadium, app,
                    tankSpawnPosition.x, tankSpawnPosition.y,
                    5, isPlayerPlaying
                );
                tank.setTrackMarksContainer(trackMarksContainer); // set the track marks container to the right one
                stadium.addTank(tank);
                app.stage.addChild(tank._body); // tanks added to the stage
            }
        }

        app.ticker.add(() => {
            for (let tank of stadium._tanks) {
                if (tank._destroyed) continue;

                if (tank._player) {
                    tank.updateRotations(mouseX, mouseY);
                    tank.updatePosition(stadium);
                } else {
                    // tank.performActionIA(Action.UpRight, 500, 500); // IA action
                    if(!firstActionDone){
                        setTimeout(() => {
                            tank.choseAgentAction(mouseX, mouseY);

                        },1000);
                    }
                }

                // Mettre à jour les particules
                tank.updateParticles();

                for (let otherTank of stadium._tanks) {
                    if (tank !== otherTank && tank.checkCollision(otherTank)) {
                        tank.resolveCollision(otherTank);
                    }
                }

                for (let wall of stadium._walls) {
                    let intersection;
                    if (intersection = wall.testForAABB(tank)) {
                        wall.resolveCollision(tank, intersection);
                    }
                }

                for (let bullet of stadium._bullets) {
                    if (bullet._distance > tank._body.width && tank.isInside(bullet._bodyBullet.x, bullet._bodyBullet.y)) {
                        if (tank._aabb) {
                            tank._aabb.removeDisplay();
                        }
                        tank.remove();
                        tank._destroyed = true;
                        tank._body.x = -1000000;
                        tank._body.y = -1000000;
                        app.stage.removeChild(tank);
                        continue;
                    }
                    for (let otherBullet of stadium._bullets) {
                        if (bullet !== otherBullet && bullet.collidesWith(otherBullet)) {
                            bullet.remove();
                            otherBullet.remove();
                            app.stage.removeChild(bullet);
                            app.stage.removeChild(otherBullet);
                        }
                    }
                }
            }
            const remainingTanks = stadium._tanks.filter(tank => !tank._destroyed);
            if (remainingTanks.length === 1) {
                //setIsGameEnded(true);
                app.ticker.stop();
            }
        });


        // Nettoyage de l'application Pixi lors du démontage du composant
        return () => {
            if (app && app.stage) {
                if (app.stage.children.length > 0) {
                    app.stage.removeChildren();
                }
                app.destroy(true, true);
            }


        };
    }, [tankSpawnPositions, WindowHeight, WindowWidth, settings]);

    return (
        <div ref={pixiContainerRef}>

        </div>
    );
};

export default MainPage;