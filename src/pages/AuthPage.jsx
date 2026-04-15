import { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import AppFooter from '../components/AppFooter';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  sendEmailVerification,
  collection,
  query,
  where,
  getDocs,
} from '../firebase';

// ── EmailJS config ─────────────────────────────────────────────────────────
// Sign up free at emailjs.com → create a service + template → paste IDs below
const EJS_SERVICE          = import.meta.env.VITE_EMAILJS_SERVICE          ?? 'YOUR_SERVICE_ID';
const EJS_TEMPLATE         = import.meta.env.VITE_EMAILJS_TEMPLATE         ?? 'YOUR_TEMPLATE_ID';
const EJS_TEMPLATE_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME ?? 'YOUR_WELCOME_TEMPLATE_ID';
const EJS_KEY              = import.meta.env.VITE_EMAILJS_KEY              ?? 'YOUR_PUBLIC_KEY';

// Initialize EmailJS
if (EJS_KEY && EJS_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EJS_KEY);
}

// ── Generate 6-digit OTP ───────────────────────────────────────────────────
// (kept for reference — password reset now uses Firebase email link)

// ── Email Verification Flow ───────────────────────────────────────────────────
function EmailVerification({ email, onVerified, onBack, loading }) {
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendVerification = async () => {
    try {
      setSendingEmail(true);
      setError('');
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated. Please try again.');
        return;
      }
      
      await sendEmailVerification(user);
      setVerificationSent(true);
      console.info('[Firebase] Verification email sent successfully');
    } catch (err) {
      console.error('[Firebase] sendEmailVerification error:', err);
      const errorMsg = {
        'auth/too-many-requests': 'Too many verification emails sent. Please try again later.',
        'auth/user-not-found': 'User not found. Please sign up again.',
      }[err.code] ?? 'Failed to send verification email. Please try again.';
      setError(errorMsg);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      setError('');
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated. Please try again.');
        return;
      }
      
      // Reload to get the latest verification status from Firebase
      await user.reload();
      
      if (user.emailVerified) {
        // Update Firestore to mark email as verified
        try {
          await setDoc(doc(db, 'users', user.uid), {
            emailVerified: true,
          }, { merge: true });
          console.info('[Firebase] Email verified successfully');
        } catch (firestoreErr) {
          console.warn('[Firestore] Could not update verification status:', firestoreErr);
        }
        onVerified?.();
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err) {
      console.error('[Firebase] Error checking verification:', err);
      const errorMsg = {
        'auth/user-not-found': 'User not found. Please sign up again.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
      }[err.code] ?? 'Error checking verification status. Please try again.';
      setError(errorMsg);
    } finally {
      setCheckingVerification(false);
    }
  };

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all';

  return (
    <div className="w-full max-w-sm">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mx-auto">📧</div>
        <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
        <p className="text-sm text-gray-500">
          We sent a verification link to <span className="font-semibold text-gray-700">{email}</span>.
          Click the link in your email to verify your account.
        </p>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {!verificationSent ? (
          <button onClick={handleSendVerification} disabled={sendingEmail}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
            {sendingEmail
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</>
              : 'Send Verification Email →'}
          </button>
        ) : (
          <>
            <p className="text-xs text-gray-400 pt-2">Didn't receive the email? Check your spam folder or click below to resend.</p>
            <button onClick={handleSendVerification} disabled={sendingEmail}
              className="w-full py-2 text-sm text-emerald-600 font-semibold border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {sendingEmail ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs text-gray-500 mb-3">After clicking the verification link in your email, click the button below:</p>
              <button onClick={handleCheckVerification} disabled={checkingVerification}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
                {checkingVerification
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Checking…</>
                  : '✓ I Verified My Email →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Forgot Password Flow ───────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      console.info('[SevaLink] Password reset email sent to:', email);
      setSent(true);
    } catch (err) {
      console.error('[Firebase] sendPasswordResetEmail error:', err.code, err.message);
      const msg = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/invalid-email':  'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      }[err.code] ?? 'Failed to send reset email. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all';

  return (
    <div className="w-full max-w-sm">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to login
      </button>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mx-auto">📧</div>
          <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
          <p className="text-sm text-gray-500">
            We sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>.
            Check your email and follow the link.
          </p>
          <button onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100">
            Back to Login →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
            <p className="text-sm text-gray-500">Enter your email and we'll send a reset link.</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="your@email.com" className={`${inp} pl-10`} />
          </div>
          {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</>
              : 'Send Reset Link →'}
          </button>
        </form>
      )}
    </div>
  );
}

const ROLES = [
  { value: 'volunteer', label: '🙋 Volunteer', desc: 'Find & join tasks near you' },
  { value: 'ngo',       label: '🏢 NGO',       desc: 'Post tasks & manage teams'  },
];

