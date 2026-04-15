import React, { useState, useEffect, useRef } from 'react';
import CreateTaskPage from './CreateTaskPage';
import NgoMapPage from './NgoMapPage';
import { useTaskStore } from '../context/TaskStore';
import { useAuth } from '../context/AuthContext';
import { auth, db, doc, getDoc, setDoc, collection, getDocs, query, where } from '../firebase';

// ── Proof review card ─────────────────────────────────────────────────────────
function ProofCard({ sub, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]     = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
      <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-gray-800 text-sm">{sub.taskTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">Submitted at {sub.submittedAt}</p>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full shrink-0">⏳ Pending</span>
        </div>
        {sub.photo && (
          <img src={sub.photo} alt="proof" className="w-full h-44 object-cover rounded-xl mb-3 border border-gray-100" />
        )}
        {sub.location && (
          <div className="flex items-center gap-2 mb-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <span>📍</span>
            <span className="text-xs font-mono text-blue-700 flex-1 truncate">{sub.location}</span>
            <a href={`https://www.google.com/maps?q=${sub.location}`} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 font-semibold hover:underline shrink-0">View →</a>
          </div>
        )}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
          <p className="text-xs font-bold text-gray-500 mb-1">Volunteer's Comment</p>
          <p className="text-sm text-gray-700 leading-relaxed">{sub.comment}</p>
        </div>
        {showReject ? (
          <div className="space-y-2">
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
            <div className="flex gap-2">
              <button onClick={() => setShowReject(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm">Cancel</button>
              <button onClick={() => onReject(sub.id, rejectReason)}
                className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl text-sm">Confirm Reject</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowReject(true)}
              className="flex-1 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50">✗ Reject</button>
            <button onClick={() => onApprove(sub.id)}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-sm active:scale-95 shadow-md shadow-emerald-100">✓ Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NGO Task card ─────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  'Open':        { bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700'      },
  'In Progress': { bar: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700'  },
  'Completed':   { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
};
const URGENCY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
};

function NgoTaskCard({ task }) {
  const st = STATUS_STYLE[task.status] || STATUS_STYLE['Open'];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className={`h-1 w-full ${st.bar}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-bold text-gray-800 text-sm leading-snug">{task.title}</h4>
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${URGENCY_BADGE[task.urgencyLevel]}`}>
            {task.urgencyLevel}
          </span>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
          <span>📍</span>{task.location}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.badge}`}>{task.status}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span>👥</span>{task.volunteers || 0} joined
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Analytics page ────────────────────────────────────────────────────────────
function AnalyticsPage({ tasks, pendingSubmissions, completedTasks }) {
  const totalVolunteers = tasks.reduce((sum, t) => sum + (t.volunteers || 0), 0);
  const completionRate  = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const urgencyData = [
    { label: 'Critical', count: tasks.filter(t => t.urgencyLevel === 'Critical').length, color: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-600'    },
    { label: 'High',     count: tasks.filter(t => t.urgencyLevel === 'High').length,     color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Medium',   count: tasks.filter(t => t.urgencyLevel === 'Medium').length,   color: 'bg-yellow-400', light: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Low',      count: tasks.filter(t => t.urgencyLevel === 'Low').length,      color: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-600'  },
  ];

  const statusData = [
    { label: 'Open',        count: tasks.filter(t => t.status === 'Open').length,        color: 'bg-blue-500'    },
    { label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: 'bg-purple-500'  },
    { label: 'Completed',   count: completedTasks.length,                                color: 'bg-emerald-500' },
  ];

  const maxUrgency = Math.max(...urgencyData.map(d => d.count), 1);
  const maxVolunteers = Math.max(...tasks.map(t => t.volunteers || 0), 1);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-semibold mb-1">📊 Impact Overview</p>
          <h2 className="text-2xl font-bold mb-1">Your NGO Analytics</h2>
          <p className="text-white/70 text-sm">Real-time data from your posted tasks</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Tasks',        value: tasks.length,          icon: '📋', bg: 'from-blue-400 to-indigo-500',  shadow: 'shadow-blue-200'    },
          { label: 'Volunteers Reached', value: totalVolunteers,       icon: '🙋', bg: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
          { label: 'Completed',          value: completedTasks.length, icon: '✅', bg: 'from-purple-400 to-pink-500',  shadow: 'shadow-purple-200'  },
          { label: 'Completion Rate',    value: `${completionRate}%`,  icon: '📈', bg: 'from-orange-400 to-rose-500',  shadow: 'shadow-orange-200'  },
        ].map((s) => (
          <div key={s.label}
            className={`relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br ${s.bg} shadow-lg ${s.shadow}`}>
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/15 rounded-full" />
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-white/80 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Urgency breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-base">🔥</span>
          Tasks by Urgency
        </h3>
        <div className="space-y-3">
          {urgencyData.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.light} ${d.text}`}>{d.label}</span>
                <span className="text-xs font-bold text-gray-600">{d.count} task{d.count !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${d.color} transition-all duration-700`}
                  style={{ width: `${(d.count / maxUrgency) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-base">📌</span>
          Task Status
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {statusData.map((s) => (
            <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
              <div className="text-xl font-bold text-gray-800">{s.count}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof submissions summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-base">⏳</span>
          Proof Submissions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pending Review', value: pendingSubmissions.length, color: 'text-amber-600 bg-amber-50 border-amber-100'     },
            { label: 'Approved',       value: completedTasks.length,     color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top tasks by volunteers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-base">🙋</span>
          Most Popular Tasks
        </h3>
        <div className="space-y-3">
          {[...tasks]
            .sort((a, b) => (b.volunteers || 0) - (a.volunteers || 0))
            .slice(0, 5)
            .map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${((t.volunteers || 0) / maxVolunteers) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500 shrink-0">{t.volunteers || 0}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── NGO Profile page ──────────────────────────────────────────────────────────
const NGO_INITIAL = {
  name:    '',
  email:   '',
  phone:   '',
  city:    '',
  website: '',
  mission: '',
  photo:   null,
};

function NgoProfilePage({ tasks }) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    website: '',
    mission: '',
    photo: null,
  });
  const [draft, setDraft] = useState(form);
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const fileRef = useRef(null);

  // Fetch NGO data from Firestore on mount
  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('[NgoProfilePage] No authenticated user');
          setLoading(false);
          return;
        }

        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            name:    data.organizationName || data.name    || '',
            email:   data.email            || '',
            phone:   data.phoneNumber      || data.phone   || '',
            city:    data.city             || '',
            website: data.website          || '',
            mission: data.missionStatement || data.bio     || '',
            photo:   data.photoUrl         || data.photo   || null,
          });
        }
      } catch (err) {
        console.error('[NgoProfilePage] Error fetching NGO data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNgoData();
  }, []);

  const completedCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
  const totalVolunteers = tasks.reduce((s, t) => s + (t.volunteers || 0), 0);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(p => ({ ...p, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const validate = (d) => {
    const e = {};
    if (!d.name.trim()) e.name = 'Organisation name is required.';
    if (!d.email.trim() || !/\S+@\S+\.\S+/.test(d.email)) e.email = 'Valid email is required.';
    if (!d.phone.trim()) e.phone = 'Phone is required.';
    if (!d.city.trim()) e.city = 'City is required.';
    if (!d.mission.trim()) e.mission = 'Mission statement is required.';
    return e;
  };

  const save = async () => {
    const errs = validate(draft);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setSaveLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), {
        organizationName: draft.name,
        name:             draft.name,
        email:            draft.email,
        phoneNumber:      draft.phone,
        phone:            draft.phone,
        city:             draft.city,
        website:          draft.website,
        missionStatement: draft.mission,
        bio:              draft.mission,
        photo:            draft.photo,
      }, { merge: true });

      setForm(draft);
      setErrors({});
      setEditing(false);
      console.info('[NgoProfilePage] Profile updated successfully');
    } catch (err) {
      console.error('[NgoProfilePage] Error saving profile:', err);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all ${
      err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-7 text-white"
        style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="relative shrink-0">
            {form.photo ? (
              <img src={form.photo} alt="logo" className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/20" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-xl">
                🏢
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-indigo-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-xl font-bold">{form.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-indigo-200">
              <span>📍 {form.city}</span>
              <span>✉️ {form.email}</span>
              {form.website && <span>🌐 {form.website}</span>}
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed pt-1 line-clamp-2">{form.mission}</p>
          </div>

          <button onClick={() => { setDraft(form); setErrors({}); setEditing(true); }}
            className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all backdrop-blur-sm">
            ✏️ Edit
          </button>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          {[
            { label: 'Tasks Posted',  value: tasks.length      },
            { label: 'Completed',     value: completedCount    },
            { label: 'Volunteers',    value: totalVolunteers   },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-indigo-200 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit NGO Profile</h3>
              <button onClick={() => setEditing(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-7 py-5 space-y-4 flex-1">
              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Organisation Logo</label>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {draft.photo
                      ? <img src={draft.photo} alt="preview" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200" />
                      : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl">🏢</div>
                    }
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    <button type="button" onClick={() => fileRef.current.click()}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl text-sm text-gray-500 hover:text-indigo-600 transition-all font-medium">
                      📷 Upload Logo
                    </button>
                  </div>
                </div>
              </div>

              {[
                { key: 'name',    label: 'Organisation Name', type: 'text',  placeholder: 'GreenHope Foundation' },
                { key: 'email',   label: 'Email',             type: 'email', placeholder: 'contact@ngo.org'      },
                { key: 'phone',   label: 'Phone',             type: 'tel',   placeholder: '+91 11 2345 6789'     },
                { key: 'city',    label: 'City',              type: 'text',  placeholder: 'New Delhi'            },
                { key: 'website', label: 'Website (optional)',type: 'text',  placeholder: 'www.ngo.org'          },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    {f.label}{f.key !== 'website' && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input type={f.type} value={draft[f.key]}
                    onChange={e => setDraft(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={inputCls(errors[f.key])} />
                  {errors[f.key] && <p className="text-xs text-red-500 mt-1">⚠ {errors[f.key]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mission Statement <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={draft.mission}
                  onChange={e => setDraft(p => ({ ...p, mission: e.target.value }))}
                  placeholder="Describe your NGO's mission…"
                  className={`${inputCls(errors.mission)} resize-none`} />
                {errors.mission && <p className="text-xs text-red-500 mt-1">⚠ {errors.mission}</p>}
              </div>
            </div>
            <div className="flex gap-3 px-7 py-5 border-t border-gray-100">
              <button onClick={() => setEditing(false)} disabled={saveLoading}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm disabled:opacity-50">
                Cancel
              </button>
              <button onClick={save} disabled={saveLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                {saveLoading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent tasks summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">📋</span>
          Recent Tasks
        </h3>
        <div className="space-y-3">
          {tasks.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                t.status === 'Closed' ? 'bg-gray-400' :
                t.status === 'Completed' ? 'bg-emerald-500' :
                t.status === 'In Progress' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
              <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                t.status === 'Closed'      ? 'bg-gray-100 text-gray-500' :
                t.status === 'Completed'   ? 'bg-emerald-100 text-emerald-700' :
                t.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                                             'bg-blue-100 text-blue-700'
              }`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NgoDashboard({ activeView, onNavigate }) {
  const { tasks, pendingSubmissions, approveSubmission, rejectSubmission, closeTask } = useTaskStore();
  const { user } = useAuth();

  // Show only tasks created by this NGO (filter by createdBy)
  const myTasks = tasks.filter(t =>
    t.createdBy === user?.uid || t.createdBy === null // include demo tasks
  );

  const activeTasks    = myTasks.filter(t => t.status !== 'Completed' && t.status !== 'Closed');
  const completedTasks = myTasks.filter(t => t.status === 'Completed' || t.status === 'Closed');

  if (activeView === 'create') {
    return <CreateTaskPage onSuccess={() => onNavigate('tasks')} onCancel={() => onNavigate('tasks')} />;
  }

  if (activeView === 'profile') {
    return <NgoProfilePage tasks={myTasks} />;
  }

  if (activeView === 'tasks') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-sm text-gray-400 mt-0.5">{myTasks.length} total · {completedTasks.length} completed</p>
          </div>
          <button onClick={() => onNavigate('create')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-100 active:scale-95 transition-all">
            + New Task
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {myTasks.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className={`h-1 w-full ${
                t.status === 'Closed'      ? 'bg-gray-400' :
                t.status === 'Completed'   ? 'bg-emerald-500' :
                t.status === 'In Progress' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-gray-800 text-sm leading-snug">{t.title}</h4>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${URGENCY_BADGE[t.urgencyLevel]}`}>
                    {t.urgencyLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <span>📍</span>{t.location}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    t.status === 'Closed'      ? 'bg-gray-100 text-gray-500' :
                    t.status === 'Completed'   ? 'bg-emerald-100 text-emerald-700' :
                    t.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                                                 'bg-blue-100 text-blue-700'
                  }`}>{t.status}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span>👥</span>{t.volunteers || 0}
                    </span>
                    {t.status === 'Completed' && (
                      <button onClick={() => closeTask(t.id)}
                        className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors active:scale-95">
                        🔒 Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeView === 'approvals') {
    return (
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-semibold mb-1">⏳ Review Queue</p>
            <h2 className="text-2xl font-bold mb-1">Pending Approvals</h2>
            <p className="text-white/70 text-sm">{pendingSubmissions.length} submission{pendingSubmissions.length !== 1 ? 's' : ''} awaiting your review</p>
          </div>
        </div>
        {pendingSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-bold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No pending proof submissions right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingSubmissions.map((sub) => (
              <ProofCard key={sub.id} sub={sub} onApprove={approveSubmission} onReject={rejectSubmission} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeView === 'analytics') {
    return <AnalyticsPage tasks={myTasks} pendingSubmissions={pendingSubmissions} completedTasks={completedTasks} />;
  }

  if (activeView === 'map') {
    return <NgoMapPage />;
  }

  // ── Default: overview ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 left-1/4 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏢</span>
            <p className="text-white/90 text-sm font-semibold">NGO Dashboard</p>
          </div>
          <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
          <p className="text-white/75 text-sm mb-4">
            {pendingSubmissions.length > 0
              ? `${pendingSubmissions.length} proof${pendingSubmissions.length > 1 ? 's' : ''} need your review`
              : `${activeTasks.length} active tasks · ${completedTasks.length} completed`}
          </p>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('create')}
              className="bg-white text-indigo-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
              + Post Task
            </button>
            {pendingSubmissions.length > 0 && (
              <button onClick={() => onNavigate('approvals')}
                className="bg-white/20 backdrop-blur text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors border border-white/30 active:scale-95">
                Review {pendingSubmissions.length} Proof{pendingSubmissions.length > 1 ? 's' : ''} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending approvals alert */}
      {pendingSubmissions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">📤</div>
            <div>
              <p className="font-bold text-sm">{pendingSubmissions.length} proof{pendingSubmissions.length > 1 ? 's' : ''} awaiting review</p>
              <p className="text-white/80 text-xs">Volunteers waiting for approval</p>
            </div>
          </div>
          <button onClick={() => onNavigate('approvals')}
            className="shrink-0 bg-white text-orange-600 font-bold text-xs px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-md active:scale-95">
            Review →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active',    value: activeTasks.length,        icon: '📋', bg: 'from-blue-400 to-indigo-500',   shadow: 'shadow-blue-200',   nav: 'tasks'     },
          { label: 'Completed', value: completedTasks.length,     icon: '✅', bg: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-200',nav: 'tasks'     },
          { label: 'Pending',   value: pendingSubmissions.length, icon: '⏳', bg: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-200',  nav: 'approvals' },
        ].map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.nav)}
            className={`relative overflow-hidden rounded-2xl p-3.5 text-white bg-gradient-to-br ${s.bg} shadow-lg ${s.shadow} text-left active:scale-95 transition-all`}>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white/15 rounded-full" />
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[10px] text-white/80 font-semibold">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '➕', label: 'Post',      key: 'create',    bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            { icon: '📝', label: 'My Tasks',  key: 'tasks',     bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100'    },
            { icon: '🗺️', label: 'Map',       key: 'map',       bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-100'    },
            { icon: '📊', label: 'Analytics', key: 'analytics', bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100'  },
          ].map((item) => (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${item.bg} ${item.border} active:scale-95 transition-all`}>
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-bold ${item.text}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Recent Tasks</h3>
          <button onClick={() => onNavigate('tasks')}
            className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {myTasks.slice(0, 4).map((t) => <NgoTaskCard key={t.id} task={t} />)}
        </div>
      </div>
    </div>
  );
}
