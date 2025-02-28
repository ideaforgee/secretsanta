const promisePool = require('../config/db');
const bcrypt = require('bcryptjs');
const messages = require('../constant/SecretSantaMessages');
const db = require('../config/db');

/**
 * Registers a new user in the database.
 * @param {string} name - User's name.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<number>} - The ID of the newly registered user.
 */
const registerUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const [result] = await promisePool.query(query, [name, email, hashedPassword]);
    return result.insertId;
  } catch (error) {
    throw new Error(error.messages);
  }
};

/**
 * Finds a user by email.
 * @param {string} email - User's email.
 * @returns {Promise<object|null>} - User data or null if not found.
 */
const getUserByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [result] = await promisePool.query(query, [email]);
    return result[0] || null;
  } catch (error) {
    throw new Error(messages.REGISTRATION_FAILED);
  }
};

/**
 * Verifies if the entered password matches the stored hashed password.
 * @param {string} enteredPassword - The password entered by the user.
 * @param {string} storedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
const verifyPassword = (enteredPassword, storedPassword) => {
  return bcrypt.compare(enteredPassword, storedPassword);
};

const getUserDetailsById = async (userId) => {
  try {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [results] = await db.query(query, [userId]);
    return results[0] || null;
  } catch (err) {
    throw new Error(messages.NO_USER_EXISTS);
  }
}

/**
 * Update user's password.
 * @param {string} newPassword - The new password entered by the user.
 * @param {string} userId - User's id.
 * @returns {Promise<boolean>} - True if successfully updated the password or error.
 */
const updateUserPassword = async (newPassword, userId) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `UPDATE users SET password = ? WHERE id = ?;`
    const [result] = await promisePool.query(query, [hashedPassword, userId]);
    return true;
  } catch (err) {
    throw new Error(messages.UNABLE_TO_RESET_PASSWORD);
  }
}

module.exports = { registerUser, getUserByEmail, verifyPassword, getUserDetailsById, updateUserPassword };
