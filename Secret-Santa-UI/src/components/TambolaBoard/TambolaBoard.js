import React from "react";
import "./TambolaBoard.css"; // Import separate CSS for board styling

const TambolaBoard = ({ drawnNumbers }) => {
  return (
    <div className="tambola-board">
      {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => (
        <div
          key={num}
          className={`number ${drawnNumbers.includes(num) ? "called" : ""}`}
        >
          {num}
        </div>
      ))}
    </div>
  );
};

export default TambolaBoard;
