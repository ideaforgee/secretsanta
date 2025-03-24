const response = require('../utils/response.js');
const message = require('../constant/SecretSantaMessages.js');
const groupService = require('../service/GroupService.js');
require("dotenv").config();

const createGroup = async (req, res) => {
  const { userId, groupData } = req.body.payload;
  const result = await groupService.createGroup(userId, groupData.groupName);
  return response(res, result.status, message.SUCCESS, result.response);
};

const joinGroup = async (req, res) => {
  const { userId, groupCode } = req.body.payload;
  const result = await groupService.joinGroup(userId, groupCode);
  return response(res, result.status, message.SUCCESS, result.response);
}

const getGroupMembersInfo = async (req, res) => {
  const { groupId } = req.params;
  const result = await groupService.getGroupMembersInfo(groupId);
  return response(res, result.status, message.SUCCESS, result.response);
};

const announceGame = async (req, res) => {
  const { userId, emailData } = req.body.payload;
  const gameAnnouncementInfo = { emailData };
  const result = await groupService.announceGame(userId, gameAnnouncementInfo);
  return response(res, result.status, message.SUCCESS, result.response);
};

const getGroupBuzzerTimerDetail = async (req, res) => {
  const { userId, funZoneGroupId } = req.body;
  const result = await groupService.getGroupBuzzerTimerDetail(userId, funZoneGroupId);
  return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
  createGroup,
  joinGroup,
  getGroupMembersInfo,
  announceGame,
  getGroupBuzzerTimerDetail
};