import { handleRequest } from '../utils/requestHandler';
import * as Constant from '../constants/appConstant';

export const registerServiceWorker = async (userId) => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      console.log('Service Worker scope:', registration.scope);
      console.log('Service Worker state:', registration.installing || registration.waiting || registration.active);
      console.log('Service Worker script URL:', registration.active.scriptURL);
      console.log('Push manager:', registration.pushManager);
      const sub = await registration.pushManager.getSubscription();
      console.log('Push subscription:', sub);
      console.log('Push subscription options:', registration.pushManager.subscriptionOptions);
      console.log('Push subscription endpoint:', registration.pushManager.getSubscription().endpoint);
      console.log('Push subscription expiration time:', registration.pushManager.getSubscription().expirationTime);
      console.log('Push subscription keys:', registration.pushManager.getSubscription().getKey('p256dh'));
      console.log('Push subscription keys:', registration.pushManager.getSubscription().getKey('auth'));
      if (!registration) {
        const newRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', newRegistration);
      }

      if (!registration.pushManager) {
        throw new Error('PushManager is not available in this browser.');
      }

      await addUserSubscriptions(userId);

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.warn('Service Workers are not supported in this browser.');
  }
};


export const addUserSubscriptions = async (userId) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission denied for push notifications');
    }

    let existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      const isValidSubscription = await validateSubscription(existingSubscription);

      if (!isValidSubscription) {
        await existingSubscription.unsubscribe();
        existingSubscription = null;
      } else {
        return;
      }
    }

    if (!existingSubscription) {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(Constant.VAPID_PUBLIC_KEY)
      });

      console.log('Push Subscription:', subscription);

      await saveSubscriptionHandler(userId, subscription);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.warn('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const saveSubscriptionHandler = async (userId, subscription) => {
  try {
    const payload = {
      userId: userId,
      subscription: subscription,
    };

    const response = await handleRequest({
      method: 'post',
      url: '/api/subscribe',
      data: { payload }
    });

    return response;
  } catch (error) {
    throw new Error('Error saving subscription');
  }
};

const validateSubscription = async (subscription) => {
  try {
    const response = await handleRequest({
      method: 'post',
      url: '/api/validateSubscription',
      data: { subscription }
    });

    return response;
  } catch (error) {
    throw new Error('Error validating subscription');
  }
};