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

module.exports = {
  createGroup,
};