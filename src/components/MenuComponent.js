import '../styles/MenuComponent.css';
import { useNavigate } from 'react-router-dom';
const MenuComponent = () => {
    const navigate = useNavigate(); // Initialiser useNavigate
    function handleClickOption() {
        navigate('/settings');
    }
    

    return (
        <div id="Menu">
            <h1>Menu</h1>
            <button>Start</button>
            <button onClick={handleClickOption}>Options</button>
        </div>
    )
}

export default MenuComponent;