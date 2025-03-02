import React from "react";
import "./ReturnFunZonePopUp.css";

const ReturnFunZonePopUp = ({ onCloseReturnFunZone, onConfirmReturnFunZone }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <p>This action will finish your game and return to Fun Zone.</p>
        <div className="popup-buttons">
          <button className="cancel-btn" onClick={onCloseReturnFunZone}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirmReturnFunZone}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ReturnFunZonePopUp;
