import React, { useState } from "react";
import TambolaBoard from "../../components/TambolaBoard/TambolaBoard";
import TambolaTicket from "../../components/TambolaTicket/TambolaTicket";
import TambolaClaims from "../../components/TambolaClaims/TambolaClaims";
import "./Tambola.css";

const Tambola = () => {
    const [calledNumbers, setCalledNumbers] = useState(new Set());

    const handleNumberClick = (num) => {
      setCalledNumbers((prev) => new Set(prev).add(num));
    };

    const drawnNumbers = [6,3,43,5,4,32,34,64,36];

    const sampleTicket = [
        [0, 12, 0, 45, 0, 0, 67, 0, 89],
        [5, 0, 23, 0, 44, 56, 0, 78, 0],
        [0, 18, 0, 0, 41, 0, 60, 0, 90]
    ];

    const handleTicketNumberClick = (num) => {
        console.log("Clicked on ticket number:", num);
    };

    const handleClaimClick = (claimType) => {
        console.log("Claimed:", claimType);
    };
  
    return (
      <div className="tambola-container">
        {/* Tambola Board */}
        <TambolaBoard drawnNumbers={drawnNumbers} />
  
        {/* Right Section */}
        <div className="right-section">
          {/* Tambola Ticket */}
          <TambolaTicket ticketData={sampleTicket} onNumberClick={handleTicketNumberClick}/>
  
          {/* Claim Buttons */}
          <TambolaClaims onClaimClick={handleClaimClick} />
        </div>
      </div>
    );
};
export default Tambola;
