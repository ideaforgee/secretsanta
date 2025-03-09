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

const joinGroup = async (userId, groupCode) => {
  if(!userId || !groupCode) {
    return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
  }

  try {
    const result = await groupDao.joinGroup(userId, groupCode);
    return result
          ? commonService.createResponse(httpResponse.SUCCESS, result)
          : commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_GROUP_CODE);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.INVALID_GROUP_CODE);
  }
};

const getGroupMembersInfo = async (groupId) => {
  try {
    const [result] = await groupDao.getGroupMembersInfo(groupId);
    return commonService.createResponse(httpResponse.SUCCESS, result);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const announceGame = async (userId, gameAnnouncementInfo) => {
  try {
    const validationError = validateGameAnnouncementPayload(gameAnnouncementInfo);
    if(validationError) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, validationError);
    }
  
    const user = await userDao.getUserDetailsById(Number(userId));
  
    for(const recipient of gameAnnouncementInfo.emailData.recipients) {
      const recipientUser = await userDao.getUserDetailsById(Number(recipient));
      await emailService.sendEmail(recipientUser.email, gameAnnouncementInfo.emailData.subject, gameAnnouncementInfo.emailData.body);
    }

    return commonService.createResponse(httpResponse.SUCCESS, messages.CREATED_GAME_SUCCESSFULLY);
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
  }
};

const validateGameAnnouncementPayload = (payload) => {
  const { body, subject, recipients } = payload.emailData;

  if(!body || !subject || !recipients || !recipients.length) {
    return messages.GAME_ANNOUNCEMENT_PAYLOAD_FIELD_VALIDATION_ERROR;
  }

  return null;
};

module.exports = {
  createGroup,
  joinGroup,
  getGroupMembersInfo,
  announceGame
};