import React, { useEffect, useState } from "react";
import "./CongratulationsPopup.css";
import { MASTER_MIND_GAME_KEY } from '../../constants/appConstant';
import { getRealPatternForMasterMindGame } from "../../services/gameService";

const CongratulationsPopup = ({ onClose, colorMap }) => {
  const masterMindGameId = localStorage.getItem(MASTER_MIND_GAME_KEY);
  const [pattern, setPattern] = useState([]);

  useEffect(() => {
    const fetchPattern = async () => {
      try {
        const response = await getRealPatternForMasterMindGame(masterMindGameId);
        setPattern(response?.split(",").map((num) => colorMap[num]));
      } catch (error) {
        console.error("Error fetching pattern:", error);
      }
    };

    fetchPattern();
  }, []);

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You broke the code! Here is the actual pattern:</p>
        <div className="pattern-display">
          {pattern.map((color, index) => (
            <div key={index} className="pattern-circle" style={{ backgroundColor: color }}></div>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CongratulationsPopup;
