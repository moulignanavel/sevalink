import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../context/TaskStore';
import { useAuth } from '../context/AuthContext';

const URGENCY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const URGENCY = {
  Critical: { badge: 'bg-red-100 text-red-700',       bar: 'bg-red-500'    },
  High:     { badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  Medium:   { badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
  Low:      { badge: 'bg-green-100 text-green-700',   bar: 'bg-green-500'  },
};
const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

// ── Proof submission modal ────────────────────────────────────────────────────
function ProofModal({ task, onClose, onSubmit }) {
  const [photo, setPhoto]       = useState(null);
  const [comment, setComment]   = useState('');
  const [location, setLocation] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const fileRef = useRef(null);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        setLocLoading(false);
      },
      () => { setLocation('Location unavailable'); setLocLoading(false); }
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo)    { alert('Please upload a proof photo.'); return; }
    if (!comment.trim()) { alert('Please add a comment.'); return; }
    onSubmit({ taskId: task.id, taskTitle: task.title, photo, comment, location });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-bold text-gray-800">Submit Proof of Completion</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mb-4">📤</div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Proof Submitted!</h3>
            <p className="text-sm text-gray-500 mb-4">Your submission is pending NGO approval. You'll be notified once it's reviewed.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Proof Photo <span className="text-red-500">*</span>
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="proof" className="w-full h-48 object-cover rounded-2xl border border-gray-200" />
                  <button type="button" onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors">×</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current.click()}
                  className="w-full h-36 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span className="text-sm font-semibold">Upload Photo</span>
                  <span className="text-xs">JPG, PNG · max 10MB</span>
                </button>
              )}
            </div>

            {/* Geotag */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">GPS Location</label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-mono">
                  {location || 'Not captured yet'}
                </div>
                <button type="button" onClick={getLocation} disabled={locLoading}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0">
                  {locLoading
                    ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : '📍'}
                  {locLoading ? 'Getting…' : 'Get GPS'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Captures your current coordinates as proof of presence</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what you did, any challenges, or notes for the NGO…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all resize-none" />
            </div>

            <button type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 active:scale-95">
              Submit for NGO Approval →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, highlight, onProof }) {
  const { acceptTask, accepted, submissions, completed } = useTaskStore();
  const { user } = useAuth();
  const { badge, bar } = URGENCY[task.urgencyLevel] || URGENCY['Low'];
  const cardRef = useRef(null);

  const isAcceptedByMe    = accepted.has(task.id);
  const isAcceptedByOther = !isAcceptedByMe && Array.isArray(task.acceptedBy) && task.acceptedBy.length > 0 && task.status === 'Accepted';
  const isCompleted       = completed.has(task.id) || task.status === 'Completed';
  const isClosed          = task.status === 'Closed';
  const submission       = submissions.find(s => s.taskId === task.id);
  const isPending        = submission?.status === 'pending';
  const isRejected       = submission?.status === 'rejected';

  useEffect(() => {
    if (highlight) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight]);

  return (
    <div ref={cardRef} className={`group relative bg-white rounded-2xl border overflow-hidden
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col
      ${isCompleted ? 'ring-2 ring-emerald-400 border-emerald-200'
        : isAcceptedByMe ? 'ring-2 ring-blue-300 border-blue-100'
        : isAcceptedByOther ? 'opacity-75 border-gray-200'
        : highlight ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-100'
        : 'border-gray-100'}`}>

      {/* Urgency bar — red pulse for Critical */}
      <div className={`h-1.5 w-full ${bar} ${task.urgencyLevel === 'Critical' ? 'animate-pulse' : ''}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-emerald-700 transition-colors">{task.title}</h3>
          <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${badge}`}>{task.urgencyLevel}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">📍</div>
          <span className="text-xs text-gray-500 font-medium">{task.location}</span>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(task.requiredSkills || []).map(s => (
            <span key={s} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-2.5 py-0.5 font-medium">{s}</span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>👥</span> {task.volunteers || 0} joined
            </span>

            {isClosed ? (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                🔒 Closed
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                🏆 Completed
              </span>
            ) : isPending ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
                ⏳ Awaiting Approval
              </span>
            ) : isAcceptedByMe ? (
              <button onClick={() => onProof(task)}
                className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-4 py-1.5 rounded-full transition-all shadow-md active:scale-95">
                📤 Submit Proof
              </button>
            ) : isAcceptedByOther ? (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                ✓ Already Accepted
              </span>
            ) : (
              <button onClick={() => acceptTask(task.id)}
                className="text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 py-1.5 rounded-full transition-all shadow-md active:scale-95">
                Accept Task
              </button>
            )}
          </div>

          {isRejected && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <p className="text-xs text-red-600 font-medium">❌ Proof rejected{submission.reason ? ` — ${submission.reason}` : ''}</p>
              <button onClick={() => onProof(task)} className="text-xs text-red-600 font-bold hover:underline">Resubmit</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TaskListPage({ initialSearch = '' }) {
  const { tasks, loading } = useTaskStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch]             = useState(initialSearch);
  const [proofTask, setProofTask]       = useState(null);
  const { submitProof }                 = useTaskStore();

  const prevSearch = useRef(initialSearch);
  useEffect(() => {
    if (initialSearch !== prevSearch.current) {
      setSearch(initialSearch);
      prevSearch.current = initialSearch;
    }
  }, [initialSearch]);

  const filtered = tasks
    .filter((t) => activeFilter === 'All' || t.urgencyLevel === activeFilter)
    .filter((t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      (t.requiredSkills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (URGENCY_ORDER[a.urgencyLevel] ?? 4) - (URGENCY_ORDER[b.urgencyLevel] ?? 4));

  const criticalCount = tasks.filter((t) => t.urgencyLevel === 'Critical').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proofTask && (
        <ProofModal
          task={proofTask}
          onClose={() => setProofTask(null)}
          onSubmit={(data) => { submitProof(data); setProofTask(null); }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} tasks · <span className="text-red-500 font-semibold">{criticalCount} critical</span>
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, skills, location…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
              activeFilter === f ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}>
            {f !== 'All' && <span className={`inline-block w-2 h-2 rounded-full mr-1.5 align-middle ${f === 'Critical' ? 'bg-red-500' : f === 'High' ? 'bg-orange-500' : f === 'Medium' ? 'bg-yellow-400' : 'bg-green-500'}`} />}
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <div className="text-6xl mb-4">🔎</div>
          <p className="text-base font-semibold text-gray-500">
            {tasks.length === 0 ? 'No tasks posted yet' : 'No tasks found'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {tasks.length === 0 ? 'NGOs will post tasks soon' : 'Try a different filter or search term'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task}
              highlight={search.trim().length > 0 && task.title.toLowerCase().includes(search.toLowerCase())}
              onProof={setProofTask} />
          ))}
        </div>
      )}
    </div>
  );
}
