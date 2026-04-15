import { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, getDocs, query, where } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { sendNotification } from '../utils/useNotifications';

const URGENCY_OPTIONS = [
  { value: 'Low',      label: 'Low',      icon: '🌱', color: 'text-green-600 bg-green-50 border-green-200',   ring: 'ring-green-400'  },
  { value: 'Medium',   label: 'Medium',   icon: '📌', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', ring: 'ring-yellow-400' },
  { value: 'High',     label: 'High',     icon: '🔥', color: 'text-orange-600 bg-orange-50 border-orange-200', ring: 'ring-orange-400' },
  { value: 'Critical', label: 'Critical', icon: '🚨', color: 'text-red-600 bg-red-50 border-red-200',          ring: 'ring-red-400'    },
];

const SKILL_SUGGESTIONS = [
  'Teaching', 'Medical', 'Food Distribution', 'First Aid', 'Driving',
  'Logistics', 'Communication', 'IT Support', 'Construction', 'Social Work',
  'Agriculture', 'Finance', 'Marketing', 'Counselling', 'Physical Fitness',
];

const EMPTY_FORM = {
  title: '', description: '', location: '',
  urgencyLevel: '', skills: [], skillInput: '',
};

const inputCls = (err) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
  }`;

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-semibold text-gray-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

export default function CreateTaskPage({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 20) return;
    setForm(p => ({ ...p, skills: [...p.skills, s], skillInput: '' }));
  };

  const removeSkill = (skill) =>
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(form.skillInput); }
    if (e.key === 'Backspace' && !form.skillInput && form.skills.length)
      setForm(p => ({ ...p, skills: p.skills.slice(0, -1) }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title         = 'Task title is required.';
    if (!form.description.trim()) e.description   = 'Description is required.';
    if (!form.location.trim())    e.location      = 'Location is required.';
    if (!form.urgencyLevel)       e.urgencyLevel  = 'Please select an urgency level.';
    if (form.skills.length === 0) e.skills        = 'At least one required skill must be added.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title:          form.title.trim(),
        description:    form.description.trim(),
        location:       form.location.trim(),
        urgency:        form.urgencyLevel,
        requiredSkills: form.skills,
        status:         'Pending',
        volunteers:     0,
        acceptedBy:     [],
        createdBy:      user?.uid ?? null,
        createdAt:      serverTimestamp(),
      });

      // Notify all volunteers about the new task
      try {
        const volunteersSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'volunteer'))
        );
        const notifPromises = volunteersSnap.docs.map(d =>
          sendNotification({
            userId: d.id,
            type:   'task_posted',
            title:  `New Task Available: ${form.title.trim()}`,
            body:   `📍 ${form.location.trim()} · ${form.urgencyLevel} urgency · Skills: ${form.skills.slice(0, 2).join(', ')}${form.skills.length > 2 ? '...' : ''}`,
          })
        );
        await Promise.all(notifPromises);
        console.log(`[CreateTask] Notified ${volunteersSnap.size} volunteers`);
      } catch (notifErr) {
        console.warn('[CreateTask] Notification error (non-fatal):', notifErr.message);
      }

      setSubmitted(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      console.error('[CreateTask] Firestore error:', err);
      setErrors({ submit: 'Failed to post task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5 shadow-lg shadow-emerald-100">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Task Posted!</h2>
        <p className="text-sm text-gray-500 mt-2">Volunteers will be notified shortly.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Saved to Firestore
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl shadow-md shadow-emerald-100">
            ➕
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Post a New Task</h2>
            <p className="text-sm text-gray-400">Fill in the details to connect with volunteers.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Title */}
        <Field label="Task Title" required error={errors.title}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Food Distribution Drive"
            className={inputCls(errors.title)}
          />
        </Field>

        {/* Description */}
        <Field label="Description" required error={errors.description}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe what volunteers need to do, any special requirements, etc."
            className={`${inputCls(errors.description)} resize-none`}
          />
        </Field>

        {/* Location */}
        <Field label="Location" required error={errors.location}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Sector 12, New Delhi"
              className={`${inputCls(errors.location)} pl-9`}
            />
          </div>
        </Field>

        {/* Urgency */}
        <Field label="Urgency Level" required error={errors.urgencyLevel}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {URGENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setForm(p => ({ ...p, urgencyLevel: opt.value })); setErrors(p => ({ ...p, urgencyLevel: '' })); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  form.urgencyLevel === opt.value
                    ? `${opt.color} border-current ring-2 ring-offset-1 ${opt.ring}`
                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Skills */}
        <Field label="Required Skills" required hint="Press Enter or comma to add" error={errors.skills}>
          <div className={`flex flex-wrap gap-1.5 px-3 py-2.5 border rounded-xl min-h-[46px] focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent transition-all bg-gray-50 focus-within:bg-white ${
            errors.skills ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}>
            {form.skills.map(s => (
              <span key={s} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {s}
                <button type="button" onClick={() => { removeSkill(s); }} className="hover:text-emerald-900 leading-none text-base">×</button>
              </span>
            ))}
            <input
              value={form.skillInput}
              onChange={e => { setForm(p => ({ ...p, skillInput: e.target.value })); if (errors.skills) setErrors(p => ({ ...p, skills: '' })); }}
              onKeyDown={handleSkillKeyDown}
              placeholder={form.skills.length === 0 ? 'e.g. medical, teaching...' : ''}
              className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
              <button key={s} type="button" onClick={() => { addSkill(s); setErrors(p => ({ ...p, skills: '' })); }}
                className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5 hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white">
                + {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
            ⚠ {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-100 active:scale-95"
          >            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Posting…</>
              : '🚀 Post Task'
            }
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
