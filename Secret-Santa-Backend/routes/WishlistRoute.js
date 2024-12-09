const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/WishlistController.js')
const { protect } = require('../middleware/authMiddleware.js');


router.get('/api/user/getMineWishlist', protect, wishlistController.getSecretSantaWishlist);
router.post('/api/user/addWishToMineWishList', protect, wishlistController.addWishToUserWishlist);
router.get('/api/user/giftNinjaWishlist', protect, wishlistController.getGiftNinjaWishlist);

module.exports = router;