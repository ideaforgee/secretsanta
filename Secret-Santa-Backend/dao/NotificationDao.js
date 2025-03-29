const db = require("../config/db.js");

/**
 * Fetches an existing subscription for a given user.
 * @param {Number} userId - The user ID.
 * @returns {Promise<Object|null>} - Subscription data or null if not found.
 */
const getSubscription = async (userId) => {
  try {
    const query = 'SELECT subscription FROM notificationSubscriptions WHERE userId = ?';
    const subscription = await db.query(query, [userId]);

    return subscription[0].length > 0 ? subscription[0] : null;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Inserts a new subscription into the database.
 * @param {Number} userId - The user ID.
 * @param {Object} subscription - The push subscription object.
 */
const addSubscription = async (userId, subscription) => {
  try {
    const query = 'INSERT INTO notificationSubscriptions (userId, subscription) VALUES (?, ?)';
    
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      throw new Error("Invalid userId: Must be a number.");
    }

    // Convert subscription to JSON string
    const subscriptionString = JSON.stringify(subscription);

    const [result] = await db.query(query, [parsedUserId, subscriptionString]);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Updates an existing subscription for a user.
 * @param {Number} userId - The user ID.
 * @param {Object} subscription - The updated subscription object.
 */
const updateSubscription = async (userId, subscription) => {
  try {
    const query = 'UPDATE notificationSubscriptions SET subscription = ? WHERE userId = ?';
    const [result] = await db.query(query, [JSON.stringify(subscription), userId]);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getSubscription,
  addSubscription,
  updateSubscription
}