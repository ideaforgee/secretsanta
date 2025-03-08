import React from "react";
import "./TambolaTicket.css";

const demoTicket = [
  [10, 0, 25, 0, 45, 0, 60, 0, 80],
  [0, 12, 0, 34, 0, 56, 0, 78, 0],
  [5, 0, 23, 0, 44, 0, 67, 0, 90],
];

const TambolaTicket = ({ ticketData, markedNumbers, onNumberClick }) => {
  const isGameNotStarted = !ticketData[0]?.length;

  return (
    <div className="ticket-container">
        {/* Overlay Text Inside the Ticket */}
        {isGameNotStarted && <div className="ticket-overlay">Game is not started yet</div>}
      <div className={`tambola-ticket ${isGameNotStarted ? "blurred" : ""}`}>

        {(isGameNotStarted ? demoTicket : ticketData)?.map((row, rowIndex) => (
          <div key={rowIndex} className="ticket-row">
            {row?.map((num, colIndex) => (
              <div
                key={colIndex}
                className={`ticket-cell ${num !== 0 ? "clickable" : "empty"} ${
                  markedNumbers.includes(num) ? "marked" : ""
                }`}
                onClick={() => !isGameNotStarted && num !== 0 && onNumberClick(num)}
              >
                {num !== 0 ? num : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TambolaTicket;
