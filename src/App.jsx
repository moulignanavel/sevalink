import { useState, Component, useEffect } from 'react';
import { TaskStoreProvider } from './context/TaskStore';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, doc, getDoc } from './firebase';
import ProtectedRoute    from './components/ProtectedRoute';
import AuthPage          from './pages/AuthPage';
import DashboardPage     from './pages/DashboardPage';
import ProfileCompletionPage from './pages/ProfileCompletionPage';
import AboutPage         from './pages/AboutPage';
import NgoInfoPage       from './pages/NgoInfoPage';
import VolunteerInfoPage from './pages/VolunteerInfoPage';
import BlogPage          from './pages/BlogPage';
import PrivacyPage       from './pages/PrivacyPage';
import TermsPage         from './pages/TermsPage';
import ContactPage       from './pages/ContactPage';
import HelpPage          from './pages/HelpPage';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>Runtime Error</h2>
          <pre style={{ background: '#fee', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}{'\n\n'}{this.state.error.stack}
          </pre>
          <button onClick={() => this.setState({ error: null })}
            style={{ marginTop: 16, padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const { user, setUser, logout, authReady } = useAuth();
  const [page, setPage] = useState('auth');

  // Scroll to top on every page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [page]);

  const goAuth          = () => setPage('auth');
  const goDashboard     = () => setPage('dashboard');
  const handleFooterNav = (p) => setPage(p);
  const commonProps     = { onBack: user ? goDashboard : goAuth, onNavigate: handleFooterNav };

  // Show loading while auth is initializing
  if (!authReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#6b7280', fontFamily: 'system-ui' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show auth page
  if (!user) {
    // Public pages — no auth required
    switch (page) {
      case 'privacy':   return <PrivacyPage  {...commonProps} />;
      case 'terms':     return <TermsPage    {...commonProps} />;
      case 'contact':   return <ContactPage  {...commonProps} />;
      case 'help':      return <HelpPage     {...commonProps} onContact={() => setPage('contact')} />;
      case 'about':     return <AboutPage    {...commonProps} onSignUp={goAuth} />;
      case 'ngo':       return <NgoInfoPage  {...commonProps} onSignUp={goAuth} />;
      case 'volunteer': return <VolunteerInfoPage {...commonProps} onSignUp={goAuth} />;
      case 'blog':      return <BlogPage     {...commonProps} onSignUp={goAuth} />;
      default: break;
    }

    // Default to auth page if not logged in
    return (
      <AuthPage
        onAuth={(u) => { setUser(u); setPage('dashboard'); }}
        onAbout={()     => setPage('about')}
        onNgo={()       => setPage('ngo')}
        onVolunteer={()  => setPage('volunteer')}
        onBlog={()      => setPage('blog')}
        onNavigate={handleFooterNav}
      />
    );
  }

  // If user is logged in but profile not completed, show profile completion
  if (user && !user.profileCompleted) {
    return (
      <ProfileCompletionPage
        onComplete={() => {
          // Update user state to mark profile as completed
          setUser({ ...user, profileCompleted: true });
          setPage('dashboard');
        }}
      />
    );
  }

  // User is logged in with completed profile
  // Public pages — no auth required
  switch (page) {
    case 'privacy':   return <PrivacyPage  {...commonProps} />;
    case 'terms':     return <TermsPage    {...commonProps} />;
    case 'contact':   return <ContactPage  {...commonProps} />;
    case 'help':      return <HelpPage     {...commonProps} onContact={() => setPage('contact')} />;
    case 'about':     return <AboutPage    {...commonProps} onSignUp={goAuth} />;
    case 'ngo':       return <NgoInfoPage  {...commonProps} onSignUp={goAuth} />;
    case 'volunteer': return <VolunteerInfoPage {...commonProps} onSignUp={goAuth} />;
    case 'blog':      return <BlogPage     {...commonProps} onSignUp={goAuth} />;
    default: break;
  }

  // Helper function to get the correct dashboard based on role
  const getDashboard = () => {
    return <DashboardPage user={user} onLogout={() => { logout(); setUser(null); setPage('auth'); }} onFooterNav={handleFooterNav} />;
  };

  // Protected dashboard — redirects to login if not authenticated
  if (page === 'dashboard' && user) {
    return (
      <ProtectedRoute onRedirect={goAuth}>
        {getDashboard()}
      </ProtectedRoute>
    );
  }

  // Default to dashboard for logged-in users
  return (
    <ProtectedRoute onRedirect={goAuth}>
      {getDashboard()}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskStoreProvider>
        <ErrorBoundary><AppInner /></ErrorBoundary>
      </TaskStoreProvider>
    </AuthProvider>
  );
}
