const httpResponse = require('../HttpResponse.js');
const emailService = require('./EmailService.js');
const secretSantaService = require('./SecretSantaService.js');
const userDao = require('../dao/UserDao.js');
const groupDao = require('../dao/GroupDao.js');
const commonService = require('./CommonService.js');
const messages = require('../constant/SecretSantaMessages.js');

const createGroup = async (userId, groupName) => {
  if (!userId || !groupName) {
    return res.status(400).json({ error: "userId and groupName are required" });
  }
  try {
    const user = await userDao.getUserDetailsById(Number(userId));
    const groupCode = secretSantaService.generateUniqueGameCode(groupName);

    await groupDao.createGroup(groupName, groupCode, user.id);
    await emailService.sendCreatedGroupEmail(user, groupCode, groupName);

    return commonService.createResponse(
      httpResponse.CREATED,
      messages.GROUP_CREATED_SUCCESSFULLY
    );
  } catch (error) {
    return commonService.createResponse(
      httpResponse.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = {
  createGroup,
};