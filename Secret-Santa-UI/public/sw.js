// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', event => {
  // Fetch data for notification
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: { url: data.url } 
  };

  // eslint-disable-next-line no-restricted-globals
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('notificationclick', event => {
  event.notification.close();
  // eslint-disable-next-line no-undef
  event.waitUntil(clients.openWindow(event.notification.data.url));
});