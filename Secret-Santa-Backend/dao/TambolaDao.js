const db = require("../config/db.js");

/**
 * Retrieves the Secret Santa wishlist for a specific user and game.
 *
 * @param {string} userId - The unique ID of the user whose wishlist is being retrieved.
 * @param {string} gameId - The unique ID of the game for which the wishlist is being retrieved.
 * @returns {Object|null} The wishlist data for the user or null if no wishlist is found.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const saveNewTambolaGame = async (userId, code) => {
  const query = `
      INSERT INTO TambolaGames (hostId, code, status)
      VALUES (?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [userId, code, 'InActive']);
    return result.insertId;
  } catch (err) {
    throw new Error(err.message);
  }
};


/**
 * Adds a user to a Tambola game based on the game code.
 *
 * @param {number} userId - The ID of the user to add to the game.
 * @param {string} gameCode - The unique code of the game.
 * @returns {Promise<void>} A promise that resolves when the user is successfully added to the game.
 *
 * @throws {Error} Throws an error if adding the user to the game fails.
*/
const joinUserToTambolaGame = async (userId, gameCode) => {
  try {
    const selectQuery = `
      SELECT utg.tambolaGameId
      FROM UserTambolaGame utg
      JOIN TambolaGames g ON utg.tambolaGameId = g.id
      WHERE utg.userId = ? AND g.code = ?
      LIMIT 1;
    `;

    const [existingGame] = await db.query(selectQuery, [userId, gameCode]);

    if (existingGame.length > 0) {
      return existingGame[0]?.tambolaGameId ?? null;
    }

    const insertQuery = `
      INSERT INTO UserTambolaGame (userId, tambolaGameId)
      SELECT ?, g.id
      FROM TambolaGames g
      WHERE g.code = ? AND g.status = 'InActive'
      LIMIT 1;
    `;

    await db.query(insertQuery, [userId, gameCode]);

    const [newGame] = await db.query(selectQuery, [userId, gameCode]);
    return newGame[0]?.tambolaGameId ?? null;

  } catch (err) {
    throw new Error(`Database Error: ${err.message}`);
  }
};

const getUsersForTambolaGame = async (tambolaGameId) => {
  const query = ` SELECT userId FROM UserTambolaGame WHERE tambolaGameId = ?`;

  try {
    const [users] = await db.query(query, [tambolaGameId]);
    return users;
  } catch (err) {
    throw new Error(err.message);
  }
};

const saveUserTicketForTambolaGame = async (ticket, userId, tambolaGameId) => {
  const query = `UPDATE UserTambolaGame SET ticketNumber = ? WHERE userId = ? AND tambolaGameId = ?`;

  try {
    await db.query(query, [JSON.stringify(ticket), userId, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

const getTambolaGameDetails = async (userId, tambolaGameId) => {
  const query = `CALL GetTambolaGameDetails(?, ?)`;

  try {
    const [response] = await db.query(query, [userId, tambolaGameId]);
    return response[0] ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};

const saveUserMarkedNumbers = async (userId, markedNUmbers, tambolaGameId) => {
  const query = `UPDATE UserTambolaGame SET markedNumbers = ? WHERE userId = ? AND tambolaGameId = ?`;

  try {
    await db.query(query, [JSON.stringify(markedNUmbers), userId, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateTambolaWithDrawnNumbers = async (tambolaGameId, withDrawnNumbers) => {
  const query = `UPDATE TambolaGames SET withdrawnNumbers = ? WHERE id = ?`;

  try {
    await db.query(query, [JSON.stringify(withDrawnNumbers), tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

const gatUserDataForTambolaGame = async (userId, tambolaGameId) => {
  const query = `SELECT ticketNumbers, markedNumbers FROM UserTambolaGame WHERE userId = ? AND tambolaGameId = ?`;

  try {
    const [response] = await db.query(query, [userId, tambolaGameId]);
    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

const gatTambolaGameData = async (tambolaGameId) => {
  const query = `SELECT withdrawnNumbers FROM TambolaGames WHERE id = ?`;

  try {
    const [response] = await db.query(query, [tambolaGameId]);
    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateTambolaGameClaims = async (tambolaGameId, userId) => {
  const query =
    `INSERT INTO TambolaGameClaims (tambolaGameId, ${claimType}, createdAt)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE ${claimType} =
     CASE
         WHEN ${claimType} IS NULL THEN VALUES(${claimType})
         ELSE ${claimType}
     END;`;

  try {
    await db.query(query, [tambolaGameId, userId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateTambolaGameStatus = async (tambolaGameId, status) => {
  const query = `UPDATE TambolaGames SET status = ? WHERE id = ?`;

  try {
    await db.query(query, [status, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  saveNewTambolaGame,
  joinUserToTambolaGame,
  getUsersForTambolaGame,
  saveUserTicketForTambolaGame,
  getTambolaGameDetails,
  updateTambolaWithDrawnNumbers,
  saveUserMarkedNumbers,
  gatUserDataForTambolaGame,
  gatTambolaGameData,
  updateTambolaGameClaims,
  updateTambolaGameStatus
};
