import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuComponent from "./components/MenuComponent";
import SettingsComponent from "./components/SettingsComponent";
import MainPage from "./components/MainPage";

const App = () => {
    // settings Array ==> 0: tankNumber, 1: isPlayerPlaying
    const [settings, setSettings] = useState([0, false]); // Initialiser avec deux valeurs (nombre de tanks et booléen)

    const updateSettings = (newSettings) => {
        const updatedSettings = [...settings];
        updatedSettings[0] = newSettings.tankNumber;      // Met à jour le nombre de tanks
        updatedSettings[1] = newSettings.isPlayerPlaying;  // Met à jour si le joueur joue
        setSettings(updatedSettings);
    };

    return (
        <Routes>
            <Route path="/" element={<MenuComponent settings={settings} />} />
            <Route path="/settings" element={<SettingsComponent onSettingsChange={updateSettings} />} />
            <Route  path="/game" element={<MainPage settings={settings} />} />
        </Routes>
    );
};

export default App;
