const db = require("../config/db.js");

const createNewMasterMindGame = async (userId, pattern) => {
  const query = `
      INSERT INTO masterMindGames (pattern, hostId, isActive)
      VALUES (?, ?, ?)
    `;

  try {
    const [result] = await db.query(query, [pattern, userId, 1]);
    return result.insertId;
  } catch (err) {
    throw new Error(err.message);
  }
};


const getUserMasterGameInfo = async (userId, masterMindGameId) => {
  try {
    const query = `CALL GetMasterMindGameDetails(?, ?)`;
    const [response] = await db.query(query, [userId, masterMindGameId]);
    return response[0] ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const getMasterMindGamePatternForUser = async (masterMindGameId) => {
  try {
    const query = 'SELECT pattern FROM masterMindGames WHERE id = ?';
    const [response] = await db.query(query, [masterMindGameId])
    return response[0] ?? null;
  } catch (error) {
    throw new Error(error.message);
  }
};

const saveUserMasterMindGameLevel = async (userId, gameId, level, guess, hint, isComplete) => {
  const query = `
      INSERT INTO userMasterMindGame (userId, masterMindGameId, level, guess, hint, isComplete)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  try {
    await db.query(query, [userId, gameId, level, guess, hint, isComplete]);
  } catch (err) {
    throw new Error(err.message);
  }
};

const setIsCompleteTrue = async (userId, masterMindGameId) => {
  const query = `
      UPDATE userMasterMindGame SET isComplete = 1
        where userId = ? AND masterMindGameId = ?
    `;

  try {
    await db.query(query, [userId, masterMindGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  createNewMasterMindGame,
  getUserMasterGameInfo,
  getMasterMindGamePatternForUser,
  saveUserMasterMindGameLevel,
  setIsCompleteTrue
};