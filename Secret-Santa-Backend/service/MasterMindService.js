const httpResponse = require('../HttpResponse.js');
const masterMindDao = require('../dao/MasterMindDao.js');
const commonService = require('../service/CommonService');
const messages = require('../constant/SecretSantaMessages.js');

const createNewMasterMindGame = async (userId, severity) => {
  try {
    const masterMindGamePattern = await generateMasterMindGamePattern(severity);
    const masterMindGameId = await masterMindDao.createNewMasterMindGame(userId, masterMindGamePattern, severity);
    return commonService.createResponse(httpResponse.SUCCESS, masterMindGameId);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const generateMasterMindGamePattern = async (severity) => {
  const gameConfig = await masterMindDao.getGameConfig(severity);
  const colorArray = await masterMindDao.getMasterMindGameColors(gameConfig.totalColors);
  const allColors = Object.fromEntries(
    colorArray.map(({ id, name }) => [id, name])
);
  const shuffledKeys = Object.keys(allColors).sort(() => Math.random() - 0.5);
  let numbers;
  if (severity === 'Basic') {
    numbers = shuffledKeys.slice(0, gameConfig.totalGusses).map(Number);
  } else {
    numbers = Array.from({ length: gameConfig.totalGusses }, () => Number(shuffledKeys[Math.floor(Math.random() * shuffledKeys.length)]));
  }
  return numbers?.join(',') ;
}


const getUserMasterGameInfo = async (userId, masterMindGameId) => {
  try {
    const response = await masterMindDao.getUserMasterGameInfo(userId, masterMindGameId);
    const gameInfo = response[0];
    const gameConfig = response[1];
    const userMasterGameInfo = await processMasterMindData(gameInfo, gameConfig);
    return commonService.createResponse(httpResponse.SUCCESS, userMasterGameInfo);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const processMasterMindData = async (gameInfo, gameConfig) => {
  const totalLevels = gameConfig[0]?.totalLevels;
  const totalGusses = gameConfig[0]?.totalGusses;
  const colorArray = await masterMindDao.getMasterMindGameColors(gameConfig[0]?.totalColors);
  const allColors = Object.fromEntries(
    colorArray.map(({ id, name }) => [id, name])
);
  const levels = Array(totalLevels).fill().map(() => Array(totalGusses).fill(null));
  const hints = Array(totalLevels).fill().map(() => []);
  let maxLevel = -1;
  let gameComplete = false;

  gameInfo.forEach(({ level, guess, hint, isComplete }) => {

    levels[level] = guess ? guess.split(",").map(Number) : Array(totalGusses).fill(null);
    hints[level] = hint ? hint.split(",") : [];

    maxLevel = Math.max(maxLevel, level);
    if (isComplete === 1) {
      gameComplete = true;
    }

  });

  const currentLevel = maxLevel + 1 < totalLevels + 1 ? maxLevel + 1 : totalLevels;
  const verifiedLevels = Array.from({ length: currentLevel }, (_, i) => i);

  return { levels, hints, currentLevel, verifiedLevels, gameComplete, totalLevels, totalGusses, allColors };
};

const getRealPatternForMasterMindGame = async (masterMindGameId) => {
  try {
    const response = await masterMindDao.getMasterMindGamePatternForUser(masterMindGameId);
    return commonService.createResponse(httpResponse.SUCCESS, response.pattern);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};


const validateUserMasterMindLevel = async (userId, masterMindGameId, level, guess) => {
  try {
    const response = await masterMindDao.getMasterMindGamePatternForUser(masterMindGameId);
    const hints = getHintForUserMasterMindGameGuess(guess, response.pattern);
    let isComplete = 0;
    if (hints.length === guess.length && hints.every(h=> 'red')) {
      isComplete = 1;
    }
    const hint = hints?.join(',');
    const userGuess = guess?.join(',');
    await masterMindDao.saveUserMasterMindGameLevel(Number(userId), Number(masterMindGameId), level, userGuess, hint, isComplete);
    return commonService.createResponse(httpResponse.SUCCESS, hint);
  }
  catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

function getRedHintCount(guess, actualPattern) {
  let redCount = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === actualPattern[i]) {
      redCount++;
    }
  }
  return redCount;
}

function getWhiteHintCount(guess, actualPattern) {
  let whiteCount = 0;
  const remainingColors = {};

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== actualPattern[i]) {
      remainingColors[actualPattern[i]] = (remainingColors[actualPattern[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < guess.length; i++) {
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

  return Array(redCount).fill("red").concat(Array(whiteCount).fill("white"));
}


const setIsCompleteTrue = async (userId, masterMindGameId) => {
  await masterMindDao.setIsCompleteTrue(userId, masterMindGameId);
  return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_COMPLETED);
}

module.exports = {
  createNewMasterMindGame,
  getUserMasterGameInfo,
  validateUserMasterMindLevel,
  getRealPatternForMasterMindGame,
  setIsCompleteTrue
}