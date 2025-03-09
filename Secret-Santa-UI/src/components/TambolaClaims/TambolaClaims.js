import React from "react";
import "./TambolaClaims.css"; // Optional styling

const TambolaClaims = ({ isGameStarted, markedClaims = [], onClaimClick }) => {
  const claimTypes = ["Top Line", "Early Five", "Middle Line", "Bottom Line", "Full House"];

  return (
    <div className="tambola-claims">
      {claimTypes.map((claim) => {
        const isDisabled = !isGameStarted || markedClaims.includes(claim);
        return (
          <button
            key={claim}
            className={`claim-btn ${isDisabled ? "disabled" : ""}`}
            onClick={() => !isDisabled && onClaimClick(claim)}
            disabled={isDisabled} // Disable button
          >
            {claim}
          </button>
        );
      })}
    </div>
  );
};

export default TambolaClaims;
