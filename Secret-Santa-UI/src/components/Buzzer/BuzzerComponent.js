import React, { useState } from "react";
import { USER_NAME_KEY } from '../../constants/appConstant';
import "./BuzzerComponent.css";

const BuzzerComponent = ({ onBuzzerPress, isBuzzerActive }) => {
  const userName = localStorage.getItem(USER_NAME_KEY);

  const handleBuzzerClick = () => {
    if (!isBuzzerActive) return;

    onBuzzerPress(userName);
  };

  return (
    <div className="buzzer-container">
      <div
        className={`buzzer ${!isBuzzerActive ? "buzzed" : ""}`}
        onClick={handleBuzzerClick}
      >
        <div className="buzzer-top">
          {!isBuzzerActive ? "BUZZED" : "BUZZ"}
        </div>
      </div>
    </div>
  );
};

export default BuzzerComponent;
