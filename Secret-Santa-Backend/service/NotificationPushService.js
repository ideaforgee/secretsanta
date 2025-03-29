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
    }
  } catch (error) {
    throw new Error;
  }
}

/**
 * Sends push notifications to multiple users
 * @param {Array} recipientIds - List of recipient user IDs
 * @param {String} title - Notification title
 * @param {String} body - Notification body
 */
const sendPushNotifications = async (recipientIds, title, body) => {
  try {
    for (const recipientId of recipientIds) {
      const subscriptions = await notificationDao.getSubscription(recipientId);
      if (!subscriptions || subscriptions.length === 0) {
        continue;
      }

      const notificationPayload = {
        title: title,
        body: body,
        icon: '/logo192.png',
        badge: '/badge.png',
      };

      await Promise.all(
        subscriptions.map(sub => sendNotification(sub.subscription, notificationPayload))
      );
    }

    console.log(`Notifications sent to ${recipientIds.length} recipients`);
  } catch (error) {
    console.error('Error sending push notifications:', error);
    throw new Error('Error sending push notifications');
  }
};

module.exports = {
  sendNotification,
  saveSubscription,
  sendPushNotifications
};