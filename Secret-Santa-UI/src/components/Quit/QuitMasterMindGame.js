import React, { useEffect, useState } from "react";
import "../Congrats/CongratulationsPopup.css"
import { getRealPatternForMasterMindGame } from "../../services/gameService";
import { MASTER_MIND_GAME_KEY } from '../../constants/appConstant';

const colorMap = {
  1: "red",
  2: "green",
  3: "black",
  4: "white",
  5: "blue",
  6: "yellow",
  7: "orange",
  8: "purple",
};

const QuitPopup = ({ onClose }) => {
  const [pattern, setPattern] = useState([]);
  const masterMindGameId = localStorage.getItem(MASTER_MIND_GAME_KEY);

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
      <h2>❌ You Failed to Break the Code!</h2>
        <p>Better luck next time. Try again! Here is the actual pattern:</p>
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

export default QuitPopup;
