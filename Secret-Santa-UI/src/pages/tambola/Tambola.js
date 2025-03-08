import React, { useState, useEffect } from "react";
import TambolaBoard from "../../components/TambolaBoard/TambolaBoard";
import TambolaTicket from "../../components/TambolaTicket/TambolaTicket";
import TambolaClaims from "../../components/TambolaClaims/TambolaClaims";
import { generateTicketsForTambolaGame, getTambolaGameDetails } from "../../services/gameService";
import { connectWebSocket } from '../../websocket';
import { USER_KEY } from '../../constants/appConstant';
import * as Constant from '../../constants/secretSantaConstants';
import "./Tambola.css";
import { TambolaGameStatus } from "../../constants/TambolaConstants";


const Tambola = () => {
  const [ws, setWs] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [hostId, setHostId] = useState(0);
  const [withDrawnNumbers, setWithDrawnNumbers] = useState([]);
  const [ticketNumbers, setTicketNumbers] = useState(Array(3).fill().map(() => []));
  const [markedClaims, setMarkedClaims] = useState([]);
  const [status, setStatus] = useState('');

  const userId = localStorage.getItem(USER_KEY);
  //const tambolaGameId = localStorage.getItem(TAMBOLA_GAME_KEY);
  const MAX_RETRIES = 10;
  const RETRY_INTERVAL = 5000;
  const tambolaGameId = 1;

  useEffect(() => {
    const fetchData = async () => {
      const tambolaGameDetails = await getTambolaGameDetails(userId, tambolaGameId);
      setMarkedNumbers(tambolaGameDetails.markedNumbers ?? []);
      setMarkedClaims(tambolaGameDetails.markedClaims ?? []);
      setHostId(tambolaGameDetails.hostId);
      setStatus(tambolaGameDetails.status);
      setWithDrawnNumbers(tambolaGameDetails.withdrawnNumbers ?? []);
      setTicketNumbers(tambolaGameDetails.markedNumbers ?? []);

      if (userId) {
        initializeWebSocket();
      }

      return () => {
        if (ws) {
          console.log('Closing WebSocket connection...');
          ws.close();
        }
      };
    };
    fetchData();
  }, [userId]);

  const initializeWebSocket = () => {
    const websocket = connectWebSocket(userId, handleWebSocketMessage);

    websocket.onclose = () => {
      console.log('WebSocket connection closed. Retrying...');
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          initializeWebSocket();
        }, RETRY_INTERVAL);
      } else {
        console.error('Max WebSocket reconnection attempts reached.');
        setErrorPopUp({ message: 'Connection lost. Please refresh the page.', show: true });
      }
    };

    websocket.onopen = () => {
      console.log('WebSocket connection established.');
      setRetryCount(0);
    };

    setWs(websocket);
  };

  const handleWebSocketMessage = (messageData) => {
    if(messageData.type === 'claim' && messageData.claimType) {
      setMarkedClaims(markedClaims.forEach(claim => claim !== messageData.claimType));
    }
    if(messageData.type === 'withDrawnNumbers') {
      const allWithDrawnNumbers = [...withDrawnNumbers, Number(messageData.message)];
      setWithDrawnNumbers(allWithDrawnNumbers);
    }
    // show popup with messageData.message;
  };

  const handleTicketNumberClick = (num) => {
    const newMarkedNumbers = markedNumbers.includes(num) ? markedNumbers.filter((n) => n !== num) : [...markedNumbers, num];
    setMarkedNumbers(newMarkedNumbers);
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.MARKED_NUMBERS, tambolaGameId: tambolaGameId, markedNumbers: newMarkedNumbers }));
    console.log("Clicked on ticket number:", num);
  };

  const handleStartGameClick = async () => {
    await generateTicketsForTambolaGame(tambolaGameId);
  };

  const handleDrawNumberClick = async () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(num => !withDrawnNumbers.includes(num));

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];
    const allWithDrawnNumbers = [...withDrawnNumbers, newNumber];
    setWithDrawnNumbers(allWithDrawnNumbers);
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.WITH_DRAWN_NUMBERS, withDrawnNumbers: withDrawnNumbers, tambolaGameId: tambolaGameId, currentNumber: newNumber }));
  };

  const handleClaimClick = (claimType) => {
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.CLAIM, claimType: claimType, tambolaGameId: tambolaGameId }));
    console.log("Claimed:", claimType);
  };

  return (
    <div className="tambola-parent-container">
      <div className="tambola-container">
        {/* Tambola Board */}
        <TambolaBoard drawnNumbers={withDrawnNumbers} />

        {/* Right Section */}
        <div className="right-section">
          {/* Tambola Ticket */}
          <TambolaTicket ticketData={ticketNumbers} markedNumbers={markedNumbers} onNumberClick={handleTicketNumberClick} />

          {/* Claim Buttons */}
          <TambolaClaims onClaimClick={handleClaimClick} isGameStarted={status === TambolaGameStatus.Active} disabledClaims={markedClaims} />

          {status === TambolaGameStatus.InActive && hostId === userId && (
            <button className="start-game-button" onClick={handleStartGameClick}>
              Start Game
            </button>
          )}

          {status === TambolaGameStatus.Active && hostId === userId && (
            <button className="start-game-button" onClick={handleDrawNumberClick}>
              Draw Number
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
export default Tambola;
