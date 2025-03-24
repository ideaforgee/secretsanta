import bgg from '../assets/bgg.jpg';
import fzg from '../assets/fzg.jpg';
import tbg from '../assets/tbg.jpg';
import buzzerbg from '../assets/buzzerbg.jpg';

export const CHAT_BOX_TYPE = {
    SECRET_SANTA: 'secretSanta',
    GIFT_NINJA: 'giftNinja',
    PUBLIC_CHAT: 'publicChat',
    ANONYMOUS_CHAT: 'anonymousChat'
  };

export const NOTIFICATION_TYPE = {
    MESSAGE: 'message',
    START_TAMBOLA_GAME: 'startTambolaGame',
    WITH_DRAWN_NUMBERS: 'withDrawnNumbers',
    MARKED_NUMBERS: 'markedNumbers',
    CLAIM: 'claim',
    PRESS_BUZZER: 'pressBuzzer',
    REACTIVE_BUZZER: 'reactiveBuzzer',
    GROUP_DISCUSSION_MESSAGE: 'groupDiscussionMessage'
};

export const BACKGROUND_STYLE = {
  backgroundImage: `url(${bgg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  width: '100%',
};

export const TAMBOLA_BACKGROUND_STYLE = {
  backgroundImage: `url(${tbg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  width: '100%',
};

export const BUZZER_BACKGROUND_STYLE = {
  backgroundImage: `url(${buzzerbg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  width: '100%',
};

export const FUN_ZONE_STYLE = {
  backgroundImage: `url(${fzg})`,
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
export const GAME_ASSIST = 'OK';
export const GAME_ASSIST_TITLE = 'GAME ASSIST';
export const GET = 'Get';
export const GAME_ASSIST_PLACEHOLDER_TEXT = 'Enter Group Code';

export const TALK_TO_USER = {
  SECRET_SANTA: 'Talk to My Secret Santa',
  GIFT_NINJA: 'Talk to My Gift Ninja',
  PUBLIC_CHAT: 'Public Chat',
  ANONYMOUS_CHAT: 'Anonymous Chat'
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
  FORGET_PASSWORD: '/forget-password',
  RESET_PASSWORD: '/reset-password',
  DEFAULT: '/',
  FUN_ZONE: '/fun-zone',
  GAME_ZONE: '/game-zone',
  GAME_ASSIST: '/game-assist',
  MASTER_MIND: '/master-mind',
  TAMBOLA: '/tambola',
  TEAMS: '/teams',
  BUZZER_TIMER: '/buzzer-timer',
  GROUP_DISCUSSION: '/group-discussion'
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
  RETURNED_TO_FUN_ZONE: 'Returned to fun zone',
  GROUP_CREATED: 'Group Created Successfully!',
  NO_RECIPIENTS_SELECTED: 'No recipients selected'
};

export const DIALOG_REASONS = {
  BACKDROP_CLICK: 'backdropClick',
};