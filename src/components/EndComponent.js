import {Link} from "react-router-dom";

const EndComponent = ({ winner }) => {
    return (
        <div className="end-component">
            <h1>Victory of {winner} !</h1>
            <Link to="/">New Game</Link>
        </div>
    );
}
export default EndComponent;