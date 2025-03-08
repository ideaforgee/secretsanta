const response = require('../utils/response.js');
const message = require('../constant/SecretSantaMessages.js');
const groupService = require('../service/GroupService.js');
require("dotenv").config();

const createGroup = async (req, res) => {
  const { userId, groupName } = req.body;
  const result = await groupService.createGroup(userId, groupName);
  return response(res, result.status, message.SUCCESS, result.response);
};


module.exports = {
  createGroup
};