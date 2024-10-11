import '../styles/MenuComponent.css';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
//import BackgroundImage from '../assets/Background.jpg'; // Si vous avez une image de fond

import TankImage from '../assets/tank'; // Importer l'image du tank

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
            <div id="LeftPane">
                <img src={TankImage} alt="Tank" id="TankSprite" /> {/* Image animée */}
            </div>
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
