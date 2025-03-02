import React from 'react';
import './LevelPopUp.css';

function LevelPopUp ({ onClose, onLevelSelect }) {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Select Difficulty Level</h2>
        <div className="level-options">
          <button className="level-btn" onClick={() => onLevelSelect('Easy')}>Easy</button>
          <button className="level-btn" onClick={() => onLevelSelect('Medium')}>Medium</button>
          <button className="level-btn" onClick={() => onLevelSelect('Hard')}>Hard</button>
          <button className="level-btn" onClick={() => onLevelSelect('Expert')}>Expert</button>
        </div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LevelPopUp