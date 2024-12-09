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
const getUserSecretSantaWishlist = async (userId, gameId) => {
  try {
    const query = `
      SELECT wl.name AS wishName, wl.link
      FROM wishList wl
      WHERE wl.userId = ? AND wl.gameId = ?`;

    const [results] = await db.query(query, [userId, gameId]);
    return results ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
}

/**
 * Adds a wish to the user's Secret Santa wishlist for a given game.
 *
 * @param {string} userId - The unique ID of the user who is adding the wish.
 * @param {string} gameId - The unique ID of the game for which the wish is being added.
 * @param {Object} wish - The wish object containing `productName` and `productLink`.
 * @param {string} wish.productName - The name of the product being added to the wishlist.
 * @param {string} wish.productLink - The link to the product being added to the wishlist.
 * @returns {Promise} A promise indicating the success or failure of the operation.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const addWishToUserWishlist = async (userId, gameId, wish) => {
  try {
    const query = "INSERT INTO wishList (name, link, userId, gameId) VALUES (?, ?, ?, ?)";
    const values = [wish.productName, wish.productLink, userId, gameId];

    await db.query(query, values);
  } catch (err) {
    throw new Error(err.message);
  }
}

/**
 * Retrieves the wishlist for a specific user and game code by querying gift ninja data.
 *
 * @param {string} userId - The unique ID of the user whose wishlist is being retrieved.
 * @param {string} gameId - The unique ID of the game for which the wishlist is being retrieved.
 * @returns {Object|null} The wishlist data for the user or null if no wishlist is found.
 *
 * @throws {Error} If an error occurs during the database query.
 */
const getGiftNinjaWishlist = async (userId, gameId) => {
  try {
    const giftNinjaId = `
      SELECT ug.giftNinjaId FROM userGame ug
      WHERE userId = ?
      AND gameId = ?`;

    const [result] = await db.query(giftNinjaId, [userId, gameId]);
    const results = await getUserSecretSantaWishlist(result[0].giftNinjaId, gameId);
    return results ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getUserSecretSantaWishlist,
  addWishToUserWishlist,
  getGiftNinjaWishlist
};
