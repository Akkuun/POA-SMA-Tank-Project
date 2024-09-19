export class Stadium{
    _width;
    _height;
    _bodyStadium;
    constructor(width, height){
        this._width=width;
        this._height=height;
        this._bodyStadium= new Sprite(Texture.WHITE);
    }

    display(){
        this._bodyStadium.position.set(0,0);
        this._bodyStadium.width = 100;
        this._bodyStadium.height = 100;
        this._bodyStadium.tint = 0xff0000;
    }

    get bodyStadium() {
        return this._bodyStadium;
    }

    set bodyStadium(value) {
        this._bodyStadium = value;
    }
}