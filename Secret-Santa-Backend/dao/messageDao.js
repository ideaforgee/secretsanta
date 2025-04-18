const db = require('../config/db');
const encryptDecryptService = require('../service/EncryptionAndDecryptionService');

/**
 * Fetch messages for a specific user and game.
 * @param {number} userId - The ID of the user.
 * @param {number} gameId - The ID of the game.
 * @returns {Promise<Array|null>} - Returns an array of messages or null if there is an error.
 */
const getMessagesByUserAndGame = async (userId, gameId) => {
    try {
        const senderId = encryptDecryptService.encrypt(Number(userId));
        const result = await db.query('CALL GetMessages(?, ?, ?)', [userId, senderId, Number(gameId)]);
        return result[0] ?? null;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return null;
    }
};

/**
 * Save a new message to the database.
 * @param {string} content - The content of the message.
 * @param {number} userId - The ID of the user sending the message.
 * @param {number} gameId - The ID of the game.
 * @param {string} chatBoxType - The type of chat box ('secretSanta' or 'giftNinja').
 * @returns {Promise<boolean>} - Returns true if the message was successfully saved, otherwise false.
 */
const saveSenderMessage = async (content, userId, gameId, chatBoxType) => {
    try {
        const encryptedReceiverId = await getReceiverIdForSenderAndGame(userId, gameId, chatBoxType);
        const senderId = encryptDecryptService.encrypt(userId);
        await db.query('CALL InsertMessage(?, ?, ?, ?, ?)', [content, senderId, gameId, encryptedReceiverId, chatBoxType]);
    } catch (error) {
        console.error('Error saving message:', error);
    }
};


/**
 * Fetches the receiver ID for a given sender, game, and chat box type.
 *
 * @param {number} senderId - ID of the sender.
 * @param {number} gameId - ID of the game.
 * @param {string} chatBoxType - Type of the chat box (e.g., 'secretSanta' or 'giftNinja').
 * @returns {Promise<number|null>} - A promise resolving to the receiverId or null if not found.
 */
const getReceiverIdForSenderAndGame = async (senderId, gameId, chatBoxType) => {
    try {
        let query = '';

        if (chatBoxType === 'secretSanta') {
            query = 'SELECT secretSantaId AS receiverId FROM userGame WHERE userId = ? AND gameId = ? LIMIT 1';
        } else if (chatBoxType === 'giftNinja') {
            query = 'SELECT giftNinjaId AS receiverId FROM userGame WHERE userId = ? AND gameId = ? LIMIT 1';
        } else {
            throw new Error('Invalid chatBoxType.');
        }

        const result = await db.query(query, [senderId, gameId]);

        return result[0] ? result[0][0].receiverId : null;
    } catch (error) {
        console.error('Error fetching receiverId:', error);
        return null;
    }
};

const getPendingMessagesForUserInGame = async (userId, gameId) => {
    const query = `
      SELECT
        MAX(CASE
            WHEN chatBoxType = 'secretSanta' AND emailStatus = 'sent' THEN TRUE
            ELSE FALSE
        END) AS secretSantaPendingMessages,
        MAX(CASE
            WHEN chatBoxType = 'giftNinja' AND emailStatus = 'sent' THEN TRUE
            ELSE FALSE
        END) AS giftNinjaPendingMessages
      FROM userEmailStatus
      WHERE userId = ? AND gameId = ?
    `;
    try {
        const [rows] = await db.query(query, [userId, gameId]);
        return rows[0];
    } catch (err) {
        console.log('Error executing query:', err);
        throw err;
    }
};

const isEmailAlreadySent = async (userId, gameId, groupId, chatBoxType) => {
    const query = `
      SELECT
        MAX(CASE
            WHEN emailStatus = 'sent' THEN TRUE
            ELSE FALSE
        END) AS isEmailAlreadySent
      FROM userEmailStatus
      WHERE userId = ? AND (gameId = ? OR groupId = ?) AND chatBoxType = ?;
    `;
    try {
        const [rows] = await db.query(query, [userId, gameId, groupId, chatBoxType]);
        return rows[0];
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
};

const upsertUserEmailStatusForGame = async (userId, gameId, groupId, chatBoxType) => {
    const query = `
      INSERT INTO userEmailStatus (userId, gameId, groupId, chatBoxType, emailStatus)
      VALUES (?, ?, ?, ?, 'sent')
      ON DUPLICATE KEY UPDATE
          emailStatus = 'sent';
    `;

    try {
        await db.query(query, [userId, gameId, groupId, chatBoxType]);
    } catch (err) {
        console.error('Error executing upsert query:', err);
        throw err;
    }
};

const markEmailAsNotSent = async (userId, gameId, groupId, chatBoxType) => {
    const query = `
      UPDATE userEmailStatus
      SET emailStatus = 'notSent'
      WHERE userId = ? AND (gameId = ? OR groupId = ?) AND chatBoxType = ?
    `;

    try {
        await db.query(query, [userId, gameId, groupId, chatBoxType]);
    } catch (err) {
        console.error('Error executing update query:', err);
        throw err;
    }
};

const getUserById = async (userId) => {
    const query = `
      SELECT id, name, email
      FROM users
      WHERE id = ?
    `;

    try {
        const [result] = await db.query(query, [userId]);
        return result[0] ?? {};
    } catch (err) {
        console.error('Error executing update query:', err);
        throw err;
    }
};

const getGroupDiscussionMessages = async (userId, groupId) => {
    try {
        const result = await db.query('CALL GetGroupDiscussionMessages(?, ?)', [Number(userId), Number(groupId)]);
        return result[0] ?? null;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return null;
    }
};

const fetchGroupDiscussionPendingMessages = async (userId, groupId) => {
    const query = `
      SELECT
        MAX(CASE
            WHEN chatBoxType = 'publicChat' AND emailStatus = 'sent' THEN TRUE
            ELSE FALSE
        END) AS publicChatPendingMessages,
        MAX(CASE
            WHEN chatBoxType = 'anonymousChat' AND emailStatus = 'sent' THEN TRUE
            ELSE FALSE
        END) AS anonymousChatPendingMessages
      FROM userEmailStatus
      WHERE userId = ? AND groupId = ?
    `;
    try {
        const [rows] = await db.query(query, [userId, groupId]);
        return rows[0];
    } catch (err) {
        console.log('Error executing query:', err);
        throw err;
    }
};

const getReceiversIdsForGroupDiscussion = async (groupId) => {
    try {
        const query = 'SELECT id AS receiverId FROM users WHERE groupId = ?;';

        const result = await db.query(query, [Number(groupId)]);

        return result[0];
    } catch (error) {
        console.error('Error fetching receiverId:', error);
        return null;
    }
};

const storeGroupDiscussionMessage = async (senderId, content, groupId, sendAnonymously) => {
    try {
        const query = 'INSERT INTO groupDiscussion (senderId, content, groupId, sendAnonymously) VALUES (?, ?, ?, ?)';

        await db.query(query, [senderId, content, groupId, sendAnonymously]);
    } catch (error) {
        console.error('Error fetching receiverId:', error);
        return null;
    }
};



module.exports = {
    getMessagesByUserAndGame,
    saveSenderMessage,
    getReceiverIdForSenderAndGame,
    getPendingMessagesForUserInGame,
    isEmailAlreadySent,
    upsertUserEmailStatusForGame,
    markEmailAsNotSent,
    getUserById,
    getGroupDiscussionMessages,
    fetchGroupDiscussionPendingMessages,
    getReceiversIdsForGroupDiscussion,
    storeGroupDiscussionMessage
};
