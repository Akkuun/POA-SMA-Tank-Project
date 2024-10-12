import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuComponent from "./components/MenuComponent";
import MainPage from "./components/MainPage";

const App = () => {
    // settings Array ==> 0: tankNumber, 1: isPlayerPlaying
    const [settings, setSettings] = useState([2, false]); // Initialiser avec deux valeurs (nombre de tanks et booléen)

    const gameSettings = {
        tankNumber: settings[0],
        isPlayerPlaying: settings[1]
    };
    console.log("APP", settings[0], settings[1]);



    return (
        <Routes>
            <Route path="/" element={<MenuComponent settings={settings} setSettings={setSettings} />} />
            <Route path="/game" element={<MainPage settings={settings} />} />
        </Routes>
    );
};

export default App;
