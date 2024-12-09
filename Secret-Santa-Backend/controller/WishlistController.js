const wishlistService = require('../service/WishlistService.js');
const message = require('../constant/SecretSantaMessages.js');
const response = require('../utils/response.js');

/**
 * @api {GET} /api/wishlist/secretSanta/:gameId Get Secret Santa Wishlist for a User
 * @apiName GetSecretSantaWishlist
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to retrieve the Secret Santa wishlist for a specific user and game.
 * The server will return the list of wishes for the user in the game.
 *
 * @apiParam {String} gameId The unique code of the game. (e.g., "XMAS2024")
 *
 * @apiSuccess {Array} wishlist List of wishes for the user.
 *
 * @apiError (404) NotFound The wishlist for the specified user and game was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "gameId": "XMAS2024"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "wishlist": [
 *     { "wish": "Toy Car", "userId": 1234 },
 *     { "wish": "Socks", "userId": 5678 }
 *   ]
 * }
 */
const getSecretSantaWishlist = async (req, res) => {
  const { userId, gameId } = req.query;
  const result = await wishlistService.getUserSecretSantaWishlist(userId, gameId);
  response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {POST} /api/wishlist/addWish Add a Wish to User Wishlist
 * @apiName AddWishToUserWishlist
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to add a new wish to a user's wishlist for a specific game.
 * The user must specify their userId, gameId, and the wish to be added.
 *
 * @apiParam {String} userId The unique ID of the user adding the wish.
 * @apiParam {String} gameId The unique code of the game the wish is being added to. (e.g., "XMAS2024")
 * @apiParam {Object} payload The wish details to be added to the user's wishlist.
 *
 * @apiSuccess {String} message Success message indicating that the wish was added to the wishlist.
 *
 * @apiError (400) BadRequest The request is missing required fields or contains invalid values.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "userId": 1234,
 *   "gameId": "XMAS2024",
 *   "payload": { "wish": "Toy Car" }
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "message": "Wish added successfully."
 * }
 */
const addWishToUserWishlist = async (req, res) => {
  const { userId, gameId } = req.body;
  const wish = { productLink: req.body?.productLink, productName: req.body?.productName };
  const result = await wishlistService.addWishToUserWishlist(Number(userId), gameId, wish);
  response(res, result.status, message.SUCCESS, result.response);
};

/**
 * @api {GET} /api/wishlist/:userId/:gameId Get Wishlist for User by Game Code
 * @apiName GetWishlistByUserAndGameCode
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint is used to retrieve a user's wishlist for a specific game using their userId and the gameId.
 *
 * @apiParam {String} userId The unique ID of the user whose wishlist is being retrieved.
 * @apiParam {String} gameId The unique code of the game for which the wishlist is being retrieved.
 *
 * @apiSuccess {Array} wishlist The user's wishlist for the specified game.
 *
 * @apiError (404) NotFound The wishlist for the specified user and game was not found.
 * @apiError (500) InternalServerError An unexpected error occurred on the server.
 *
 * @apiExample {json} Request Example:
 * {
 *   "userId": 1234,
 *   "gameId": "XMAS2024"
 * }
 *
 * @apiExample {json} Response Example:
 * {
 *   "wishlist": [
 *     { "wish": "Toy Car", "userId": 1234 }
 *   ]
 * }
 */
const getGiftNinjaWishlist = async (req, res) => {
  const { userId, gameId } = req.query;
  const result = await wishlistService.getGiftNinjaWishlist(Number(userId), Number(gameId));
  response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
  getSecretSantaWishlist,
  addWishToUserWishlist,
  getGiftNinjaWishlist
};
