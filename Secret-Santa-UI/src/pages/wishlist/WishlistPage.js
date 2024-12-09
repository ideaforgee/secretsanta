import React, { useEffect, useState } from 'react';
import QueueIcon from '@mui/icons-material/Queue';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LockIcon from '@mui/icons-material/Lock';
import Button from '@mui/material/Button';
import { IoGameController } from 'react-icons/io5';
import { getMineWishlist, getGiftNinjaWishList } from '../../services/wishlistService.js';
import { isGameActiveHandler } from '../../services/gameService.js';
import AddWishlist from '../../components/AddWishlist/AddWishlist.js';
import ErrorComponent from '../../components/Error/ErrorComponent.js';
import secretSantaTheme from '../../assets/secretSantaTheme.jpg';
import { useNavigate } from 'react-router-dom';
import { USER_KEY, GAME_ID_KEY } from '../../constants/appConstant.js';
import * as Constant from '../../constants/secretSantaConstants.js';
import './WishlistPage.css';

function WishlistPage() {
  const [myWishlist, setMyWishlist] = useState([]);
  const [giftNinjaWishlist, setGiftNinjaWishlist] = useState([]);
  const [openAddWishlist, setOpenAddWishlist] = useState(false);
  const [resetAddWishlistForm, setResetAddWishlistForm] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGiftNinjaView, setIsGiftNinjaView] = useState(false);
  const navigate = useNavigate();
  const [errorPopUp, setErrorPopUp] = useState({ message: Constant.EMPTY, show: false });

  const userId = localStorage.getItem(USER_KEY);
  const gameId = localStorage.getItem(GAME_ID_KEY);

  const handleOnClickAddNewWishlist = () => {
    setOpenAddWishlist(true);
    setResetAddWishlistForm(true);
  };

  const handleCloseAddWishlist = () => {
    setResetAddWishlistForm(false);
    setOpenAddWishlist(false);
  };

  const isActive = async () => {
    try {
      const response = await isGameActiveHandler(gameId);
      setIsGameActive(response?.isActive === 1 ? true : false);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const getWishlist = async (userId, gameId) => {
    try {
      const response = await getMineWishlist(userId, gameId);
      setMyWishlist(response[0]?.length ? response[0] : []);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const getGiftNinjaWishlist = async () => {
    try {
      const response = await getGiftNinjaWishList(userId, gameId);
      setGiftNinjaWishlist(response[0]?.length ? response[0] : []);
    } catch (error) {
      setErrorPopUp({ message: error ? error : Constant.POPUP_ERROR_MESSAGE, show: true });
    }
  };

  const closeErrorPopUp = () => {
    setErrorPopUp({ message: Constant.EMPTY, show: false });
  }


  useEffect(() => {
    if (userId) {
      getWishlist(userId, gameId);
      getGiftNinjaWishlist();
      isActive();
    }
  }, [userId]);

  const Wishlist = ({ wishList }) => {
    return (
      <div className='list-body'>
        <div className='game-box'>
          <div className='game-head'>
            <div className='game-heading'>
              {!isGiftNinjaView ? (<strong>🎅  Mine  🎁</strong>) : (<strong>🎅  Ninja  🎁</strong>)}
            </div>
          </div>
        </div>
        <div className='player-box'>
          <div className='player-item'>
            <div className='player-shape'>
              <div className='game-heading'>
                <strong>WishList</strong>
              </div>
            </div>
          </div>
        </div>
        <div className='fixed'>
          {wishList.map((item, index) => (
            <div className='list-item-box' key={index}>
              <div className='list-item'>
                <div className='player-number'>{index + 1}</div>
                <div className='player-name'>
                  <strong>{item.wishName}</strong>
                  <a href={item.link} target='_blank' rel='noopener noreferrer'>
                    <OpenInNewIcon />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {wishList.length ? (
          <div className='player-box' style={{ marginTop: '5px' }}>
            <div className='player-item'>
              <div className='player-shape'>
                <div className='game-heading'>
                  <strong>Total: {wishList.length}</strong>
                </div>
              </div>
            </div>
          </div>) : (<div></div>)
        }


      </div>
    );
  };

  const backgroundStyle = {
    backgroundImage: `url(${secretSantaTheme})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100%',
    paddingTop: '1rem',
  };

  return (
    <div style={Constant.BACKGROUND_STYLE} className='wishlist-container'>
      <div className='go-to-game-icon' onClick={() => navigate(Constant.ROUTE_PATH.GAME)}>
        <IoGameController />
      </div>
      <div className='action-container'>
        <Button
          className='custom-button'
          variant='contained'
          style={{ backgroundColor: 'var(--primary-button-color)', color: 'var(--primary-text-color)', width: '250px', border: '1px solid', fontWeight: '600' }}
          onClick={() => { setIsGiftNinjaView(false); }}
        >
          My Wishlist
        </Button>
        <Button
          className='custom-button'
          variant='contained'
          style={{ backgroundColor: 'var(--primary-button-color)', color: 'var(--primary-text-color)', width: '250px', fontWeight: '600', border: '1px solid', filter: !isGameActive ? 'blur(1px)' : 'none', }}
          onClick={() => { setIsGiftNinjaView(true); }}
          disabled={!isGameActive}
        >
          {!isGameActive ? <LockIcon /> : ''}
          Ninja Wishlist
        </Button>
      </div>

      {isGiftNinjaView ? (
        <Wishlist wishList={giftNinjaWishlist} />
      ) : (
        <div className='list-container'>
          <Wishlist wishList={myWishlist} />
          <Button
            className='custom-button'
            variant='outlined'
            style={{ backgroundColor: 'var(--primary-button-color)', color: 'var(--primary-text-color)', fontWeight: '600', width: '250px', marginTop: '15px', border: '1px solid' }}
            onClick={handleOnClickAddNewWishlist}
          >
            <QueueIcon style={{ marginRight: '10px' }} /> Add New Wish
          </Button>
        </div>
      )}

      <AddWishlist
        open={openAddWishlist}
        onClose={handleCloseAddWishlist}
        resetForm={resetAddWishlistForm}
        refreshWishlist={() => getWishlist(userId, gameId)}
      />
      <ErrorComponent
        message={errorPopUp.message}
        show={errorPopUp.show}
        onClose={closeErrorPopUp}
      ></ErrorComponent>
    </div>
  );
}

export default WishlistPage;
