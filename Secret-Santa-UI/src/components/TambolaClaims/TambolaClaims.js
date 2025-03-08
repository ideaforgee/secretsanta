import React from "react";
import "./TambolaClaims.css"; // Optional styling

const TambolaClaims = ({ onClaimClick }) => {
  const claimTypes = ["Top Line", "Early Five", "Middle Line", "Bottom Line", "Full House"];

  return (
    <div className="tambola-claims">
      {claimTypes.map((claim) => (
        <button key={claim} className="claim-btn" onClick={() => onClaimClick(claim)}>
          {claim}
        </button>
      ))}
    </div>
  );
};

export default TambolaClaims;
