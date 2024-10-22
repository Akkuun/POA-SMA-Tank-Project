import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuComponent from "./components/MenuComponent";
import MainPage from "./components/MainPage";
import ErrorPage from "./components/ErrorPage";

const App = () => {
    // settings Array ==> 0: tankNumber, 1: isPlayerPlaying
    const [settings, setSettings] = useState([1, true]); // Initialiser avec deux valeurs (nombre de tanks et booléen)


    return (
        <Routes>
            <Route path="/" element={<MenuComponent settings={settings} setSettings={setSettings} />} />
            <Route path="/game" element={<MainPage settings={settings} />} />
            <Route path="*" element={<ErrorPage/>} />
        </Routes>
    );
};

export default App;
