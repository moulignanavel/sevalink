import { useState, useRef } from 'react';
import { useTaskStore } from '../context/TaskStore';

const URGENCY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
};
const URGENCY_ICON = { Critical: '🚨', High: '🔥', Medium: '📌', Low: '🌱' };

// ── Proof modal ───────────────────────────────────────────────────────────────
function ProofModal({ task, onClose, onSubmit }) {
  const [photo, setPhoto]           = useState(null);
  const [comment, setComment]       = useState('');
  const [location, setLocation]     = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [done, setDone]             = useState(false);
  const fileRef                     = useRef(null);

  const getGPS = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => { setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`); setLocLoading(false); },
      () => { setLocation('Unavailable'); setLocLoading(false); }
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
    if (!photo)          { alert('Please upload a proof photo.'); return; }
    if (!comment.trim()) { alert('Please add a comment.'); return; }
    onSubmit({ taskId: task.id, taskTitle: task.title, photo, comment, location });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Submit Proof</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{task.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mb-4">📤</div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Submitted!</h3>
            <p className="text-sm text-gray-500 mb-5">Waiting for NGO approval. You'll see it in Pending tab.</p>
            <button onClick={onClose} className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-100">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-5 space-y-4">

            {/* Photo */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Proof Photo <span className="text-red-500">*</span>
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              {photo ? (
                <div className="relative">
                  <img src={photo} alt="proof" className="w-full h-44 object-cover rounded-2xl border border-gray-200" />
                  <button type="button" onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors">
                    ×
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 transition-all active:scale-98">
                  <span className="text-3xl">📷</span>
                  <span className="text-sm font-semibold">Tap to upload photo</span>
                  <span className="text-xs text-gray-300">JPG, PNG · max 10MB</span>
                </button>
              )}
            </div>

            {/* GPS */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">GPS Location</label>
              <div className="flex gap-2">
                <div className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-mono border ${location ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  {location || 'Not captured yet'}
                </div>
                <button type="button" onClick={getGPS} disabled={locLoading}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 active:scale-95">
                  {locLoading ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '📍'}
                  {locLoading ? 'Getting…' : 'Get GPS'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Proves your physical presence at the task location</p>
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
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 active:scale-95">
              Submit for NGO Approval →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, tab, submission, onProof }) {
  const barColor =
    tab === 'accepted'  ? 'bg-emerald-500' :
    tab === 'pending'   ? 'bg-amber-500'   :
    tab === 'closed'    ? 'bg-gray-400'    :
    'bg-blue-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${barColor}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
            {URGENCY_ICON[task.urgencyLevel]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-bold text-gray-800 text-sm leading-snug">{task.title}</h4>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${URGENCY_BADGE[task.urgencyLevel]}`}>
                {task.urgencyLevel}
              </span>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2.5">
              <span>📍</span>{task.location}
            </p>

            <div className="flex items-center justify-between gap-2">
              {tab === 'accepted' && (
                <>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">✅ Accepted</span>
                  <button onClick={() => onProof(task)}
                    className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1.5 rounded-xl active:scale-95 transition-all shadow-sm">
                    📤 Submit Proof
                  </button>
                </>
              )}
              {tab === 'pending' && (
                <>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">⏳ Awaiting NGO</span>
                  <span className="text-xs text-gray-400">Submitted {submission?.submittedAt}</span>
                </>
              )}
              {tab === 'completed' && (
                <>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">🏆 Completed</span>
                  <span className="text-xs font-semibold text-emerald-600">✓ NGO Approved</span>
                </>
              )}
              {tab === 'closed' && (
                <>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">🔒 Closed</span>
                  <span className="text-xs text-gray-400">Task closed by NGO</span>
                </>
              )}
            </div>

            {submission?.status === 'rejected' && (
              <div className="mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <p className="text-xs text-red-600 font-medium truncate">
                  ❌ Rejected{submission.reason ? ` — ${submission.reason}` : ''}
                </p>
                <button onClick={() => onProof(task)} className="text-xs text-red-600 font-bold hover:underline shrink-0">
                  Resubmit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyTasksPage({ initialTab = 'accepted' }) {
  const { tasks, accepted, completed, closed, submissions, submitProof } = useTaskStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [proofTask, setProofTask] = useState(null);

  // Accepted = accepted but NOT pending approval and NOT completed/closed
  const acceptedTasks = tasks.filter((t) => {
    if (!accepted.has(t.id)) return false;
    if (completed.has(t.id) || closed.has(t.id)) return false;
    const sub = submissions.find((s) => s.taskId === t.id);
    if (sub?.status === 'pending') return false;
    return true;
  });

  // Pending = has a pending submission
  const pendingTasks = tasks.filter((t) =>
    submissions.some((s) => s.taskId === t.id && s.status === 'pending')
  );

  // Completed = NGO approved (but not yet closed)
  const completedTasks = tasks.filter((t) => completed.has(t.id) && !closed.has(t.id));

  // Closed = NGO closed the task
  const closedTasks = tasks.filter((t) => closed.has(t.id));

  // Rejected tasks go back to accepted tab
  const rejectedTasks = tasks.filter((t) =>
    submissions.some((s) => s.taskId === t.id && s.status === 'rejected') &&
    !completed.has(t.id) && !closed.has(t.id) &&
    !submissions.some((s) => s.taskId === t.id && s.status === 'pending')
  );

  const allAccepted = [...acceptedTasks, ...rejectedTasks];

  const TABS = [
    { key: 'accepted',  label: 'Accepted',  icon: '✅', count: allAccepted.length,   active: 'bg-emerald-500 text-white shadow-md shadow-emerald-200', inactive: 'bg-white text-gray-500 border border-gray-200' },
    { key: 'pending',   label: 'Pending',   icon: '⏳', count: pendingTasks.length,   active: 'bg-amber-500 text-white shadow-md shadow-amber-200',    inactive: 'bg-white text-gray-500 border border-gray-200' },
    { key: 'completed', label: 'Completed', icon: '🏆', count: completedTasks.length, active: 'bg-blue-500 text-white shadow-md shadow-blue-200',      inactive: 'bg-white text-gray-500 border border-gray-200' },
    { key: 'closed',    label: 'Closed',    icon: '🔒', count: closedTasks.length,    active: 'bg-gray-600 text-white shadow-md shadow-gray-200',      inactive: 'bg-white text-gray-500 border border-gray-200' },
  ];

  const currentTasks =
    activeTab === 'accepted'  ? allAccepted  :
    activeTab === 'pending'   ? pendingTasks :
    activeTab === 'completed' ? completedTasks :
    closedTasks;

  const empty = {
    accepted:  { icon: '📋', title: 'No accepted tasks',       sub: 'Go to Available Tasks and accept one to get started.'         },
    pending:   { icon: '⏳', title: 'No pending approvals',    sub: 'Submit proof for your accepted tasks to see them here.'       },
    completed: { icon: '🏆', title: 'No completed tasks yet',  sub: 'Get NGO approval on your submitted proofs to complete tasks.' },
    closed:    { icon: '🔒', title: 'No closed tasks',         sub: 'Tasks closed by the NGO after completion appear here.'        },
  };

  return (
    <div className="space-y-5">
      {proofTask && (
        <ProofModal task={proofTask} onClose={() => setProofTask(null)}
          onSubmit={(data) => { submitProof(data); setProofTask(null); }} />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-sm text-gray-400 mt-0.5">Track your volunteer journey in real time</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: 'accepted',  label: 'Accepted',  icon: '✅', count: allAccepted.length,   bg: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-200' },
          { key: 'pending',   label: 'Pending',   icon: '⏳', count: pendingTasks.length,   bg: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-200'   },
          { key: 'completed', label: 'Done',      icon: '🏆', count: completedTasks.length, bg: 'from-blue-400 to-indigo-500',   shadow: 'shadow-blue-200'    },
          { key: 'closed',    label: 'Closed',    icon: '🔒', count: closedTasks.length,    bg: 'from-gray-500 to-gray-600',     shadow: 'shadow-gray-200'    },
        ].map((s) => (
          <button key={s.key} onClick={() => setActiveTab(s.key)}
            className={`relative overflow-hidden rounded-2xl p-3 text-white bg-gradient-to-br ${s.bg} shadow-lg ${s.shadow} active:scale-95 transition-all text-left ${activeTab === s.key ? 'ring-2 ring-white ring-offset-2' : 'opacity-75'}`}>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/15 rounded-full" />
            <div className="text-base mb-0.5">{s.icon}</div>
            <div className="text-xl font-bold leading-none">{s.count}</div>
            <div className="text-[9px] text-white/80 font-semibold mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab.key ? tab.active : tab.inactive}`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {currentTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">{empty[activeTab].icon}</div>
          <p className="font-bold text-gray-700 text-base">{empty[activeTab].title}</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs px-4">{empty[activeTab].sub}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentTasks.map((task) => (
            <TaskCard key={task.id} task={task} tab={activeTab}
              submission={submissions.find((s) => s.taskId === task.id)}
              onProof={setProofTask} />
          ))}
        </div>
      )}
    </div>
  );
}
