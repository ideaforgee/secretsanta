import React, { useState, useEffect } from "react";
import TambolaBoard from "../../components/TambolaBoard/TambolaBoard";
import TambolaTicket from "../../components/TambolaTicket/TambolaTicket";
import TambolaClaims from "../../components/TambolaClaims/TambolaClaims";
import Navbar from "../../components/navbar/Navbar";
import { generateTicketsForTambolaGame, getTambolaGameDetails } from "../../services/gameService";
import { connectWebSocket } from '../../websocket';
import { useNavigate } from 'react-router-dom';
import { BsCapslockFill } from "react-icons/bs";
import GameUserScoreBoard from '../../components/GameUserScoreBoard/GameUserScoreBoard';
import { USER_KEY, USER_NAME_KEY, TAMBOLA_GAME_KEY } from '../../constants/appConstant';
import * as Constant from '../../constants/secretSantaConstants';
import "./Tambola.css";
import { TambolaGameStatus } from "../../constants/TambolaConstants";
import Popup from "../../components/Popup/Popup";


const Tambola = () => {
  const [ws, setWs] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorPopUp, setErrorPopUp] = useState({ message: '', show: false });
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [hostId, setHostId] = useState(0);
  const [allWithDrawnNumbers, setAllWithDrawnNumbers] = useState([]);
  const [ticketNumbers, setTicketNumbers] = useState(Array(3).fill().map(() => []));
  const [markedClaims, setMarkedClaims] = useState([]);
  const [status, setStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [isCompletePopup, setIsCompletePopup] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem(USER_KEY);
  const userName = localStorage.getItem(USER_NAME_KEY);
  const tambolaGameId = localStorage.getItem(TAMBOLA_GAME_KEY);
  const MAX_RETRIES = 10;
  const RETRY_INTERVAL = 5000;

  useEffect(() => {
    const fetchData = async () => {
      if (!tambolaGameId || !userId) {
        navigate('/game-zone');
      }
      const tambolaGameDetails = await getTambolaGameDetails(userId, tambolaGameId);
      setMarkedNumbers(tambolaGameDetails.markedNumbers);
      setMarkedClaims(tambolaGameDetails.markedClaims);
      setHostId(tambolaGameDetails.hostId);
      setStatus(tambolaGameDetails.status);
      setAllWithDrawnNumbers(tambolaGameDetails.withdrawnNumbers);
      setTicketNumbers(tambolaGameDetails.ticketNumbers);

      if (tambolaGameDetails.status === 'Complete') {
        window.alert('This game has already completed');
        localStorage.removeItem(TAMBOLA_GAME_KEY);
        navigate('/game-zone');
      }

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
    if (messageData.type === 'claim' && messageData.claimType) {
      if (messageData.isValidClaim) {
        setMarkedClaims(messageData.markedClaims);
      }
      if (messageData.isComplete) {
        setIsCompletePopup(true);
      }
    }
    if (messageData.type === 'claim') {
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance(messageData.message?.toString());
        window.speechSynthesis.speak(msg);
      }
      setPopupMessage(messageData.message);
      setShowPopup(true);
    }

    if (messageData.type === 'withDrawnNumbers') {
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance(messageData.message?.toString());
        window.speechSynthesis.speak(msg);
      }
      const tambolaGameAllWithDrawnNumbers = [messageData.withDrawnNumbers, Number(messageData.message)];
      setAllWithDrawnNumbers(tambolaGameAllWithDrawnNumbers[0]);
      setPopupMessage(Number(messageData.message));
      setShowPopup(true);
    }
    if (messageData.type === 'startTambolaGame') {
      window.location.reload();
    }
  };

  const handleTicketNumberClick = (num) => {
    const newMarkedNumbers = markedNumbers.includes(num) ? markedNumbers.filter((n) => n !== num) : [...markedNumbers, num];
    setMarkedNumbers(newMarkedNumbers);
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.MARKED_NUMBERS, tambolaGameId: tambolaGameId, markedNumbers: newMarkedNumbers }));
    console.log("Clicked on ticket number:", num);
  };

  const handleStartGameClick = async () => {
    await generateTicketsForTambolaGame(tambolaGameId);
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.START_TAMBOLA_GAME, tambolaGameId: tambolaGameId }));
  };

  const handleDrawNumberClick = async () => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(num => !allWithDrawnNumbers.includes(num));

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];
    const tambolaGameAllWithDrawnNumbers = [...allWithDrawnNumbers, newNumber];
    setAllWithDrawnNumbers(tambolaGameAllWithDrawnNumbers);
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.WITH_DRAWN_NUMBERS, withDrawnNumbers: tambolaGameAllWithDrawnNumbers, tambolaGameId: tambolaGameId, currentNumber: newNumber }));
    setPopupMessage(newNumber);
    setShowPopup(true);
  };

  const handleClaimClick = (claimType) => {
    ws.send(JSON.stringify({ type: Constant.NOTIFICATION_TYPE.CLAIM, claimType: claimType, tambolaGameId: tambolaGameId, claimedBy: userName }));
    console.log("Claimed:", claimType);
  };

  const handleQuit = () => {
    localStorage.removeItem(TAMBOLA_GAME_KEY);
    navigate('/game-zone');
  };

  const handleCloseContinuePopup = () => {
    localStorage.removeItem(TAMBOLA_GAME_KEY);
    setIsCompletePopup(false);
    navigate('/game-zone');
  };

  return (
    <div className="tambola-parent-container">
      <div className="tambola-container">
        <div><Navbar title={'TAMBOLA'} /></div>

        <Popup message={popupMessage} visible={showPopup} onClose={() => setShowPopup(false)} />

        {/* Tambola Board */}
        <TambolaBoard drawnNumbers={allWithDrawnNumbers} />

        {/* Withdraw Button - Now between board and ticket */}
        {status === TambolaGameStatus.Active && allWithDrawnNumbers.length < 90 && hostId === Number(userId) && (
          <div className="withdraw-wrapper">
            <button className="withDrawn-button" onClick={handleDrawNumberClick}>
              <BsCapslockFill />
              With Draw
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="right-section">
          {/* Tambola Ticket */}
          <TambolaTicket ticketData={ticketNumbers} markedNumbers={markedNumbers} onNumberClick={handleTicketNumberClick} />

          {/* Claim Buttons */}
          <TambolaClaims onClaimClick={handleClaimClick} isGameStarted={status === TambolaGameStatus.Active} markedClaims={markedClaims} />

          {status === TambolaGameStatus.InActive && hostId === Number(userId) && (
            <button className="start-game-button" onClick={handleStartGameClick}>
              Start Game
            </button>
          )}
          <button className="start-game-button" onClick={handleQuit}>
            Exit Game
          </button>

          {isCompletePopup && (
            <GameUserScoreBoard
              onClose={() => {
                handleCloseContinuePopup();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

};
export default Tambola;
