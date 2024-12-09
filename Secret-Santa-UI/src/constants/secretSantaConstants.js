import secretSantaTheme from '../assets/secretSantaTheme.jpg';
import sdf from '../assets/sdf.jpg';
import bgg from '../assets/bgg.jpg';

export const CHAT_BOX_TYPE = {
    SECRET_SANTA: 'secretSanta',
    GIFT_NINJA: 'giftNinja'
  };

export const NOTIFICATION_TYPE = {
    MESSAGE: 'message'
};

export const BACKGROUND_STYLE = {
  backgroundImage: `url(${bgg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  width: '100%',
};

export const ERROR = 'error';
export const SUCCESS = 'success';
export const EMPTY = '';
export const JOIN_GAME = 'Join Game';
export const GAME_STATUS = 'Game Status';
export const JOIN = 'Join';
export const GET = 'Get';

export const TALK_TO_USER = {
  SECRET_SANTA: 'Talk to My Secret Santa',
  GIFT_NINJA: 'Talk to My Gift Ninja'
}

export const REQUEST_ERROR_MESSAGE = 'An error occurred while processing the request';
export const POPUP_ERROR_MESSAGE = 'Something unexpected happened. Please contact your administrator';
export const LOGOUT_CONFIRM_MESSAGE = 'Are you sure you want to log out?';
export const LOADING_CONTEXT_ERROR = 'Use Loading must be used within a LoadingProvider';

// path constants
export const ROUTE_PATH = {
  DASHBOARD: '/secret-santa',
  GAME_STATUS: '/game-status',
  CHAT: '/chat',
  WISHLIST: '/wishlist',
  GAME: '/game',
  LOGIN: '/login',
  REGISTER: '/register',
  DEFAULT: '/'
}

export const ALERT_MESSAGES = {
  NOT_LOGGED_IN: 'User is not logged in. Please log in to host a game.',
  REQUIRED_FIELDS: 'Please fill in all required fields',
  INVALID_START_DATE: 'Start date must be tomorrow or later',
  INVALID_END_DATE: 'End date must be after the start date',
  INVALID_MAX_PLAYERS: 'Maximum members cannot be less than 2',
  GAME_HOSTED: 'Game hosted!',
  SUCCESSFULLY_JOINED: 'Joined Game Successfully!',
  INVALID_CODE: 'Enter a valid Game Code',
  GAME_NOT_CREATED: 'Game is not created.',
  SUCCESSFULLY_ADDED: 'Wish added to wishlist!',
};

export const DIALOG_REASONS = {
  BACKDROP_CLICK: 'backdropClick',
};