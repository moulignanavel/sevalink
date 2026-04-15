const NAV_VOLUNTEER = [
  { icon: '🏠', label: 'Dashboard',       key: 'dashboard'   },
  { icon: '📋', label: 'Available Tasks', key: 'available'   },
  { icon: '📁', label: 'My Tasks',        key: 'mytasks'     },
  { icon: '⭐', label: 'Recommended',     key: 'recommended' },
  { icon: '🗺️', label: 'Map View',        key: 'map'         },
  { icon: '👤', label: 'Profile',         key: 'profile'     },
];

const NAV_NGO = [
  { icon: '🏠', label: 'Dashboard',   key: 'dashboard'  },
  { icon: '📝', label: 'My Tasks',    key: 'tasks'      },
  { icon: '➕', label: 'Create Task', key: 'create'     },
  { icon: '⏳', label: 'Approvals',   key: 'approvals'  },
  { icon: '🗺️', label: 'Map View',    key: 'map'        },
  { icon: '📊', label: 'Analytics',  key: 'analytics'  },
  { icon: '👤', label: 'Profile',     key: 'profile'    },
];

export default function Sidebar({ role, active, onNavigate, onLogout }) {
  const nav = role === 'ngo' ? NAV_NGO : NAV_VOLUNTEER;

  return (
    <aside className="w-64 h-full min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">SevaLink</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase">{role}</span>
          <span className="text-xs text-gray-500 ml-auto">Online</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {nav.map((item) => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className={`text-base transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-5 space-y-1 border-t border-white/5">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
            text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group">
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}
