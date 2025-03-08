import React from "react";
import "./TambolaTicket.css";

const TambolaTicket = ({ ticketData, onNumberClick }) => {
  return (
    <div className="tambola-ticket">
      {ticketData.map((row, rowIndex) => (
        <div key={rowIndex} className="ticket-row">
          {row.map((num, colIndex) => (
            <div
              key={colIndex}
              className={`ticket-cell ${num ? "filled" : "empty"}`}
              onClick={() => num && onNumberClick(num)} // Only clickable if num is present
            >
              {num || ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TambolaTicket;
