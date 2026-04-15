import { useState } from 'react';
import Sidebar    from '../components/Sidebar';
import AppHeader  from '../components/AppHeader';
import AppFooter  from '../components/AppFooter';
import VolunteerDashboard from './VolunteerDashboard';
import NgoDashboard       from './NgoDashboard';
import FCMNotificationToast from '../components/FCMNotificationToast';
import { useFCM } from '../utils/useFCM';

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
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-6">
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
    </div>
  );
}
