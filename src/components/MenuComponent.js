import '../styles/MenuComponent.css';
import {useState} from 'react';
import {TypeAnimation} from 'react-type-animation';
import TankVideo from '../assets/Tank.mp4';
import OST from '../assets/OST.mp3';
import {useNavigate} from 'react-router-dom';

const MenuComponent = ({settings, setSettings}) => {
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

    // Handlers pour augmenter/diminuer le nombre de tanks
    const incrementTankNumber = () => setTankNumber(prev => Math.min(prev + 1, 10)); // Limite à 99 tanks
    const decrementTankNumber = () => setTankNumber(prev => Math.max(prev - 1, 1)); // Minimum 1 tank

    function lauchGame(){
        //musique
        const audio = new Audio(OST);
        audio.autoplay = true;
        audio.loop = true;
        audio.volume = 0.8;

        audio.play();
        navigate(`/game?nbTank=${tankNumber}&isPlayerPlaying=${isPlayerPlaying}`);
    }

    return (
        <div id="Menu">
            {/* Vidéo de fond */}
            <video id="background-video" autoPlay loop muted>
                <source src={TankVideo} type="video/mp4"/>
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
                <button onClick={lauchGame} id="start">Start </button>
                <button onClick={handleClickOption}>Options</button>
                {showSettings && (
                    <div id="SettingsPanel">
                        <form>
                            <div className="form-group">
                                <label htmlFor="tankNumber" className="form-label">Tank Number : </label>
                                <div className="button-group">
                                    <button type="button" onClick={decrementTankNumber}
                                            className="form-button-small">-
                                    </button>
                                    <span className="tank-number-display">{tankNumber}</span>
                                    <button type="button" onClick={incrementTankNumber}
                                            className="form-button-small">+
                                    </button>
                                </div>
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
                            <button id="save" type="button" onClick={handleSave} className="form-button">Save</button>
                        </form>
                    </div>
                )}
                <div id="Option">
                    <p> Tank Number : {tankNumber}</p>
                    {isPlayerPlaying ? (
                        <p> Player is playing</p>
                    ) : (
                        <p> Player is not playing</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuComponent;
