import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/SettingsComponent.css';  // Assurez-vous d'importer le CSS

const SettingsComponent = ({ onSettingsChange }) => {
    const [tankNumber, setTankNumber] = useState('');
    const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSettingsChange({
            tankNumber: Number(tankNumber),
            isPlayerPlaying: isPlayerPlaying
        });
        navigate('/');
    };

    const navigate = useNavigate();

    return (
        <div id="SettingsContainer">
            <h1 className="settings-title">Settings</h1>
            <form onSubmit={handleSubmit} id="SettingsForm">
                <div className="form-group">
                    <label htmlFor="tankNumber" className="form-label">Tank Number:</label>
                    <input
                        type="number"
                        id="tankNumber"
                        className="form-input"
                        value={tankNumber}
                        onChange={(e) => setTankNumber(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="isPlayerPlaying" className="form-label">Is Player Playing:</label>
                    <input
                        type="checkbox"
                        id="isPlayerPlaying"
                        className="form-checkbox"
                        checked={isPlayerPlaying}
                        onChange={(e) => setIsPlayerPlaying(e.target.checked)}
                    />
                </div>
                <input type="submit" value="Submit" className="form-button" />
            </form>
            <button onClick={() => navigate('/')} className="form-button go-back">Go Back</button>
        </div>
    );
};

export default SettingsComponent;
