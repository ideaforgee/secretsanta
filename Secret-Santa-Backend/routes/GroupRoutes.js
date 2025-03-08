const { request } = require("express");
router = express.Router();
const groupController = require('../controller/GroupController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/game/createGroup', protect, groupController.createGroup);

module.exports = router;