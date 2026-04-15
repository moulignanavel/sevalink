import { useEffect } from 'react';

export default function FCMNotificationToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full animate-slide-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{notification.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
