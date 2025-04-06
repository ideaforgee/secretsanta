require('dotenv').config();
const webpush = require('web-push');
const notificationDao = require('../dao/NotificationDao');

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    'mailto:' + process.env.EMAIL_USER,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

/**
 * Sends a push notification to the specified user
 * @param {String} userId - The user to send the notification to
 * @param {String} message - The message to send
 */
const sendNotification = async (subscription, payload) => {
  return webpush.sendNotification(subscription, JSON.stringify(payload))
    .catch(error => console.error('Push notification error:', error));
};

/**
 * Saves a new subscription to the database using raw SQL
 * @param {Number} userId - The user ID
 * @param {Object} subscription - The push subscription object
 */
const saveSubscription = async (userId, subscription) => {
  try {
    const existingSubscription = await notificationDao.getSubscription(userId);
    let result;
    if (!existingSubscription) {
      result = await notificationDao.addSubscription(userId, subscription);
    } else {
      result = await notificationDao.updateSubscription(userId, subscription);
    }
  } catch (error) {
    throw new Error;
  }
}

/**
 * Sends push notifications to multiple users
 * @param {Array} recipientId - List of recipient user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 */
const sendPushNotifications = async (recipientId, title, body) => {
  try {
    const subscription = await notificationDao.getSubscription(recipientId);
    if (subscription) {

      const notificationPayload = {
        title: title,
        body: body,
        icon: '/logo192.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200]
      };

      sendNotification(subscription[0]?.subscription, notificationPayload);

      console.log(`Notifications sent to ${recipientId}`);
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
    throw new Error('Error sending push notifications');
  }
};

const validateNotificationSubscription = async (subscription) => {
  try {
    await webpush.sendNotification(subscription, null);
    return true;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      return false;
    }
    throw new Error(error);
  }
};

module.exports = {
  sendNotification,
  saveSubscription,
  sendPushNotifications,
  validateNotificationSubscription
};