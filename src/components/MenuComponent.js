import '../styles/MenuComponent.css';
import { useNavigate } from 'react-router-dom';

const MenuComponent = ({ settings }) => {
    const navigate = useNavigate(); // Initialiser useNavigate

    const handleClickOption = () => {
        navigate('/settings');
    };

    const handleClickStart = () => {
        navigate('/game');
    }

    return (
        <div id="Menu">
            <h1>Menu</h1>
            <button onClick={handleClickStart}>Start</button>
            <button onClick={handleClickOption}>Options</button>
            <h1>Tank Number: {settings[0]}</h1> {/* Nombre de tanks */}
            <h1>Is Player Playing: {settings[1] ? 'Yes' : 'No'}</h1> {/* Booléen converti en texte */}
        </div>
    );
};

export default MenuComponent;
