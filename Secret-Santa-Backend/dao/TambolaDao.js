const db = require("../config/db.js");

/**
 * Saves a new Tambola game into the database.
 *
 * @param {string} userId - The ID of the user creating the game.
 * @param {string} code - The unique code for the Tambola game.
 * @returns {number} The ID of the newly created Tambola game.
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
 * Adds a user to a Tambola game based on the provided game code.
 *
 * @param {number} userId - The ID of the user to add to the game.
 * @param {string} gameCode - The unique code of the Tambola game.
 * @returns {Promise<number|null>} The ID of the Tambola game the user joined or null if the user is already in the game.
 *
 * @throws {Error} If an error occurs during the database query.
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

/**
 * Retrieves the list of users for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Array} An array of users participating in the game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const getUsersForTambolaGame = async (tambolaGameId) => {
  const query = ` 
    SELECT userId, name 
    FROM UserTambolaGame utg 
    INNER JOIN users ON users.id = utg.userId 
    WHERE tambolaGameId = ?
  `;

  try {
    const [users] = await db.query(query, [tambolaGameId]);
    return users;
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Saves a ticket for a specific user in a Tambola game.
 *
 * @param {Array} ticket - The ticket numbers for the user.
 * @param {number} userId - The ID of the user whose ticket is being saved.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const saveUserTicketForTambolaGame = async (ticket, userId, tambolaGameId) => {
  const query = `UPDATE UserTambolaGame SET ticketNumbers = ? WHERE userId = ? AND tambolaGameId = ?`;

  try {
    await db.query(query, [JSON.stringify(ticket), userId, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves the details of a specific Tambola game.
 *
 * @param {string} userId - The ID of the user requesting the game details.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The details of the Tambola game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const getTambolaGameDetails = async (userId, tambolaGameId) => {
  const query = `CALL GetTambolaGameDetails(?, ?)`;

  try {
    const [response] = await db.query(query, [userId, tambolaGameId]);
    return response[0] ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Saves the marked numbers of a specific user in a Tambola game.
 *
 * @param {string} userId - The ID of the user marking the numbers.
 * @param {Array} markedNumbers - The array of marked numbers.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const saveUserMarkedNumbers = async (userId, markedNumbers, tambolaGameId) => {
  const query = `UPDATE UserTambolaGame SET markedNumbers = ? WHERE userId = ? AND tambolaGameId = ?`;

  try {
    await db.query(query, [JSON.stringify(markedNumbers), userId, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Updates the drawn numbers for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @param {Array} withDrawnNumbers - The array of drawn numbers.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const updateTambolaWithDrawnNumbers = async (tambolaGameId, withDrawnNumbers) => {
  const query = `UPDATE TambolaGames SET withdrawnNumbers = ? WHERE id = ?`;

  try {
    await db.query(query, [JSON.stringify(withDrawnNumbers), tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves the user data (ticket numbers and marked numbers) for a specific Tambola game.
 *
 * @param {string} userId - The ID of the user.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The user's ticket and marked numbers.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const gatUserDataForTambolaGame = async (userId, tambolaGameId) => {
  const query = `SELECT ticketNumbers, markedNumbers FROM UserTambolaGame WHERE userId = ? AND tambolaGameId = ?`;

  try {
    const [response] = await db.query(query, [userId, tambolaGameId]);
    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves the game data (withdrawn numbers) for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The withdrawn numbers for the game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const gatTambolaGameData = async (tambolaGameId) => {
  const query = `SELECT withdrawnNumbers FROM TambolaGames WHERE id = ?`;

  try {
    const [response] = await db.query(query, [tambolaGameId]);
    return response;
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Updates the claims for a specific Tambola game based on the claim type.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @param {number} userId - The ID of the user making the claim.
 * @param {string} claimType - The type of claim being made (e.g., "firstClaim", "fullClaim").
 *
 * @throws {Error} If an error occurs during the database query.
 */
const updateTambolaGameClaims = async (tambolaGameId, userId, claimType) => {
  const query =
    `INSERT INTO TambolaGameClaims (tambolaGameId, ${claimType}, createdAt)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE ${claimType} =
    CASE
        WHEN ${claimType} IS NULL THEN VALUES(${claimType})
        ELSE ${claimType}
    END;`;

  try {
    await db.query(query, [Number(tambolaGameId), Number(userId)]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Updates the status of a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @param {string} status - The new status of the game (e.g., 'Active', 'Finished').
 *
 * @throws {Error} If an error occurs during the database query.
 */
const updateTambolaGameStatus = async (tambolaGameId, status) => {
  const query = `UPDATE TambolaGames SET status = ? WHERE id = ?`;

  try {
    await db.query(query, [status, tambolaGameId]);
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves all claims for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Array} A list of claims made for the game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const getAllClaimsForTambolaGame = async (tambolaGameId) => {
  const query = `SELECT * FROM TambolaGameClaims WHERE tambolaGameId = ?`;

  try {
    const [result] = await db.query(query, [tambolaGameId]);
    return result[0] ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Retrieves the list of users with their scores for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Array} A list of users and their scores in the game.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const gatGameUsersWithScore = async (tambolaGameId) => {
  const query = `
      SELECT u.name, utg.currentScore FROM UserTambolaGame utg 
      INNER JOIN users u ON utg.userId = u.id WHERE tambolaGameId = ?;
  `;

  try {
    const [result] = await db.query(query, [tambolaGameId]);
    return result ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * Updates the score of a user in a specific Tambola game.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @param {number} scoreChange - The change in score to be applied to the user.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const updateUserTambolaScore = async (userId, tambolaGameId, scoreChange) => {
  try {
    const query = `UPDATE UserTambolaGame SET currentScore = currentScore + ? WHERE userId = ? AND tambolaGameId = ?`;
    await db.query(query, [scoreChange, Number(userId), Number(tambolaGameId)]);
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
  updateTambolaGameStatus,
  getAllClaimsForTambolaGame,
  gatGameUsersWithScore,
  updateUserTambolaScore
};
