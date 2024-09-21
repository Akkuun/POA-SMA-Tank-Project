import { useState } from 'react';
import {useNavigate} from "react-router-dom";

const SettingsComponent = ({ onSettingsChange }) => {
    const [tankNumber, setTankNumber] = useState('');
    const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Transmettre les paramètres sous forme d'objet pour regrouper les deux options
        onSettingsChange({
            tankNumber: Number(tankNumber),
            isPlayerPlaying: isPlayerPlaying
        });
    };
    const navigate = useNavigate(); // Initialiser useNavigate

    return (
        <div>
            <h1>Settings Component</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Tank Number:
                    <input
                        type="number"
                        name="tankNumber"
                        value={tankNumber}
                        onChange={(e) => setTankNumber(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Is Player Playing:
                    <input
                        type="checkbox"
                        name="isPlayerPlaying"
                        checked={isPlayerPlaying} // Utiliser checked pour les checkbox
                        onChange={(e) => setIsPlayerPlaying(e.target.checked)} // e.target.checked renvoie un booléen
                    />
                </label>
                <br />
                <input type="submit" value="Submit" />
            </form>
            <button onClick={() => navigate('/')}>Go Back</button>
        </div>
    );
}

export default SettingsComponent;
