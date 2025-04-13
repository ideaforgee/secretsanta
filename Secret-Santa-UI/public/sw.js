// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', event => {
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url }
    };

    // eslint-disable-next-line no-restricted-globals
    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('notificationclick', event => {
  event.notification.close();
  // eslint-disable-next-line no-undef
  event.waitUntil(clients.openWindow(event.notification.data.url));
});