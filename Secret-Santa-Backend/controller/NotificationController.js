const { sendNotification, saveSubscription } = require('../service/NotificationPushService');

const sendNotificationHandler = async (req, res) => {
  const { subscription, payload } = req.body;

  if(!subscription || !payload) {
    return res.status(400).send('Subscription and payload are required');
  }

  sendNotification(subscription, payload)
    .then(() => res.status(200).send('Notification sent'))
    .catch(error => res.status(500).send('Error sending notification:', error.message));
};

const subscribe = async (req, res) => {
  const { userId, subscription } = req.body.payload;

  if (!userId || !subscription ) {
    return res.status(400).send('Subscription and payload are required');
  }

  try {
    await saveSubscription(userId, subscription);
    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
};

module.exports = {
  sendNotificationHandler,
  subscribe
};