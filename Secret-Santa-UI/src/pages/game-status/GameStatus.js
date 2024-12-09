import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStopCircle, FaPlay } from 'react-icons/fa';
import { ImExit } from 'react-icons/im';
import LockIcon from '@mui/icons-material/Lock';
import { useAlert } from '../../context/AlertContext.js';
import * as gameService from '../../services/gameService.js';
import * as Constant from '../../constants/secretSantaConstants.js';
import { USER_KEY, GAME_ID_KEY } from '../../constants/appConstant.js';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import Navbar from '../../components/navbar/Navbar.js';
import './GameStatus.css';

function GameStatus() {
  const [rows, setRows] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });

  const userId = localStorage.getItem(USER_KEY);
  const gameId = localStorage.getItem(GAME_ID_KEY);

  useEffect(() => {
    if (userId) {
      getGameInfo(gameId);
      isActive();
    }
  }, [userId]);

  const isActive = async () => {
    try {
      const response = await gameService.isGameActiveHandler(gameId);
      setIsGameActive(response.isActive === 1 ? true : false);
      return response;
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const startSecretSantaGame = async () => {
    try {
      await gameService.startGame(gameId);
      window.location.reload();
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const endSecretSantaGame = async () => {
    try {
      await gameService.endGame(gameId);
      localStorage.removeItem(GAME_ID_KEY)
      navigate(Constant.ROUTE_PATH.DASHBOARD);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const getGameInfo = async (gameId) => {
    try {
      const response = await gameService.getGameUsers(gameId);
      if (response !== Constant.EMPTY) {
        const filteredResponse = response.map(({ gameName, userName, email }) => ({
          gameName,
          userName,
          email
        }));
        setRows(filteredResponse);
      } else {
        setRows([]);
      }
      return response;
    } catch (error) {
      showAlert(error, Constant.ERROR);
    }
  };

  const onClickExitGame = async () => {
    try {
      await gameService.exitGame(userId, gameId);
      navigate(Constant.ROUTE_PATH.DASHBOARD);
      localStorage.removeItem(GAME_ID_KEY)
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const closeErrorPopUp = () => {
    setErrorPopUp({ message: Constant.EMPTY, show: false });
  }

  const PlayerList = ({ players }) => {
    return (
      <div className='status' >
        <div className='status-body'>
          <div className='game-box'>
            <div className='game-head'>
              <div className='game-heading'>
                <strong>🎅 {rows[0]?.gameName} 🎁</strong>
              </div>
            </div>
          </div>
          <div className='player-box'>
            <div className='player-item'>
              <div className='player-shape'>
                <div className='game-heading'>
                  <strong>Players</strong>
                </div>

              </div>
            </div>
          </div>
          <div className='fixed'>

            {players.map((player, index) => (
              <div className='list-item-box'>
                <div className='list-item' key={index}>
                  <div className='player-number'>{index + 1}</div>
                  <div className='player-name'>
                    <strong>{player.userName}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='player-box' style={{ marginTop: '5px' }}>
            <div className='player-item'>
              <div className='player-shape'>
                <div className='game-heading'>
                  <strong>Total: {rows?.length}</strong>
                </div>

              </div>
            </div>
          </div>
          <div className='game-action-container'>
            <button className='game-actions' style={{ width: '252px', filter: !isGameActive ? 'blur(2px)' : 'none' }} onClick={endSecretSantaGame} disabled={!isGameActive}>
              {isGameActive ? <FaStopCircle /> : <LockIcon />}
              End Game
            </button>
            <button className='game-actions' style={{ width: '252px', filter: isGameActive ? 'blur(2px)' : 'none' }} onClick={startSecretSantaGame} disabled={isGameActive}>
              {!isGameActive ? <FaPlay /> : <LockIcon />}
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={Constant.BACKGROUND_STYLE} >
      <div>
        <Navbar />
        <PlayerList players={rows} />
        <button className='exit-game-button' style={{ filter: isGameActive ? 'blur(2px)' : 'none' }} onClick={onClickExitGame} disabled={isGameActive}>
        {!isGameActive ? <ImExit /> : <LockIcon />}
          Exit Game
        </button>
      </div>
      <ErrorComponent
        message={errorPopUp.message}
        show={errorPopUp.show}
        onClose={closeErrorPopUp}
      ></ErrorComponent>
    </div>
  );
}

export default GameStatus;