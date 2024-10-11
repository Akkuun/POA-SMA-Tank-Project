const WindowWidth = window.innerWidth;
const WindowHeight = window.innerHeight;
const targetRatio = 1920/969;
export const ScaledWidth = (WindowWidth/WindowHeight > targetRatio) ? WindowHeight * targetRatio : WindowWidth;
export const ScaledHeight = (WindowWidth/WindowHeight <= targetRatio) ? WindowWidth / targetRatio : WindowHeight;
export const stadiumHeight = ScaledHeight * 0.8;
export const stadiumWidth = ScaledWidth * 0.8;
export const ScaleFactor = ScaledWidth / WindowHeight;