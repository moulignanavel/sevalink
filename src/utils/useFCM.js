import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { db, doc, updateDoc, setDoc, serverTimestamp } from '../firebase';
import app from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ── Save FCM token to Firestore ───────────────────────────────────────────────
async function saveFcmToken(userId, token) {
  if (!userId || !token) return;
  try {
    await setDoc(doc(db, 'users', userId), {
      userId,
      fcmToken:            token,
      fcmTokenUpdatedAt:   serverTimestamp(),
      notificationsEnabled: true,
    }, { merge: true });
    console.log('[FCM] Token saved to Firestore for user:', userId);
  } catch (err) {
    console.error('[FCM] Failed to save token:', err.message);
  }
}

// ── Remove FCM token from Firestore ──────────────────────────────────────────
async function removeFcmToken(userId) {
  if (!userId) return;
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmToken:            null,
      notificationsEnabled: false,
      fcmTokenUpdatedAt:   serverTimestamp(),
    });
    console.log('[FCM] Token removed from Firestore');
  } catch (err) {
    console.warn('[FCM] Failed to remove token:', err.message);
  }
}

// ── Main FCM hook ─────────────────────────────────────────────────────────────
export function useFCM(userId) {
  const [fcmToken, setFcmToken]         = useState(null);
  const [permission, setPermission]     = useState(Notification.permission);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!userId) return;

    if (!VAPID_KEY || VAPID_KEY === 'your_vapid_key_here') {
      console.warn('[FCM] VAPID key not set.');
      return;
    }

    // FCM not supported in non-HTTPS or non-SW environments
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('[FCM] Not supported in this environment');
      return;
    }

    let messaging;
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('[FCM] Messaging init failed:', err.message);
      return;
    }

    const initFCM = async () => {
      try {
        // Request notification permission
        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm !== 'granted') {
          console.warn('[FCM] Permission denied');
          await removeFcmToken(userId);
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
        await navigator.serviceWorker.ready;

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          setFcmToken(token);
          await saveFcmToken(userId, token);
        } else {
          console.warn('[FCM] No token received');
        }
      } catch (err) {
        console.error('[FCM] Init error:', err.message);
      }
    };

    initFCM();

    // Handle token refresh — delete old token and get new one
    const handleTokenRefresh = async () => {
      try {
        await deleteToken(messaging);
        const registration = await navigator.serviceWorker.ready;
        const newToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (newToken) {
          setFcmToken(newToken);
          await saveFcmToken(userId, newToken);
          console.log('[FCM] Token refreshed');
        }
      } catch (err) {
        console.warn('[FCM] Token refresh failed:', err.message);
      }
    };

    // Listen for foreground messages
    const unsubMessage = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message:', payload);
      setNotification({
        title: payload.notification?.title || 'SevaLink',
        body:  payload.notification?.body  || 'New notification',
        data:  payload.data || {},
      });
    });

    // Listen for service worker messages (token refresh signal)
    const handleSWMessage = (event) => {
      if (event.data?.type === 'FCM_TOKEN_REFRESH') {
        handleTokenRefresh();
      }
    };
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    return () => {
      unsubMessage();
      navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    };
  }, [userId]);

  const clearNotification = () => setNotification(null);

  return { fcmToken, permission, notification, clearNotification };
}
