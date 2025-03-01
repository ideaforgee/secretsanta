const db = require('../config/db.js');
const userDao = require('../dao/UserDao.js');
const gameDao = require('../dao/GameDao.js');
const messages = require('../constant/SecretSantaMessages.js');
const emailService = require('../service/EmailService.js');
const httpResponse = require('../HttpResponse.js');
const encryptDecryptService = require('../service/EncryptionAndDecryptionService');
const commonService = require('../service/CommonService');
const EasyOrMediumColorMap = require('../constant/MasterMindConstants.js')
const HardOrExpertColorMap = require('../constant/MasterMindConstants.js')

/**
 * Creates a new Secret Santa game.
 *
 * @param {number} userId - The ID of the user creating the game.
 * @param {Object} gameInfo - The game details, including game name, start date, end date, and max players.
 * @returns {Object} The response indicating the result of the game creation process.
 *
 * @throws {Error} Throws an error if the game creation fails.
 */
const createSecretSantaNewGame = async (userId, gameInfo) => {
  try {
    const validationError = validateGamePayload(gameInfo);
    if (validationError) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, validationError);
    }

    const user = await userDao.getUserDetailsById(Number(userId));
    const newGame = generateNewGame(user, gameInfo);

    await gameDao.saveNewSecretSantaGame(newGame);
    await emailService.sendCreatedSecretSantaGameEmail(user, newGame.gameCode);

    return commonService.createResponse(httpResponse.SUCCESS, messages.CREATED_GAME_SUCCESSFULLY);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Validates the provided game information to ensure it is complete and valid.
 *
 * @param {Object} payload - The game details to be validated.
 * @returns {string|null} Returns an error message if validation fails, otherwise returns null.
 */
const validateGamePayload = (payload) => {
  const { gameName, startDate, endDate, maxPlayers } = payload;

  if (!gameName || !startDate || !endDate || !maxPlayers) {
    return messages.GAME_PAYLOAD_FIELD_VALIDATION_ERROR;
  }
  if (new Date(startDate) >= new Date(endDate)) {
    return messages.GAME_PAYLOAD_DATE_VALIDATION_ERROR;
  }
  if (maxPlayers < 2) {
    return messages.GAME_PAYLOAD_PLAYER_VALIDATION_ERROR;
  }
  return null;
};

/**
 * Generates a new Secret Santa game object with a unique game code.
 *
 * @param {Object} user - The user creating the game.
 * @param {Object} gameInfo - The game details.
 * @returns {Object} The newly generated game object.
 */
const generateNewGame = (user, gameInfo) => {
  const gameCode = generateUniqueGameCode(user.name);

  return {
    gameName: gameInfo.gameName,
    gameCode: gameCode,
    startDate: gameInfo.startDate,
    endDate: gameInfo.endDate,
    maxPlayers: gameInfo.maxPlayers,
    hostId: user.id,
    isActive: 0
  };
};

/**
 * Generates a unique game code based on the host's name and the current timestamp.
 *
 * @param {string} hostName - The name of the game host.
 * @returns {string} The unique game code.
 */
const generateUniqueGameCode = (hostName) => {
  const timestamp = Date.now().toString(36);
  const userPart = hostName.slice(0, 2);
  return (userPart + timestamp).slice(0, 8).toUpperCase();
};

/**
 * Starts the Secret Santa game and assigns Secret Santa to each participant.
 *
 * @param {number} gameId - The ID of the game to start.
 * @returns {Object} The response indicating the result of starting the game.
 *
 * @throws {Error} Throws an error if the game start process fails.
 */
