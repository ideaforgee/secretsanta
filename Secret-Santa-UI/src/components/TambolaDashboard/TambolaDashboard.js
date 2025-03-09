import React from "react";
import { ImCross } from "react-icons/im";
import "./TambolaDashboard.css";

const TambolaDashboardPopup = ({ visible, onClose, onHostGame, onJoinGame }) => {
  if (!visible) return null; // Don't render if hidden

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Tambola Game</h2>
        <p>Do you want to host a new game or join an existing one?</p>

        <div className="popup-buttons">
          <button className="host-btn" onClick={onHostGame}>Host Game</button>
          <button className="join-btn" onClick={onJoinGame}>Join Game</button>
        </div>

        <div className="close-icon" onClick={onClose}><ImCross /></div>
      </div>
    </div>
  );
};

export default TambolaDashboardPopup;
