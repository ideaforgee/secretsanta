const response = require('../utils/response.js');
const masterMindService = require('../service/MasterMindService.js');
const message = require('../constant/SecretSantaMessages.js');

const createNewMasterMindGame = async (req, res) => {
  const { userId, severity } = req.body;
  const result = await masterMindService.createNewMasterMindGame(userId, severity);
  return response(res, result.status, message.SUCCESS, result.response);
};

const getUserMasterGameInfo = async (req, res) => {
  const { userId, masterMindGameId } = req.body;
  const result = await masterMindService.getUserMasterGameInfo(userId, masterMindGameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

const validateUserMasterMindLevel = async (req, res) => {
  const { userId, masterMindGameId, level, guess } = req.body;
  const result = await masterMindService.validateUserMasterMindLevel(userId, masterMindGameId, level, guess);
  return response(res, result.status, message.SUCCESS, result.response);
};

const getRealPatternForMasterMindGame = async (req, res) => {
  const { masterMindGameId } = req.body;
  const result = await masterMindService.getRealPatternForMasterMindGame(masterMindGameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

const setIsCompleteTrue = async (req, res) => {
  const { userId, masterMindGameId } = req.body;
  const result = await masterMindService.setIsCompleteTrue(userId, masterMindGameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
  createNewMasterMindGame,
  getUserMasterGameInfo,
  validateUserMasterMindLevel,
  getRealPatternForMasterMindGame,
  setIsCompleteTrue
};