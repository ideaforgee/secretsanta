import { handleRequest } from '../utils/requestHandler';

export const createGroupHandler = (payload) => {
  return handleRequest({
    method: 'post',
    url: '/api/group/createGroup',
    data: { payload },
  });
};

export const gameAssistHandler = (payload) => {
  return handleRequest({
    method: 'post',
    url: '/api/group/gameAssist',
    data: { payload },
  });
};

export const getGroupMembersHandler = (groupId) => {
  return handleRequest({
    method: 'get',
    url: `/api/group/getGroupMembersInfo/${groupId}`
  });
};

export const announceGameHandler = (payload) => {
  return handleRequest({
    method: 'post',
    url: '/api/group/announceGame',
    data: { payload },
  });
};

export const getGroupBuzzerTimerDetail = (userId, funZoneGroupId) => {
  return handleRequest({
      method: 'post',
      url: '/api/group/getGroupBuzzerTimerDetail',
      data: { userId, funZoneGroupId },
  });
};