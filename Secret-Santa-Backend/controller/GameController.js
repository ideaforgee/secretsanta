const gameService = require('../service/GameService.js');
const response = require('../utils/response.js');
const message = require('../constant/SecretSantaMessages.js');
require("dotenv").config();

/**
 * @api {POST} /api/game/createGame Create a New Game
 * @apiName CreateGame
 * @apiGroup Game
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to create a new game with the specified parameters.
 * The server will create a game record and return a success message along with the unique game ID and game details.
 *
 * @apiError (400) BadRequest The request is missing required fields or contains invalid values.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "gameName": "Santa",
 *   "startDate": "2024-11-24T00:00:00Z",
 *   "endDate": "2024-11-30T00:00:00Z",
 *   "userId": 1234,
 *   "maxPlayers": 20
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "message": "Game created successfully.",
 *   "game": {
 *     "gameCode": "M3U7EIND",
 *     "gameName": "Santa",
 *     "startDate": "2024-11-24T00:00:00Z",
 *     "endDate": "2024-11-30T00:00:00Z",
 *     "userId": 1234,
 *     "maxPlayers": 20
 *   }
 * }
 */

const createNewSecretSantaGame = async (req, res) => {
  const { userId, payload: gameInfo } = req.body;
  const result = await gameService.createSecretSantaNewGame(userId, gameInfo);
  return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {POST} /api/game/startGame/:gameCode Start Secret Santa Game
 * @apiName StartSecretSantaGame
 * @apiGroup Game
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to start a "Secret Santa" game with a specific game code. Upon successful execution, the game will begin and the server will return a message indicating that the Secret Santa assignments have been completed. The game code (`gameCode`) is used to identify the specific game instance to start.
 *
 * @apiParam {String} gameCode The unique code of the game. This is used to identify and start the specific game. (e.g., "XMAS2024")
 *
 * @apiSuccess {String} message Success message indicating that the Secret Santa assignments were completed successfully. (e.g., "Secret Santa assignments completed successfully!")
 *
 * @apiError (404) NotFound The game with the specified `gameCode` does not exist.
 * @apiError (400) BadRequest The game has already been started or the request is invalid.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "gameCode": "XMAS2024"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "message": "Secret Santa assignments completed successfully!"
 * }
 */

const startSecretSantaGame = async (req, res) => {
  const { gameId } = req.body;
  const result = await gameService.startSecretSantaGame(Number(gameId));
  return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {GET} /api/game/:gameCode Get Secret Santa Game Info
 * @apiName GetSecretSantaGameInfo
 * @apiGroup Game
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to retrieve detailed information about a "Secret Santa" game using its unique game code.
 *
 * @apiParam {String} gameCode The unique code of the game to retrieve information for. (e.g., "XMAS2024")
 *
 * @apiSuccess {Object} gameInfo The detailed information about the specified game.
 *
 * @apiError (404) NotFound The game with the specified `gameCode` does not exist.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "gameCode": "XMAS2024"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "gameInfo": {
 *     "gameCode": "XMAS2024",
 *     "gameName": "Santa Party",
 *     "startDate": "2024-11-24T00:00:00Z",
 *     "endDate": "2024-11-30T00:00:00Z",
 *     "players": [ ... ]
 *   }
 * }
 */

const getSecretSantaGameInfo = async (req, res) => {
  const { gameId } = req.params;
  const result = await gameService.getSecretSantaGameInfo(gameId);
  response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {POST} /api/game/joinUser Join a User to a Secret Santa Game
 * @apiName JoinUserToSecretSantaGame
 * @apiGroup Game
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to add a user to an existing Secret Santa game. The game code is used to identify the specific game, and the user ID is added to the game.
 *
 * @apiParam {String} userId The unique ID of the user joining the game.
 * @apiParam {String} gameCode The unique code of the game the user is joining. (e.g., "XMAS2024")
 *
 * @apiSuccess {String} message Success message indicating that the user successfully joined the game.
 *
 * @apiError (404) NotFound The game with the specified `gameCode` does not exist.
 * @apiError (400) BadRequest The user has already joined this game or the request is invalid.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "userId": 1234,
 *   "gameCode": "XMAS2024"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "message": "User successfully joined the game."
 * }
 */

const joinUserToSecretSantaGame = async (req, res) => {
  const { userId, gameCode } = req.body;
  const result = await gameService.joinUserToSecretSantaGame(userId, gameCode);
  return response(res, result.status, message.SUCCESS, result.response);
};

const getGameActiveStatus = async (req, res) => {
  const { gameId } = req.params;
  const result = await gameService.getGameActiveStatus(gameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {DELETE} /api/game/endGame/:gameId End Game
 * @apiName EndGame
 * @apiGroup Game
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to end a game and delete its associated data from the database. The `gameId` parameter is used to identify the specific game instance that needs to be ended. Upon successful execution, the server will return a success message confirming that the game has been ended and its data deleted.
 *
 * @apiParam {String} gameId The unique identifier of the game to be ended. (e.g., "12345")
 *
 * @apiSuccess {String} message Success message indicating that the game has been ended and data deleted successfully. (e.g., "Game ended and data deleted successfully!")
 *
 * @apiError (404) NotFound The game with the specified `gameId` does not exist.
 * @apiError (400) BadRequest The request is invalid or the game cannot be ended.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "gameId": "12345"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "message": "Game ended and data deleted successfully!"
 * }
 */

const endGame = async (req, res) => {
  const { gameId } = req.params;
  const result = await gameService.endGameAndDeleteData(gameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

const exitSecretSantaGame = async (req, res) => {
  const { gameId, userId } = req.body;
  const result = await gameService.exitSecretSantaGame(userId, gameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

const validateIfGameExist = async (req, res) => {
  const { gameId } = req.body;
  const result = await gameService.validateIfGameExist(gameId);
  return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
  createNewSecretSantaGame,
  startSecretSantaGame,
  getSecretSantaGameInfo,
  joinUserToSecretSantaGame,
  getGameActiveStatus,
  exitSecretSantaGame,
  endGame,
  validateIfGameExist
};
