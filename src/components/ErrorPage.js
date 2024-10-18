import {useNavigate} from "react-router-dom";
import '../styles/ErrorComponent.css';
import {TypeAnimation} from "react-type-animation";

const ErrorPage = () => {

    const navigate = useNavigate();

    function handleClick() {
        navigate('/');
    }

    return (
        <div id="error-container">
            <TypeAnimation
                sequence={['Error 404', 1000]}
                wrapper="h1"
                cursor={true}
                repeat={Infinity}
                className="animated-title-error"
            />
            <img
                src="https://media.giphy.com/media/26gsrjeQrGMriqJdS/giphy.gif"
                alt="Error 404"
                className="giphy-embed"
            />

            <br />
            <button onClick={handleClick} className="button-return-menu">Go back to menu</button>
        </div>
    );
};

export default ErrorPage;