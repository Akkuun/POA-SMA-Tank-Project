import '../styles/MenuComponent.css';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
// Importer la vidéo depuis le dossier assets
import TankVideo from '../assets/Tank.mp4'; // Chemin de la vidéo

const MenuComponent = ({ settings }) => {
    const navigate = useNavigate();

    const handleClickOption = () => {
        navigate('/settings');
    };

    const handleClickStart = () => {
        navigate('/game');
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
                <button onClick={handleClickStart}>Start</button>
                <button onClick={handleClickOption}>Options</button>

                <TypeAnimation
                    sequence={[
                        'Tank Number: ' + settings[0],
                        5000,
                        '',
                        5000,
                        'Is Player Playing: ' + (settings[1] ? 'Yes' : 'No'),
                    ]}
                    wrapper="div"
                    cursor={true}
                    repeat={Infinity}
                    className="settings-info"
                />
            </div>
        </div>
    );
};

export default MenuComponent;
