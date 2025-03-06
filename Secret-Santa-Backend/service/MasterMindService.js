const httpResponse = require('../HttpResponse.js');
const masterMindDao = require('../dao/MasterMindDao.js');
const commonService = require('../service/CommonService');
const EasyOrMediumColorMap = require('../constant/MasterMindConstants.js')
const HardOrExpertColorMap = require('../constant/MasterMindConstants.js')

const createNewMasterMindGame = async (userId, severity) => {
  try {
    const masterMindGamePattern = generateMasterMindGamePattern(severity);
    const masterMindGameId = await masterMindDao.createNewMasterMindGame(userId, masterMindGamePattern);
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
    const response = await masterMindDao.getUserMasterGameInfo(userId, masterMindGameId);
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
    const hint = getHintForUserMasterMindGameGuess(guess, response.pattern);
    const userGuess = guess?.join(',');
    let isComplete = 0;
    if (hint === 'red,red,red,red') {
      isComplete = 1;
    }
    await masterMindDao.saveUserMasterMindGameLevel(Number(userId), Number(masterMindGameId), level, userGuess, hint, isComplete);
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