import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../context/TaskStore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../utils/useNotifications';

const PAGE_TITLES = {
  dashboard:   null,
  available:   'Available Tasks',
  recommended: 'Recommended',
  map:         'Task Map',
  profile:     'My Profile',
  mytasks:     'My Tasks',
  tasks:       'My Tasks',
  create:      'Create Task',
  approvals:   'Pending Approvals',
  analytics:   'Analytics',
};

const PAGE_ICONS = {
  dashboard:   '🏠',
  available:   '📋',
  recommended: '⭐',
  map:         '🗺️',
  profile:     '👤',
  mytasks:     '📁',
  tasks:       '📝',
  create:      '➕',
  approvals:   '⏳',
  analytics:   '📊',
};

// ── All searchable tasks ──────────────────────────────────────────────────────
// Removed hardcoded tasks — now using real tasks from TaskStore in SearchBox

const URGENCY_COLOR = { Critical: 'text-red-600 bg-red-50', High: 'text-orange-600 bg-orange-50', Medium: 'text-yellow-600 bg-yellow-50', Low: 'text-green-600 bg-green-50' };

const STATUS_COLOR = {
  Pending:   'text-indigo-600 bg-indigo-50',
  Accepted:  'text-amber-600 bg-amber-50',
  Completed: 'text-emerald-600 bg-emerald-50',
  Closed:    'text-gray-500 bg-gray-100',
};

// ── Click outside hook ────────────────────────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ── Search dropdown ───────────────────────────────────────────────────────────
function SearchBox({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const { tasks }         = useTaskStore();
  const { user }          = useAuth();
  const isNgo             = user?.role === 'ngo';

  useClickOutside(ref, () => setOpen(false));

  const searchPool = isNgo
    ? tasks.filter(t => t.createdBy === user?.uid || t.createdBy === null)
    : tasks;

  const results = query.trim().length > 0
    ? searchPool.filter(t =>
        t.title?.toLowerCase().includes(query.toLowerCase()) ||
        t.location?.toLowerCase().includes(query.toLowerCase()) ||
        (t.requiredSkills || []).some(s => s.toLowerCase().includes(query.toLowerCase())) ||
        t.status?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelect = (task) => {
    onNavigate?.(isNgo ? 'tasks' : 'available', task.title);
    setQuery('');
    setOpen(false);
  };

  const handleViewAll = () => {
    onNavigate?.(isNgo ? 'tasks' : 'available');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 w-52 lg:w-64 transition-all ${open || query ? 'border-emerald-400 bg-white shadow-md' : 'border-gray-200 bg-gray-50 hover:border-emerald-300'}`}>
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={isNgo ? 'Search your tasks…' : 'Search tasks…'}
          className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-gray-600 text-sm leading-none">×</button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-1">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map(t => (
                <button key={t.id} onClick={() => handleSelect(t)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm shrink-0">📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 truncate">📍 {t.location}</p>
                  </div>
                  {isNgo ? (
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t.status}
                    </span>
                  ) : (
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${URGENCY_COLOR[t.urgencyLevel] || 'bg-gray-100 text-gray-500'}`}>
                      {t.urgencyLevel}
                    </span>
                  )}
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-50">
                <button onClick={handleViewAll}
                  className="text-xs text-emerald-600 font-semibold hover:underline">
                  View all {isNgo ? 'my tasks' : 'tasks'} →
                </button>
              </div>
            </>
          ) : query.trim() ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 font-medium">No tasks found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different keyword</p>
            </div>
          ) : (
            <div className="p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                {isNgo ? 'Your Recent Tasks' : 'Quick Access'}
              </p>
              {searchPool.slice(0, 4).map(t => (
                <button key={t.id} onClick={() => handleSelect(t)}
                  className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left">
                  <span className="text-sm">📋</span>
                  <span className="text-xs text-gray-700 font-medium truncate flex-1">{t.title}</span>
                  {isNgo && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[t.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t.status}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Notifications panel ───────────────────────────────────────────────────────
function NotificationBell({ onNavigate }) {
  const { user }                          = useAuth();
  const { notifs, markRead, markAllRead, clearAll } = useNotifications(user?.uid, user?.role);
  const [open, setOpen]                   = useState(false);
  const ref                               = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const unread = notifs.filter(n => !n.read && !n.deleted).length;
  const visible = notifs.filter(n => !n.deleted).slice(0, 20);

  const handleClick = (notif) => {
    markRead(notif.id);
    onNavigate?.(notif.view || 'dashboard');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={`relative p-2.5 rounded-xl transition-colors text-gray-500 group ${open ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-100'}`}>
        <svg className="w-5 h-5 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-emerald-600 font-semibold hover:underline">Mark all read</button>
              )}
              {visible.length > 0 && (
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                <p className="text-xs text-gray-400 mt-0.5">No new notifications</p>
              </div>
            ) : (
              visible.map(n => (
                <button key={n.id} onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${!n.read ? 'bg-emerald-50/40' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-lg shrink-0 shadow-sm">
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${n.read ? 'text-gray-600' : 'text-gray-800'}`}>{n.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main header ───────────────────────────────────────────────────────────────
export default function AppHeader({ user, activeView, onMenuOpen, onNavigate }) {
  const { name, role } = user;

  const pageTitle = activeView === 'dashboard'
    ? `Welcome back, ${name.split(' ')[0]} 👋`
    : PAGE_TITLES[activeView] ?? activeView;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-5 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuOpen}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg hidden sm:block">{PAGE_ICONS[activeView] ?? '📄'}</span>
            <div className="min-w-0">
              <h1 className="text-sm lg:text-base font-bold text-gray-800 truncate leading-tight">{pageTitle}</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block leading-tight">{today}</p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <SearchBox onNavigate={onNavigate} />
          <NotificationBell onNavigate={onNavigate} />

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 uppercase">{role}</span>
          </div>

          <button onClick={() => onNavigate?.('profile')}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {name[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 font-semibold hidden sm:block">{name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
