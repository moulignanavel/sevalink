import { useState, useRef, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc } from '../firebase';
import { useTaskStore } from '../context/TaskStore';

const ALL_SKILLS = [
  'Teaching', 'Medical', 'Food Distribution', 'First Aid', 'Communication',
  'Driving', 'Logistics', 'IT Support', 'Physical Fitness', 'Photography',
  'Cooking', 'Counselling', 'Legal Aid', 'Construction', 'Fundraising',
  'Social Work', 'Agriculture', 'Finance', 'Marketing', 'Environmental',
];

const BADGES = [
  { icon: '🌟', label: 'First Task',    earned: true  },
  { icon: '🔥', label: '3-Task Streak', earned: true  },
  { icon: '🏆', label: 'Top Volunteer', earned: false },
  { icon: '💎', label: '10 Completed',  earned: false },
  { icon: '🌍', label: 'Multi-City',    earned: false },
  { icon: '❤️', label: 'Life Saver',    earned: false },
];

const STATUS_STYLE  = { Completed: 'bg-emerald-100 text-emerald-700', Accepted: 'bg-blue-100 text-blue-700', Pending: 'bg-yellow-100 text-yellow-700', Closed: 'bg-gray-100 text-gray-500' };
const URGENCY_DOT   = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-400', Low: 'bg-green-500' };

// ── reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all ${
    err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
  }`;

// ── age from dob ──────────────────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', city: '', bio: '', photo: null });
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(form);
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const fileRef = useRef(null);

  // Real task history from TaskStore
  const { tasks, accepted, completed, closed } = useTaskStore();
  const myTaskHistory = tasks
    .filter(t => accepted.has(t.id) || completed.has(t.id) || closed.has(t.id))
    .map(t => ({
      id:      t.id,
      title:   t.title,
      date:    t.createdAt?.toDate?.()
               ? t.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
               : 'Recently',
      status:  closed.has(t.id) ? 'Closed' : completed.has(t.id) ? 'Completed' : 'Accepted',
      urgency: t.urgencyLevel || 'Low',
    }));

  // Real stats
  const acceptedCount  = accepted.size;
  const completedCount = completed.size;

  // Fetch user data from Firestore on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('[ProfilePage] No authenticated user');
          setLoading(false);
          return;
        }

        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            name:  data.name  || '',
            email: data.email || '',
            phone: data.phone || '',
            dob:   data.dob   || '',
            city:  data.city  || data.location || '',
            bio:   data.bio   || '',
            photo: data.photo || null,
          });
          setSkills(data.skills || []);
        }
      } catch (err) {
        console.error('[ProfilePage] Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleSkill = async (s) => {
    const updated = skills.includes(s)
      ? skills.filter(x => x !== s)
      : [...skills, s];
    setSkills(updated);

    // Save skills + location to Firestore immediately on toggle
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, 'users', user.uid), {
        skills:   updated,
        location: form.city,
      }, { merge: true });
    } catch (err) {
      console.error('[ProfilePage] Error saving skills:', err);
    }
  };

  // ── photo pick ──────────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft((p) => ({ ...p, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  // ── validation ──────────────────────────────────────────────────────────
  const validate = (d) => {
    const e = {};
    if (!d.name.trim()) e.name = 'Full name is required.';
    if (!d.email.trim() || !/\S+@\S+\.\S+/.test(d.email)) e.email = 'Valid email is required.';
    if (!d.phone.trim()) e.phone = 'Phone number is required.';
    if (!d.dob) e.dob = 'Date of birth is required.';
    if (!d.city.trim()) e.city = 'City is required.';
    if (!d.bio.trim()) e.bio = 'Bio is required.';
    return e;
  };

  const saveProfile = async () => {
    const errs = validate(draft);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setSaveLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name:     draft.name,
        email:    draft.email,
        phone:    draft.phone,
        dob:      draft.dob,
        city:     draft.city,
        location: draft.city,   // alias used for task matching
        bio:      draft.bio,
        photo:    draft.photo,
        skills:   skills,
      }, { merge: true });

      setForm(draft);
      setErrors({});
      setEditing(false);
      console.info('[ProfilePage] Profile updated successfully');
    } catch (err) {
      console.error('[ProfilePage] Error saving profile:', err);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const openEdit = () => { setDraft(form); setErrors({}); setEditing(true); };

  const age = calcAge(form.dob);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-7 text-white">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {form.photo ? (
              <img src={form.photo} alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/20" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl font-bold shadow-xl">
                {form.name[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-xl font-bold">{form.name}{age && <span className="text-gray-400 font-normal text-sm ml-2">· {age} yrs</span>}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {form.city}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {form.email}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                {form.phone}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed pt-1 line-clamp-2">{form.bio}</p>
          </div>

          {/* Edit btn */}
          <button onClick={openEdit}
            className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20
              text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          {[
            { label: 'Tasks Done',   value: completedCount },
            { label: 'Accepted',     value: acceptedCount  },
            { label: 'Task History', value: myTaskHistory.length },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
              <button onClick={() => setEditing(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-7 py-5 space-y-5 flex-1">

              {/* Photo upload */}
              <Field label="Profile Photo" required>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {draft.photo ? (
                      <img src={draft.photo} alt="preview"
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-bold text-white">
                        {draft.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    <button type="button" onClick={() => fileRef.current.click()}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl text-sm text-gray-500 hover:text-emerald-600 transition-all font-medium">
                      📷 Upload Photo
                    </button>
                    <p className="text-xs text-gray-400 mt-1 text-center">JPG, PNG · max 5MB</p>
                  </div>
                </div>
              </Field>

              {/* Name */}
              <Field label="Full Name" required error={errors.name}>
                <input type="text" value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className={inputCls(errors.name)} />
              </Field>

              {/* Email */}
              <Field label="Email Address" required error={errors.email}>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <input type="email" value={draft.email}
                    onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`${inputCls(errors.email)} pl-10`} />
                </div>
              </Field>

              {/* Phone */}
              <Field label="Phone Number" required error={errors.phone}>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <input type="tel" value={draft.phone}
                    onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={`${inputCls(errors.phone)} pl-10`} />
                </div>
              </Field>

              {/* DOB + City side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Birth" required error={errors.dob}>
                  <input type="date" value={draft.dob}
                    onChange={(e) => setDraft((p) => ({ ...p, dob: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputCls(errors.dob)} />
                </Field>
                <Field label="City" required error={errors.city}>
                  <input type="text" value={draft.city}
                    onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
                    placeholder="New Delhi"
                    className={inputCls(errors.city)} />
                </Field>
              </div>

              {/* Bio */}
              <Field label="Bio" required error={errors.bio}>
                <textarea rows={3} value={draft.bio}
                  onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell volunteers and NGOs about yourself…"
                  className={`${inputCls(errors.bio)} resize-none`} />
                <p className="text-xs text-gray-400 mt-1 text-right">{draft.bio.length}/300</p>
              </Field>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-7 py-5 border-t border-gray-100">
              <button onClick={() => setEditing(false)} disabled={saveLoading}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={saveProfile} disabled={saveLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl
                  hover:from-emerald-600 hover:to-teal-600 transition-all text-sm shadow-md shadow-emerald-100 disabled:opacity-60 flex items-center justify-center gap-2">
                {saveLoading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Skills + Badges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800">My Skills</h3>
              <p className="text-xs text-gray-400 mt-0.5">{skills.length} selected · tap to toggle · auto-saved</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{skills.length} active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((s) => {
              const active = skills.includes(s);
              return (
                <button key={s} onClick={() => toggleSkill(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 active:scale-95 ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}>
                  {active ? '✓ ' : ''}{s}
                </button>
              );
            })}
          </div>
          {skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 font-medium">
                📍 Location: <span className="text-gray-600 font-semibold">{form.city || 'Not set'}</span>
                <span className="ml-2 text-gray-400">· Update in Edit Profile</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800">Badges</h3>
            <p className="text-xs text-gray-400 mt-0.5">{BADGES.filter((b) => b.earned).length} of {BADGES.length} earned</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((b) => (
              <div key={b.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                b.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
              }`}>
                <span className="text-2xl">{b.icon}</span>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Task history ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="mb-5">
          <h3 className="font-bold text-gray-800">Task History</h3>
          <p className="text-xs text-gray-400 mt-0.5">{myTaskHistory.length} tasks total</p>
        </div>
        {myTaskHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm font-semibold text-gray-600">No tasks yet</p>
            <p className="text-xs text-gray-400 mt-1">Accept tasks to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTaskHistory.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${URGENCY_DOT[h.urgency] || 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{h.title}</p>
                  <p className="text-xs text-gray-400">{h.date}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[h.status] || 'bg-gray-100 text-gray-500'}`}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
