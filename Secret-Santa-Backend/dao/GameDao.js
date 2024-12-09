const db = require("../config/db.js");
const { registerUserForSecretSanta } = require("../controller/authController.js");

/**
 * Saves a new game to the database.
 *
 * @param {Object} newGame - The new game details.
 * @param {string} newGame.gameName - The name of the game.
 * @param {string} newGame.gameCode - The unique game code.
 * @param {string} newGame.startDate - The start date of the game.
 * @param {string} newGame.endDate - The end date of the game.
 * @param {number} newGame.maxPlayers - The maximum number of players in the game.
 * @param {number} newGame.userId - The ID of the user who is hosting the game.
 * @returns {Promise<void>} A promise that resolves when the game is saved.
 *
 * @throws {Error} Throws an error if saving the game fails.
 */
const saveNewSecretSantaGame = async (newGame) => {
  const query = `
    INSERT INTO games (name, code, startDate, endDate, maxPlayer, hostId, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(query, [newGame.gameName, newGame.gameCode, newGame.startDate, newGame.endDate, newGame.maxPlayers, newGame.hostId, newGame.isActive]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Adds a new Secret Santa game to the database.
 *
 * @param {Object} gameInfo - The game details, including game name, start date, end date, max players, and the host user ID.
 * @param {string} gameInfo.gameName - The name of the game.
 * @param {string} gameInfo.startDate - The start date of the game.
 * @param {string} gameInfo.endDate - The end date of the game.
 * @param {number} gameInfo.maxPlayers - The maximum number of players in the game.
 * @param {number} gameInfo.userId - The ID of the user creating the game.
 * @param {string} gameInfo.gameCode - The unique code for the game.
 * @returns {Promise<Object>} A promise that resolves with a success message upon successfully creating the game.
 *
 * @throws {Error} Throws an error if adding the game fails.
 */
const addNewSecretSantaGame = async (gameInfo) => {
  const { gameName, startDate, endDate, maxPlayers, userId, gameCode } = gameInfo;
  const query =
    "INSERT INTO games (name, code, startDate, endDate, maxPlayer, hostId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [gameName, gameCode, startDate, endDate, maxPlayers, userId, 1];

  try {
    await db.query(query, values);
    return { message: "game created successfully." };
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves all users participating in a game by its game ID.
 *
 * @param {number} gameId - The ID of the game.
 * @returns {Promise<Array>} A promise that resolves to an array of user objects associated with the game.
 *
 * @throws {Error} Throws an error if retrieving the users fails.
 */
const getAllUsersForByGameId = async (gameId) => {
  const query = `
    SELECT users.id, users.name, users.email
    FROM userGame ug
    INNER JOIN users ON users.id = ug.userId
    WHERE ug.gameId = ?`;

  try {
    const [result] = await db.query(query, [gameId]);
    return result ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Updates the Secret Santa game when the game starts, assigning Secret Santa pairs to users.
 *
 * @param {number} gameId - The ID of the game.
 * @param {Array<Object>} inputData - The data for updating the user-game relationships, including the assigned Secret Santa.
 * @returns {Promise<void>} A promise that resolves when the game start process is completed.
 *
 * @throws {Error} Throws an error if updating the game fails.
 */
const updateSecretSantaGameOnGameStart = async (gameId, inputData) => {
  const query = `CALL UpdateUserGameOnGameStart(?, ?)`;

  try {
    await db.query(query, [gameId, JSON.stringify(inputData)]);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Adds a user to a Secret Santa game based on the game code.
 *
 * @param {number} userId - The ID of the user to add to the game.
 * @param {string} gameCode - The unique code of the game.
 * @returns {Promise<void>} A promise that resolves when the user is successfully added to the game.
 *
 * @throws {Error} Throws an error if adding the user to the game fails.
*/
const joinUserToSecretSantaGame = async (userId, gameCode) => {
  try {
    const query = `
    INSERT INTO userGame (userId, gameId)
    SELECT ?, g.id
    FROM games g
    WHERE g.code = ? and g.isActive = 0
    ON DUPLICATE KEY UPDATE
      gameId = VALUES(gameId)
    RETURNING gameId;
  `;

    const [result] = await db.query(query, [userId, gameCode]);
    return result[0]?.gameId ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};


/**
 * Retrieves the Secret Santa game information based on its game code.
 *
 * @param {string} gameCode - The unique code of the game.
 * @returns {Promise<Array>} A promise that resolves to an array of game information, including the game name, user names, and email addresses.
 *
 * @throws {Error} Throws an error if retrieving the game information fails.
 */
const getSecretSantaGameInfoByGameCode = async (gameId) => {
  try {
    const query = `
      SELECT g.name AS gameName, u.name AS userName, u.email, g.id, g.hostId
      FROM games g
      LEFT JOIN userGame ug ON g.id = ug.gameId
      LEFT JOIN users u ON ug.userId = u.id
      WHERE g.id = ?`;

    const results = await db.query(query, [gameId]);
    return results ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};

const getGameActiveStatus = async (gameId) => {
  try {
    const query = "SELECT isActive FROM games g WHERE g.id = ?";
    const [result] = await db.query(query, [gameId]);
    return result[0] ?? 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Ends a game and deletes its associated data from the database.
 *
 * @param {string} gameId - The unique identifier of the game to be deleted.
 * @returns {void} This function does not return a value.
 *
 * @throws {Error} Throws an error if the deletion process fails.
 */
const deleteAllGameRelatedData = async (gameId) => {
  try {
    const query = `CALL DeleteGameByGameId(?)`;
    await db.query(query, [gameId]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGameIdsForStartByScheduler = async () => {
  try {
    const query = `SELECT id FROM games WHERE isActive = 0 AND startDate = CURRENT_DATE()`;
    const [result] = await db.query(query);
    return result ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGameIdsForEndByScheduler = async () => {
  try {
    const query = `SELECT id FROM games WHERE isActive = 1 AND endDate = CURRENT_DATE()`;
    const [result] = await db.query(query);
    return result ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const exitSecretSantaGame = async (userId, gameId) => {
  try {
    const query = `
      DELETE userGame
      FROM userGame
      INNER JOIN games ON games.id = userGame.gameId
      WHERE userGame.userId = ? AND userGame.gameId = ? AND games.isActive = 0
    `;
    await db.query(query, [userId, gameId]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const validateIfGameExist = async (gameId) => {
  try {
    const query = `SELECT COUNT(*) as count FROM games WHERE id = ?`;
    const [result] = await db.query(query, [gameId]);
    return result[0].count > 0 ? true : false;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  saveNewSecretSantaGame,
  addNewSecretSantaGame,
  getAllUsersForByGameId,
  updateSecretSantaGameOnGameStart,
  getSecretSantaGameInfoByGameCode,
  joinUserToSecretSantaGame,
  saveNewSecretSantaGame,
  getGameActiveStatus,
  deleteAllGameRelatedData,
  getGameIdsForStartByScheduler,
  exitSecretSantaGame,
  validateIfGameExist,
  getGameIdsForEndByScheduler
};
