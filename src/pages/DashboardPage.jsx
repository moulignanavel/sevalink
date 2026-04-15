import { useState } from 'react';
import Sidebar    from '../components/Sidebar';
import AppHeader  from '../components/AppHeader';
import AppFooter  from '../components/AppFooter';
import VolunteerDashboard from './VolunteerDashboard';
import NgoDashboard       from './NgoDashboard';
import FCMNotificationToast from '../components/FCMNotificationToast';
import { useFCM } from '../utils/useFCM';

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
const NAV_VOLUNTEER = [
  { icon: '🏠', label: 'Home',    key: 'Dashboard'   },
  { icon: '📋', label: 'Tasks',   key: 'Available'   },
  { icon: '📁', label: 'Mine',    key: 'Mytasks'     },
  { icon: '🗺️', label: 'Map',     key: 'Map'         },
  { icon: '👤', label: 'Profile', key: 'Profile'     },
];
const NAV_NGO = [
  { icon: '🏠', label: 'Home',      key: 'Dashboard'  },
  { icon: '📝', label: 'Tasks',     key: 'Tasks'      },
  { icon: '➕', label: 'Post',      key: 'Create'     },
  { icon: '🗺️', label: 'Map',       key: 'Map'        },
  { icon: '⏳', label: 'Approvals', key: 'Approvals'  },
  { icon: '👤', label: 'Profile',   key: 'Profile'    },
];

function BottomNav({ role, active, onNavigate }) {
  const nav = role === 'ngo' ? NAV_NGO : NAV_VOLUNTEER;
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map((item) => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-0 flex-1"
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100 opacity-40'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold transition-colors truncate ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && <span className="w-4 h-0.5 rounded-full bg-emerald-500 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardPage({ user, onLogout, onFooterNav }) {
  // Safety check - if no user, don't render anything
  if (!user || !user.uid) return null;

  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { role } = user;

  // Initialize FCM for push notifications
  const { notification, clearNotification } = useFCM(user.uid);

  const handleNavigate = (key, query = '') => {
    setActiveView(key);
    setSearchQuery(query);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* FCM Notification Toast */}
      <FCMNotificationToast notification={notification} onClose={clearNotification} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar role={role} active={activeView}
          onNavigate={(key) => handleNavigate(key)}
          onLogout={onLogout ?? (() => {})} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader user={user} activeView={activeView}
          onMenuOpen={() => setSidebarOpen(true)}
          onNavigate={handleNavigate} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-24 lg:pb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            {role === 'ngo' ? (
              <NgoDashboard activeView={activeView} onNavigate={handleNavigate} />
            ) : (
              <VolunteerDashboard activeView={activeView} onNavigate={handleNavigate} searchQuery={searchQuery} />
            )}
          </div>
        </main>

        {/* Desktop footer */}
        <div className="hidden lg:block">
          <AppFooter onNavigate={onFooterNav} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav role={role} active={activeView} onNavigate={handleNavigate} />
    </div>
  );
}
