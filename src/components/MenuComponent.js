import '../styles/MenuComponent.css';
import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import TankVideo from '../assets/Tank.mp4';
import {useNavigate} from "react-router-dom"; // Chemin de la vidéo

const MenuComponent = ({ settings  , setSettings}) => {
    const [showSettings, setShowSettings] = useState(false); // Suivi de l'état des options
    const [tankNumber, setTankNumber] = useState(settings[0]);
    const [isPlayerPlaying, setIsPlayerPlaying] = useState(settings[1]);

    const onSettingsChange = (newSettings) => {
        setSettings(newSettings);
    }

    const navigate = useNavigate();

    const handleClickOption = () => {
        setShowSettings(!showSettings); // Basculer l'affichage des paramètres
    };

    const handleSave = () => {
        // On sauvegarde les settings en tant que tableau, pas objet
        onSettingsChange([Number(tankNumber), isPlayerPlaying]);
        setShowSettings(false); // Fermer le bloc après la sauvegarde
    };



    return (
        <div id="Menu">
            {/* Vidéo de fond */}
            <video id="background-video" autoPlay loop muted>
                <source src={TankVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div id="Bloc">
                <TypeAnimation
                    sequence={['Welcome to the Tank Game!', 1000, 'Prepare for Battle!', 1000]}
                    wrapper="h1"
                    cursor={true}
                    repeat={Infinity}
                    className="animated-title"
                />
                <button onClick={() => navigate('/game')}>Start</button>
                <button onClick={handleClickOption}>Options</button>

                {/* Bloc de settings qui s'affiche quand on clique sur Options */}
                {showSettings && (
                    <div id="SettingsPanel">
                        <form>
                            <div className="form-group">
                                <label htmlFor="tankNumber" className="form-label">Tank Number : </label>
                                <input
                                    type="number"
                                    id="tankNumber"
                                    className="form-input"
                                    value={tankNumber}
                                    onChange={(e) => setTankNumber(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="isPlayerPlaying" className="form-label">Is Player Playing : </label>
                                <input
                                    type="checkbox"
                                    id="isPlayerPlaying"
                                    className="form-checkbox"
                                    checked={isPlayerPlaying}
                                    onChange={(e) => setIsPlayerPlaying(e.target.checked)}
                                />
                            </div>
                            <button type="button" onClick={handleSave} className="form-button">Save</button>
                        </form>

                    </div>

                )}
                <div id="Option">
                    <p>Tank Number : {tankNumber}</p>
                    {isPlayerPlaying ? (
                        <p>Player is playing</p>
                    ) : (
                        <p>Player is not playing</p>
                    )}
                </div>

            </div>


</div>
)
    ;
};

export default MenuComponent;