// ── Floating label input ──────────────────────────────────────────────────────
function FloatingInput({ label, name, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ''}
        className="peer w-full px-4 pt-5 pb-2 border border-gray-200 rounded-xl text-sm bg-gray-50
          focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
          transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${active ? 'top-1.5 text-[10px] font-semibold text-emerald-500' : 'top-3.5 text-sm text-gray-400'}`}>
        {label}
      </label>
    </div>
  );
}

// ── Password input with show/hide ─────────────────────────────────────────────
function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name="password"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? '••••••••' : ''}
        className="peer w-full px-4 pt-5 pb-2 pr-11 border border-gray-200 rounded-xl text-sm bg-gray-50
          focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
          transition-all duration-200"
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${active ? 'top-1.5 text-[10px] font-semibold text-emerald-500' : 'top-3.5 text-sm text-gray-400'}`}>
        Password
      </label>
      <button type="button" onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
        {show
          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        }
      </button>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '12K+', label: 'Volunteers' },
  { value: '340+', label: 'NGOs' },
  { value: '8K+',  label: 'Tasks Done' },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AuthPage({ onAuth, onAbout, onNgo, onVolunteer, onBlog, onNavigate }) {
  const [isLogin, setIsLogin]       = useState(true);
  const [form, setForm]             = useState({ name: '', email: '', password: '', role: 'volunteer' });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const formRef                     = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (!isLogin && !form.name)        { setError('Full name is required.'); return; }
    setLoading(true); setError('');

    try {
      if (isLogin) {
        // ── Sign in ──────────────────────────────────────────────────────────
        const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);

        // Reload user to get latest emailVerified status
        await user.reload();

        // Check if email is verified
        if (!user.emailVerified) {
          // Send verification email automatically
          try {
            await sendEmailVerification(user);
            console.info('[Firebase] Verification email sent to:', form.email);
          } catch (verifyErr) {
            console.error('[Firebase] Failed to send verification email:', verifyErr);
          }
          
          setError('⚠️ Email not verified yet. We sent a verification link to your email. Please check your inbox and click the link to verify your account.');
          setLoading(false);
          return;
        }

        // Fetch role and profileCompleted from Firestore in one call
        let registeredRole = null;
        let profileCompleted = false;
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            registeredRole   = snap.data().role;
            profileCompleted = snap.data().profileCompleted ?? false;
          }
        } catch (e) {
          console.warn('[Firestore] Could not fetch user data:', e);
          setError('Error verifying your account. Please try again.');
          setLoading(false);
          return;
        }

        // Check if selected role matches registered role
        if (!registeredRole) {
          setError('Account not found. Please sign up first.');
          setLoading(false);
          return;
        }

        if (form.role !== registeredRole) {
          setError(`❌ Role mismatch! You registered as a ${registeredRole === 'volunteer' ? 'Volunteer' : 'NGO'}, but you're trying to login as a ${form.role === 'volunteer' ? 'Volunteer' : 'NGO'}. Please select the correct role.`);
          setLoading(false);
          return;
        }

        onAuth?.({
          uid:             user.uid,
          name:            user.displayName || form.email.split('@')[0],
          email:           user.email,
          role:            registeredRole,
          profileCompleted,
        });
      } else {
        // ── Sign up ──────────────────────────────────────────────────────────
        // First check if email is already registered with a different role
        try {
          // Try to get user by email from Firestore
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', form.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Email already exists - check the role
            const existingUser = querySnapshot.docs[0].data();
            if (existingUser.role !== form.role) {
              setError(`❌ This email is already registered as a ${existingUser.role === 'volunteer' ? 'Volunteer' : 'NGO'}. One email can only be registered for one role. Please use a different email or login with the correct role.`);
              setLoading(false);
              return;
            } else {
              setError('This email is already registered. Please sign in instead.');
              setLoading(false);
              return;
            }
          }
        } catch (checkErr) {
          console.warn('[Firestore] Could not check existing email:', checkErr);
          // Continue with signup if check fails
        }

        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(user, { displayName: form.name });

        // Save user profile to Firestore → users/{uid}
        try {
          await setDoc(doc(db, 'users', user.uid), {
            userId:    user.uid,
            name:      form.name,
            email:     form.email,
            role:      form.role,           // 'volunteer' | 'ngo'
            createdAt: serverTimestamp(),
            emailVerified: false,
            profileCompleted: false,        // Track if profile is complete
          });
        } catch (firestoreErr) {
          // Non-fatal — auth succeeded, just log the Firestore error
          console.error('[Firestore] Failed to save user profile:', firestoreErr);
        }

        // Send verification email
        try {
          await sendEmailVerification(user);
          console.info('[Firebase] Verification email sent to:', form.email);
        } catch (verifyErr) {
          console.error('[Firebase] Failed to send verification email:', verifyErr);
        }

        // Send welcome email via EmailJS
        try {
          const emailParams = {
            to_email:     form.email,
            to_name:      form.name,
            role:         form.role === 'volunteer' ? 'Volunteer' : 'NGO',
            is_volunteer: form.role === 'volunteer' ? 'true' : '',
            is_ngo:       form.role === 'ngo'       ? 'true' : '',
            // Add more details to avoid spam filters
            subject:      `Welcome to SevaLink, ${form.name}!`,
            message:      `Hi ${form.name},\n\nWelcome to SevaLink! We're excited to have you join our community of volunteers and NGOs making a real impact.\n\nYour account has been created successfully. Please verify your email to get started.\n\nBest regards,\nThe SevaLink Team`,
          };
          
          await emailjs.send(EJS_SERVICE, EJS_TEMPLATE_WELCOME, emailParams);
          console.info('[EmailJS] Welcome email sent successfully to:', form.email);
        } catch (ejsErr) {
          console.error('[EmailJS Welcome Error]', ejsErr);
          // Non-fatal error - don't block the sign-up process
        }

        // Show verification screen
        setVerificationEmail(form.email);
        setVerificationMode(true);
        setLoading(false);
        return;
      }
    } catch (firebaseErr) {
      const msg = {
        'auth/user-not-found':      'No account found with this email.',
        'auth/wrong-password':      'Incorrect password. Please try again.',
        'auth/email-already-in-use':'An account with this email already exists.',
        'auth/weak-password':       'Password must be at least 6 characters.',
        'auth/invalid-email':       'Please enter a valid email address.',
        'auth/invalid-credential':  'Invalid email or password.',
        'auth/too-many-requests':   'Too many attempts. Please try again later.',
      }[firebaseErr.code] ?? `Error: ${firebaseErr.code ?? firebaseErr.message}`;
      console.error('[Firebase Auth Error]', firebaseErr.code, firebaseErr.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setIsLogin((v) => !v); setError(''); };

  // Header nav actions
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const selectRole = (role) => {
    setForm((p) => ({ ...p, role }));
    setIsLogin(false);
    setError('');
    scrollToForm();
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Auth page header ── */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-100">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">SevaLink</span>
          </div>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <button onClick={onAbout}     className="hover:text-emerald-600 transition-colors font-medium">About</button>
            <button onClick={onNgo}       className="hover:text-emerald-600 transition-colors font-medium">NGOs</button>
            <button onClick={onVolunteer} className="hover:text-emerald-600 transition-colors font-medium">Volunteers</button>
            <button onClick={onBlog}      className="hover:text-emerald-600 transition-colors font-medium">Blog</button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              12K+ Volunteers Active
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">

      {/* ── Left panel (hero) ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/35 to-cyan-900/40" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SevaLink</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-white/90 text-xs font-medium">Real-time volunteer matching</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Connect.<br />Volunteer.<br />
            <span className="text-emerald-200">Make Impact.</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            SevaLink bridges the gap between NGOs and passionate volunteers — matching skills to tasks that matter most.
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-2">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-white/60 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/80 text-sm italic leading-relaxed">
            "SevaLink helped us coordinate 200+ volunteers during the flood relief in just 48 hours."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
              RP
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Riya Patel</div>
              <div className="text-white/50 text-xs">Director, HopeNGO</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center
        bg-white px-6 py-12 sm:px-12 lg:px-16">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-800">SevaLink</span>
        </div>

        <div className="w-full max-w-sm">

          {/* ── Email verification mode ── */}
          {verificationMode ? (
            <EmailVerification 
              email={verificationEmail}
              loading={loading}
              onVerified={() => {
                // After verification, redirect to sign in
                setVerificationMode(false);
                setIsLogin(true);
                setForm({ name: '', email: '', password: '', role: 'volunteer' });
                setError('Email verified! Please sign in with your credentials.');
              }}
              onBack={() => {
                setVerificationMode(false);
                setForm({ name: '', email: '', password: '', role: 'volunteer' });
              }}
            />
          ) : forgotMode ? (
            <ForgotPassword onBack={() => setForgotMode(false)} />
          ) : (
          <>
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome back 👋' : 'Join SevaLink 🌱'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account and start making a difference'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-7 gap-1">
            {['Log In', 'Sign Up'].map((label, i) => (
              <button key={label} type="button" onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isLogin === (i === 0)
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <FloatingInput label="Full Name" name="name" value={form.name}
                onChange={handleChange} placeholder="Jane Doe" />
            )}

            <FloatingInput label="Email address" name="email" type="email"
              value={form.email} onChange={handleChange} placeholder="you@example.com" />

            <PasswordInput value={form.password} onChange={handleChange} />

            {/* Forgot password link — only on login */}
            {isLogin && (
              <div className="text-right -mt-1">
                <button type="button" onClick={() => setForgotMode(true)}
                  className="text-xs text-emerald-600 font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">I am joining as</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      form.role === r.value
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <span className="text-sm font-semibold text-gray-800">{r.label}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70
                text-white font-semibold rounded-xl text-sm transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
                flex items-center justify-center gap-2 shadow-md shadow-emerald-100 hover:shadow-emerald-200">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
                : isLogin ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={switchMode} className="text-emerald-600 font-semibold hover:underline">
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
          </>
          )}
        </div>
      </div>
    </div>{/* end flex-1 panels row */}

      {/* ── Auth page footer ── */}
      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
