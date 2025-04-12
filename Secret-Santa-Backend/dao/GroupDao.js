const db = require("../config/db.js");
const moment = require("moment"); 

const createGroup = async (name, code, hostId) => {
  const query = `
      INSERT INTO funZoneGroups (name, code, hostId)
        VALUES (?, ?, ?)
    `;

  try {
    await db.query(query, [name, code, hostId]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const joinGroup = async (userId, groupCode) => {
  try {
    const getGroupIdQuery = `
      SELECT groupId
      FROM users
      WHERE id = ? AND groupId = (
        SELECT g.id
        FROM funZoneGroups g
        WHERE g.code = ?
      );
    `;

    const [existingGroup] = await db.query(getGroupIdQuery, [userId, groupCode]);

    if(existingGroup.length) {
      return existingGroup[0]?.groupId ?? null;
    }

    const joinGroupQuery = `
      UPDATE users
      SET groupId = (
        SELECT g.id
        FROM funZoneGroups g
        WHERE g.code = ?
      )
      WHERE id = ?
    `;

    await db.query(joinGroupQuery, [groupCode, userId]);

    const [groupId] = await db.query(getGroupIdQuery, [userId, groupCode]);
    return groupId[0]?.groupId ?? null
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGroupMembersInfo = async (groupId) => {
  try {
    const query = `
      SELECT u.id as userId, u.name as userName
      FROM users u
      WHERE u.groupId = ?
    `;

    const results = await db.query(query, [groupId]);
    return results ?? [];
  } catch (error) {
    throw new Error(err.message);
  }
};

const addUserToBuzzerRoom = async (userId, groupId, time) => {
  try {
    const formattedTime = moment(time, 'DD/MM/YYYY, HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

    const query = 'INSERT INTO buzzerRoom (userId, funZoneGroupId, time) VALUES (?, ?, ?)';

    await db.query(query, [Number(userId), Number(groupId), formattedTime]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const reactiveBuzzerRoom = async (groupId) => {
  try {
    const query = 'DELETE FROM buzzerRoom where funZoneGroupId = ?';

    await db.query(query, [Number(groupId)]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const getGroupBuzzerTimerDetail = async (userId, funZoneGroupId) => {
  try {
    const query = 'CALL getGroupBuzzerTimerDetail(?, ?);';

    const [response] = await db.query(query, [Number(funZoneGroupId), Number(userId)]);
    return response ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllGroupUsers = async (funZoneGroupId) => {
  try {
    const query = 'SELECT id from users WHERE groupId = ?;';

    const [response] = await db.query(query, [Number(funZoneGroupId)]);
    return response ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const usersWhoPressedBuzzer = async (funZoneGroupId) => {
  try {
    const query = `SELECT name, time, funZoneGroupId as groupId
    from buzzerRoom
    INNER JOIN users ON users.id = buzzerRoom.userId
    WHERE buzzerRoom.funZoneGroupId = ?
    ORDER by time asc;`;

    const [response] = await db.query(query, [Number(funZoneGroupId)]);
    return response ?? [];
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  createGroup,
  joinGroup,
  getGroupMembersInfo,
  addUserToBuzzerRoom,
  reactiveBuzzerRoom,
  getGroupBuzzerTimerDetail,
  getAllGroupUsers,
  usersWhoPressedBuzzer
};