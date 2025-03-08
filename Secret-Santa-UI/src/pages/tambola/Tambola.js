import React, { useState, useEffect } from "react";
import TambolaBoard from "../../components/TambolaBoard/TambolaBoard";
import TambolaTicket from "../../components/TambolaTicket/TambolaTicket";
import TambolaClaims from "../../components/TambolaClaims/TambolaClaims";
import { generateTicketsForTambolaGame, getTabmolaGameDetais } from "../../services/gameService";
import { connectWebSocket } from '../../websocket';
import { USER_KEY } from '../../constants/appConstant';
import * as Constant from '../../constants/secretSantaConstants';
import "./Tambola.css";
import { TambolaGameStatus } from "../../constants/TambolaConstants";


const Tambola = () => {
  const [calledNumbers, setCalledNumbers] = useState(new Set());
  const [userId, setUserId] = useState(localStorage.getItem(USER_KEY))
  const [ws, setWs] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [hostId, setHostId] = useState([0]);
  const [withDrawnNumbers, setWithDrawnNumbers] = useState([]);
  const [ticketNumbers, setTicketNumbers] =  useState(Array(3).fill().map(() => []));
  const [markedClaims, setMarkedClaims] = useState([]);
  const [status, setStatus] = useState('');

  const drawnNumbers = [6, 3, 43, 5, 4, 32, 34, 64, 36];
  const sampleClaims = ["Top Line", "Early Five"];

  const markedNumberTest = [12,56];

  const sampleTicket = [
    [0, 12, 0, 45, 0, 0, 67, 0, 89],
    [5, 0, 23, 0, 44, 56, 0, 78, 0],
    [0, 18, 0, 0, 41, 0, 60, 0, 90]
  ];

  const MAX_RETRIES = 10;
  const RETRY_INTERVAL = 5000;
  const tambolaGameId = 1;

  useEffect(() => {
    // const tambolaGameDetails = await getTabmolaGameDetais(userId, tambolaGameId);
    setMarkedNumbers(markedNumberTest);
    setMarkedClaims(sampleClaims);
    setHostId('63');
    setStatus(TambolaGameStatus.Active);
    setWithDrawnNumbers(drawnNumbers);
    setTicketNumbers(sampleTicket);

    if (userId) {
      initializeWebSocket();
    }

    return () => {
      if (ws) {
        console.log('Closing WebSocket connection...');
        ws.close();
      }
    };
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

    const handleWebSocketMessage = (withDrawnData) => {
        if (withDrawnData.type !== Constant.NOTIFICATION_TYPE.WITH_DRAW_DATA) return;
    };

    const handleNumberClick = (num) => {
        setCalledNumbers((prev) => new Set(prev).add(num));
    };



    const onWithDrawnNumbers = (number) => {
        ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.WITH_DRAWN_NUMBERS, currentNumber: number, withDrawnNumbers: drawnNumbers }));
    }

    const handleTicketNumberClick = (num) => {
        setMarkedNumbers((prev) =>
            prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
        );
        // ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.MARKED_NUMBERS, markedNumbers: markedNumbers }));
        console.log("Clicked on ticket number:", num);
    };

    const handleStartGameClick = async () => {
      const res = await generateTicketsForTambolaGame(tambolaGameId);
    };

    const handleDrawNumberclick = async () => {
      const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      const availableNumbers = allNumbers.filter(num => !withDrawnNumbers.includes(num));

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const newNumber = availableNumbers[randomIndex];
      setWithDrawnNumbers([...withDrawnNumbers, newNumber]);
    };

  const handleClaimClick = (claimType) => {
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.CLAIM, claimType: claimType, markedNumbers: markedNumbers }));
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
              <TambolaClaims onClaimClick={handleClaimClick} isGameStarted= {status === TambolaGameStatus.Active} disabledClaims= {markedClaims}/>

              {status === TambolaGameStatus.InActive && hostId === userId && (
                <button className="start-game-button" onClick={handleStartGameClick}>
                  Start Game
                </button>
              )}

              {status === TambolaGameStatus.Active && hostId === userId && (
                <button className="start-game-button" onClick={handleDrawNumberclick}>
                  Draw Number
                </button>
              )}

                </div>
          </div>
     </div>
  );
};
export default Tambola;