const startSecretSantaGame = async (gameId) => {
  try {
    const users = await gameDao.getAllUsersForByGameId(gameId);

    if (!gameId || users.length < 2) {
      return commonService.createResponse(httpResponse.UNPROCESSABLE, messages.NOT_ENOUGH_PARTICIPANTS);
    }

    const result = await gameDao.getGameActiveStatus(gameId);

    if (result.isActive) {
      return commonService.createResponse(httpResponse.UNPROCESSABLE, messages.GAME_ALREADY_STARTED);
    }

    const shuffledUsers = shuffleAndAssignSecretSanta(users);
    const inputData = getDataForUpdateUserGame(shuffledUsers);

    await gameDao.updateSecretSantaGameOnGameStart(gameId, inputData);
    await emailService.sendAssignedSecretSantaEmail(shuffledUsers);

    return commonService.createResponse(httpResponse.SUCCESS, messages.ASSIGNED_SECRET_SANTA_SUCCESSFULLY);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Shuffles the list of users and assigns a Secret Santa to each user.
 *
 * @param {Array<Object>} users - The list of users to be shuffled and assigned Secret Santa.
 * @returns {Array<Object>} The list of users with their assigned Secret Santa.
 */
const shuffleAndAssignSecretSanta = (users) => {
  const shuffledUsers = shuffleArray([...users]);
  return shuffledUsers.map((user, index) => {
    const assignedIndex = (index + 1) % shuffledUsers.length;
    return {
      ...user,
      secretSanta: shuffledUsers[assignedIndex],
    };
  });
};

/**
 * Shuffles an array randomly.
 *
 * @param {Array} array - The array to be shuffled.
 * @returns {Array} The shuffled array.
 */
const shuffleArray = (array) => {
  for (let index = array.length - 1; index > 0; index--) {
    const j = Math.floor(Math.random() * (index + 1));
    [array[index], array[j]] = [array[j], array[index]];
  }
  return array;
};

/**
 * Prepares data for updating the user-game relationships based on Secret Santa assignments.
 *
 * @param {Array<Object>} assignedUsers - The list of users with their assigned Secret Santa.
 * @returns {Array<Object>} The data to update user-game relationships.
 */
const getDataForUpdateUserGame = (assignedUsers) => {
  return assignedUsers.map((user, index) => {
    const giftNinjaIndex = (index - 1 + assignedUsers.length) % assignedUsers.length;
    return {
      id: user.id,
      secretSantaId: encryptDecryptService.encrypt(user.secretSanta?.id),
      giftNinjaId: encryptDecryptService.encrypt(assignedUsers[giftNinjaIndex].id),
    };
  });
};

/**
 * Retrieves information about a Secret Santa game based on its game code.
 *
 * @param {string} gameId - The unique code of the game.
 * @returns {Object} The information about the game, including the game name, user names, and email addresses.
 *
 * @throws {Error} Throws an error if the game information retrieval fails.
 */
const getSecretSantaGameInfo = async (gameId) => {
  try {
    const [result] = await gameDao.getSecretSantaGameInfoByGameCode(Number(gameId));
    return commonService.createResponse(httpResponse.SUCCESS, result);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getGameActiveStatus = async (gameId) => {
  try {
    const result = await gameDao.getGameActiveStatus(gameId);
    return commonService.createResponse(httpResponse.SUCCESS, result);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};


/**
 * Adds a user to a Secret Santa game.
 *
 * @param {number} userId - The ID of the user to be added to the game.
 * @param {string} gameCode - The unique code of the game.
 * @returns {Object} The response indicating the result of joining the game.
 *
 * @throws {Error} Throws an error if the user could not join the game.
 */
const joinUserToSecretSantaGame = async (userId, gameCode) => {
  if (!userId || !gameCode) {
    return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
  }

  try {
    const result = await gameDao.joinUserToSecretSantaGame(Number(userId), gameCode);
    return result
      ? commonService.createResponse(httpResponse.SUCCESS, result)
      : commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_GAME_CODE);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.INVALID_GAME_CODE);
  }
};

/**
 * Ends a game and deletes all associated data from the database.
 *
 * @param {string} gameId - The unique identifier of the game to be deleted.
 * @returns {Object} The response object containing the status and result of the operation.
 *
 * @throws {Error} Throws an error if the deletion process fails.
 */
const endGameAndDeleteData = async (gameId) => {
  try {
    // const result = await gameDao.deleteAllGameRelatedData(gameId);
    // return commonService.createResponse(httpResponse.SUCCESS, result);
    await gameDao.setGameAsInActive(gameId);
    return commonService.createResponse(httpResponse.SUCCESS, messages.GAME_ENDED_SUCCESSFULLY);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const exitSecretSantaGame = async (userId, gameId) => {
  try {
    await gameDao.exitSecretSantaGame(Number(userId), Number(gameId));
    return commonService.createResponse(httpResponse.SUCCESS, messages.EXIT_GAME_SUCCESSFULLY);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const validateIfGameExist = async (gameId) => {
  try {
    const result = await gameDao.validateIfGameExist(Number(gameId));
    return commonService.createResponse(httpResponse.SUCCESS, result);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const createNewMasterMindGame = async (userId, severity) => {
  try {
    const masterMindGamePattern = generateMasterMindGamePattern(severity);
    const masterMindGameId = await gameDao.createNewMasterMindGame(userId, masterMindGamePattern);
    return commonService.createResponse(httpResponse.SUCCESS, masterMindGameId);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const generateMasterMindGamePattern = (severity) => {
  const allColors = severity === 'Easy' || severity === 'Medium' ? EasyOrMediumColorMap : HardOrExpertColorMap;
  const shuffledKeys = Object.keys(allColors).sort(() => Math.random() - 0.5);
  let numbers;
  if (severity === 'Easy') {
    numbers = shuffledKeys.slice(0, 4).map(Number);
  } else {
    numbers = Array.from({ length: 4 }, () => Number(shuffledKeys[Math.floor(Math.random() * shuffledKeys.length)]));
  }
  return numbers?.join(',');
}


const getUserMasterGameInfo = async (userId, masterMindGameId) => {
  try {
    const response = await gameDao.getUserMasterGameInfo(userId, masterMindGameId);
    const userMasterGameInfo = processMasterMindData(response);
    return commonService.createResponse(httpResponse.SUCCESS, userMasterGameInfo);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const processMasterMindData = (rows) => {
  const levels = Array(8).fill().map(() => Array(4).fill(null));
  const hints = Array(8).fill().map(() => []);
  let maxLevel = -1;
  let gameComplete = false;

  rows.forEach(({ level, guess, hint, isComplete }) => {
    if (level >= 0 && level < 10) {
      levels[level] = guess ? guess.split(",").map(Number) : Array(4).fill(null);
      hints[level] = hint ? hint.split(",") : [];

      maxLevel = Math.max(maxLevel, level);
      if (isComplete === 1) {
        gameComplete = true;
      }
    }
  });

  const currentLevel = maxLevel + 1 < 8 ? maxLevel + 1 : 7;
  const verifiedLevels = Array.from({ length: currentLevel }, (_, i) => i);

  return { levels, hints, currentLevel, verifiedLevels, gameComplete };
};

const getRealPatternForMasterMindGame = async (masterMindGameId) => {
  try {
    const response = await gameDao.getMasterMindGamePatternForUser(masterMindGameId);
    return commonService.createResponse(httpResponse.SUCCESS, response.pattern);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};


const validateUserMasterMindLevel = async (userId, masterMindGameId, level, guess) => {
  try {
    const response = await gameDao.getMasterMindGamePatternForUser(masterMindGameId);
    const hint = getHintForUserMasterMindGameGuess(guess, response.pattern);
    const userGuess = guess?.join(',');
    let isComplete = 0;
    if (hint === 'red,red,red,red') {
      isComplete = 1;
    }
    await gameDao.saveUserMasterMindGameLevel(Number(userId), Number(masterMindGameId), level, userGuess, hint, isComplete);
    return commonService.createResponse(httpResponse.SUCCESS, hint);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

function getRedHintCount(guess, actualPattern) {
  let redCount = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === actualPattern[i]) {
      redCount++;
    }
  }
  return redCount;
}

function getWhiteHintCount(guess, actualPattern) {
  let whiteCount = 0;
  const remainingColors = {};

  for (let i = 0; i < 4; i++) {
    if (guess[i] !== actualPattern[i]) {
      remainingColors[actualPattern[i]] = (remainingColors[actualPattern[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < 4; i++) {
    if (guess[i] !== actualPattern[i] && remainingColors[guess[i]] > 0) {
      whiteCount++;
      remainingColors[guess[i]]--;
    }
  }

  return whiteCount;
}

function getHintForUserMasterMindGameGuess(guess, actualPattern) {
  const guessArray = guess.map(Number);
  const patternArray = actualPattern.split(",").map(Number);

  const redCount = getRedHintCount(guessArray, patternArray);
  const whiteCount = getWhiteHintCount(guessArray, patternArray);

  const hints = Array(redCount).fill("red").concat(Array(whiteCount).fill("white"));
  return hints?.join(',');
}


const setIsCompleteTrue = async (userId, masterMindGameId) => {
  await gameDao.setIsCompleteTrue(userId, masterMindGameId);
  return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_COMPLETED);
}

module.exports = {
  createSecretSantaNewGame,
  startSecretSantaGame,
  getSecretSantaGameInfo,
  joinUserToSecretSantaGame,
  getGameActiveStatus,
  exitSecretSantaGame,
  endGameAndDeleteData,
  validateIfGameExist,
  createNewMasterMindGame,
  getUserMasterGameInfo,
  validateUserMasterMindLevel,
  getRealPatternForMasterMindGame,
  setIsCompleteTrue
};
