import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "../constants/secretSantaConstants";
import "./HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const handlePlayClick = () => {
        navigate(ROUTE_PATH.LOGIN);
    };

    return (
        <div className="home-container">
            <div className="content">
                <div className="content-heading">
                    Welcome to the Secret Santa Game!
                </div>
                <p className="content-sub-heading">Plan a fun and exciting gift exchange with your friends.</p>
                <button className="game-home-actions" onClick={handlePlayClick}>Play Now</button>
            </div>
        </div>
    );
};

export default HomePage;
