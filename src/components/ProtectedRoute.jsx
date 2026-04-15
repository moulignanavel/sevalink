import { useAuth } from '../context/AuthContext';

// Loading spinner shown while Firebase restores session
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading SevaLink…</p>
      </div>
    </div>
  );
}

/**
 * Wraps any page that requires authentication.
 * - Shows loader while Firebase checks session
 * - Renders children if user is logged in
 * - Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children, onRedirect }) {
  const { user, authReady } = useAuth();

  // Still loading auth state
  if (!authReady) {
    return <AuthLoader />;
  }

  // No user authenticated - redirect immediately
  if (!user) {
    // Call redirect and return nothing
    onRedirect?.();
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated - render children
  return children;
}
