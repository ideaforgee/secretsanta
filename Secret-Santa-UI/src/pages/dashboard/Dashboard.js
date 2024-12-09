import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { IoIosCreate } from "react-icons/io";
import { CiViewList } from "react-icons/ci";
import { MdFollowTheSigns } from "react-icons/md";
import Navbar from '../../components/navbar/Navbar';
import HostGame from '../../components/HostGame/HostGame';
import CodeDialog from '../../components/CodeDialog/CodeDialog';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import { joinGameHandler, validateGameId } from '../../services/gameService.js';
import * as Constant from '../../constants/secretSantaConstants.js';
import { GAME_ID_KEY, USER_KEY } from '../../constants/appConstant.js';
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [openCreateGame, setOpenCreateGame] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [openJoinGame, setOpenJoinGame] = useState(false);
  const [buttonText, setButtonText] = useState(Constant.EMPTY);
  const [dialogTitle, setDialogTitle] = useState(Constant.EMPTY);
  const [onSubmitHandler, setOnSubmitHandler] = useState(() => { });
  const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });
  const userId = localStorage.getItem(USER_KEY);
  const gameId = localStorage.getItem(GAME_ID_KEY);

  useEffect(() => {
    checkAndValidateGameId();
  }, []);

  const checkAndValidateGameId = async () => {
    if (userId && gameId) {
      try {
        const response = await validateGameId(gameId);
        if (!response) {
          localStorage.removeItem(GAME_ID_KEY);
        }
      } catch (error) {
        throw (error);
      }
    }
  };

  const onClickCreateGame = () => {
    setResetForm(true);
    setOpenCreateGame(true);
  };
  const handleCloseCreateGame = () => {
    setResetForm(false);
    setOpenCreateGame(false);
  };

  const onClickJoinGame = () => {
    setResetForm(true);
    if (localStorage.getItem(GAME_ID_KEY)) {
      navigate(Constant.ROUTE_PATH.GAME);
    } else {
      setOnSubmitHandler(() => handleJoinGameSubmit);
      setButtonText(Constant.JOIN);
      setDialogTitle(Constant.JOIN_GAME);
      setOpenJoinGame(true);
    }
  };

  const onClickGameStatus = () => {
    setResetForm(true);
    if (localStorage.getItem(GAME_ID_KEY)) {
      navigate(Constant.ROUTE_PATH.GAME_STATUS);
    } else {
      setOnSubmitHandler(() => handleGameStatusSubmit);
      setDialogTitle(Constant.GAME_STATUS);
      setButtonText(Constant.GET);
      setOpenJoinGame(true);
    }
  };

  const handleJoinGameSubmit = async (gameCode) => {
    try {
      const response = await joinGameHandler(userId, gameCode);
      if (response) {
        return { gameId: response, path: Constant.ROUTE_PATH.GAME };
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGameStatusSubmit = async (gameCode) => {
    try {
      const response = await joinGameHandler(userId, gameCode);
      if (response) {
        return { gameId: response, path: Constant.ROUTE_PATH.GAME_STATUS };
      } else {
        setErrorPopUp({ message: Constant.POPUP_ERROR_MESSAGE, show: true });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCloseJoinGame = () => {
    setResetForm(false);
    setOpenJoinGame(false);
    navigate(Constant.ROUTE_PATH.DASHBOARD);
  };

  const closeErrorPopUp = () => {
    setErrorPopUp({ message: Constant.EMPTY, show: false });
  };

  return (
    <div style={Constant.BACKGROUND_STYLE} className='dashboard'>
      <div><Navbar /></div>
      <div className="dashboard-container">
        <button className="game-home-actions" onClick={onClickCreateGame}><IoIosCreate />Host Game</button>
        <button className="game-home-actions" onClick={onClickJoinGame}><MdFollowTheSigns />Enter Game</button>
        <button className="game-home-actions" onClick={onClickGameStatus}><CiViewList />Game Status</button>
      </div>
      <HostGame open={openCreateGame} onClose={handleCloseCreateGame} resetForm={resetForm}></HostGame>
      <CodeDialog
        open={openJoinGame}
        onClose={handleCloseJoinGame}
        buttonText={buttonText}
        dialogTitle={dialogTitle}
        onSubmit={onSubmitHandler}
        resetForm={resetForm}
      ></CodeDialog>

      <ErrorComponent
        message={errorPopUp.message}
        show={errorPopUp.show}
        onClose={closeErrorPopUp}
      ></ErrorComponent>
    </div>
  );
}

export default Dashboard;