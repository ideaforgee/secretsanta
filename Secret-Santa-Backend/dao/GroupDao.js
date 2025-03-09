const db = require("../config/db.js");

const createGroup = async (name, code, hostId) => {
  const query = `
      INSERT INTO groups (name, code, hostId)
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
        FROM groups g
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
        FROM groups g
        WHERE g.code = ?
      )
      WHERE id = ?
    `;

    await db.query(joinGroupQuery, [groupCode, userId]);

    const [groupId] = await db.query(getGroupIdQuery, [userId, groupCode]);
    return groupId[0]?.groupId ?? null
  } catch (error) {
    throw new Error(err.message);
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

module.exports = {
  createGroup,
  joinGroup,
  getGroupMembersInfo
};