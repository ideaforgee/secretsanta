import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { IoMdChatboxes } from "react-icons/io";
import LockIcon from '@mui/icons-material/Lock';
import { MdCameraswitch } from "react-icons/md";
import Navbar from '../../components/navbar/Navbar';
import ErrorComponent from "../../components/Error/ErrorComponent.js";
import { isGameActiveHandler } from '../../services/gameService.js';
import * as Constant from '../../constants/secretSantaConstants.js';
import { GAME_ID_KEY } from '../../constants/appConstant.js';
import "../dashboard/Dashboard.css";

function GamePlay() {
  const navigate = useNavigate();
  const gameId = localStorage.getItem(GAME_ID_KEY);
  const [isGameActive, setIsGameActive] = useState(false);
  const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });

  useEffect(() => {
    if (!gameId) {
      navigate(Constant.ROUTE_PATH.DASHBOARD);
    }
    isActive();
  }, [gameId, navigate]);

  const isActive = async () => {
    try {
      const response = await isGameActiveHandler(gameId);
      setIsGameActive(response?.isActive === 1 ? true : false);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const onClickGoToWishlist = () => {
    navigate(Constant.ROUTE_PATH.WISHLIST);
  };

  const onClickChatRoom = () => {
    navigate(Constant.ROUTE_PATH.CHAT);
  };

  const onClickSwitchGame = () => {
    try {
      localStorage.removeItem(GAME_ID_KEY);
      navigate(Constant.ROUTE_PATH.DASHBOARD);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const closeErrorPopUp = () => {
    setErrorPopUp({ message: Constant.EMPTY, show: false });
  }

  return (
    <div style={Constant.BACKGROUND_STYLE} className='dashboard'>
      <div><Navbar /></div>
      <div className="dashboard-container">
        <button className="game-actions" style={{ width: '252px' }} onClick={onClickGoToWishlist}><FaCartShopping />Go To Wishlist</button>
        <button className="game-actions" style={{ width: '252px', filter: !isGameActive ? 'blur(2px)' : 'none', }} onClick={onClickChatRoom} disabled={!isGameActive}>
          {isGameActive ? <IoMdChatboxes /> : <LockIcon />}
          Go To Chat Room</button>
        <button className="game-actions" style={{ width: '252px' }} onClick={onClickSwitchGame}><MdCameraswitch />Switch Game</button>
      </div>
      <ErrorComponent
        message={errorPopUp.message}
        show={errorPopUp.show}
        onClose={closeErrorPopUp}
      ></ErrorComponent>
    </div>

  );
}

export default GamePlay;