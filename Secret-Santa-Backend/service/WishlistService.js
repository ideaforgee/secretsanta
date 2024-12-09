const wishListDao = require('../dao/WishlistDao.js');
const commonService = require('../service/CommonService.js');
const httpResponse = require('../HttpResponse.js');
const message = require('../constant/SecretSantaMessages.js');

/**
 * Retrieves the Secret Santa wishlist for a given user and game.
 *
 * @param {string} userId - The unique ID of the user whose wishlist is being retrieved.
 * @param {string} gameId - The unique ID of the game for which the wishlist is being retrieved.
 * @returns {Object} The response containing the result or an error message.
 *
 * @throws {Error} If an error occurs while fetching the wishlist.
 */
async function getUserSecretSantaWishlist(userId, gameId) {
  if (!userId || !gameId) {
    return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
  }

  try {
    const result = await wishListDao.getUserSecretSantaWishlist(Number(userId), Number(gameId));
    return commonService.createResponse(httpResponse.SUCCESS, [result]);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * Adds a wish to the user's Secret Santa wishlist for a given game.
 *
 * @param {string} userId - The unique ID of the user who is adding the wish.
 * @param {string} gameId - The unique ID of the game for which the wish is being added.
 * @param {string} wish - The wish that the user is adding to the wishlist.
 * @returns {Object} The response containing a success message or an error message.
 *
 * @throws {Error} If an error occurs while adding the wish to the wishlist.
 */
async function addWishToUserWishlist(userId, gameId, wish) {
  if (!userId || !gameId || !wish) {
    return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
  }

  try {
    await wishListDao.addWishToUserWishlist(userId, gameId, wish);
    return commonService.createResponse(httpResponse.SUCCESS, message.WISH_ADDED_SUCCESSFULLY);
  } catch (err) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, err.message);
  }
}

/**
 * Retrieves the wishlist for a specific user and game code.
 *
 * @param {string} userId - The unique ID of the user whose wishlist is being retrieved.
 * @param {string} gameId - The unique code of the game for which the wishlist is being retrieved.
 * @returns {Object} The response containing the wishlist data or an error message.
 *
 * @throws {Error} If an error occurs while fetching the wishlist.
 */
async function getGiftNinjaWishlist(userId, gameId) {
  if (!userId || !gameId) {
    return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
  }

  try {
    const result = await wishListDao.getGiftNinjaWishlist(userId, gameId);
    return commonService.createResponse(httpResponse.SUCCESS, [result]);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
}

module.exports = { getUserSecretSantaWishlist, addWishToUserWishlist, getGiftNinjaWishlist };
