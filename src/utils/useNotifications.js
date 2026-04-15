import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy, updateDoc, doc, addDoc, serverTimestamp } from '../firebase';

// ── Notification icons by type ────────────────────────────────────────────────
export const NOTIF_ICONS = {
  task_posted:    '📋',
  task_accepted:  '✅',
  proof_submitted:'📤',
  proof_approved: '🏆',
  proof_rejected: '❌',
  task_closed:    '🔒',
  new_volunteer:  '🙋',
  default:        '🔔',
};

// ── Navigation view by type ───────────────────────────────────────────────────
const NOTIF_VIEW = {
  task_posted:    'available',
  task_accepted:  'mytasks',
  proof_submitted:'approvals',
  proof_approved: 'mytasks',
  proof_rejected: 'mytasks',
  task_closed:    'mytasks',
  new_volunteer:  'tasks',
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useNotifications(userId, role) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Listen to notifications collection for this user
    let q;
    try {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } catch {
      q = query(collection(db, 'notifications'), where('userId', '==', userId));
    }

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({
        id:        d.id,
        ...d.data(),
        time:      formatTime(d.data().createdAt?.toDate?.() || new Date()),
        icon:      NOTIF_ICONS[d.data().type] || NOTIF_ICONS.default,
        view:      NOTIF_VIEW[d.data().type]  || 'dashboard',
      }));
      setNotifs(items);
    }, (err) => {
      console.warn('[Notifications] Listener error:', err.message);
    });

    return () => unsub();
  }, [userId]);

  const markRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.warn('[Notifications] markRead error:', err.message);
    }
    setNotifs(p => p.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read);
    await Promise.all(unread.map(n =>
      updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})
    ));
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    await Promise.all(notifs.map(n =>
      updateDoc(doc(db, 'notifications', n.id), { deleted: true }).catch(() => {})
    ));
    setNotifs([]);
  };

  return { notifs, markRead, markAllRead, clearAll };
}

// ── Helper to send a notification ────────────────────────────────────────────
export async function sendNotification({ userId, type, title, body }) {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      body,
      read:      false,
      deleted:   false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[Notifications] sendNotification error:', err.message);
  }
}

// ── Format time ───────────────────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
