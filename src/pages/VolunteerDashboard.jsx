import { useState, useEffect } from 'react';
import TaskListPage from './TaskListPage';
import RecommendedTasksPage from './RecommendedTasksPage';
import MapPage from './MapPage';
import ProfilePage from './ProfilePage';
import MyTasksPage from './MyTasksPage';
import { useTaskStore } from '../context/TaskStore';
import { useAuth } from '../context/AuthContext';
import { db, doc, getDoc } from '../firebase';
import { getRecommendations } from '../utils/matchEngine';

const URGENCY_COLOR = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };
const URGENCY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
};

function MiniTaskCard({ rec, onAccept, isAccepted }) {
  const { task, score, matchedSkills } = rec;
  const isTop = score >= 5;
  return (
    <div className={`relative bg-white rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md
      ${isTop ? 'border-emerald-200 ring-1 ring-emerald-200' : 'border-gray-100'}`}>
      {isTop && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
          🏆 Best
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: URGENCY_COLOR[task.urgencyLevel] + '20' }}>
          {task.urgencyLevel === 'Critical' ? '🚨' : task.urgencyLevel === 'High' ? '🔥' : task.urgencyLevel === 'Medium' ? '📌' : '🌱'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-gray-800 text-sm leading-snug">{task.title}</h4>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${URGENCY_BADGE[task.urgencyLevel]}`}>
              {task.urgencyLevel}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <span>📍</span>{task.location}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {score} pts
              </span>
              {matchedSkills.length > 0 && (
                <span className="text-xs text-gray-400">{matchedSkills.length} skill{matchedSkills.length > 1 ? 's' : ''} match</span>
              )}
            </div>
            {isAccepted ? (
              <span className="text-xs text-emerald-600 font-bold">✓ Accepted</span>
            ) : (
              <button onClick={() => onAccept(task.id)}
                className="text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 rounded-xl active:scale-95 transition-all shadow-sm shadow-emerald-200">
                Accept
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewPage({ onNavigate }) {
  const [localAccepted, setLocalAccepted] = useState(new Set());
  const { accepted, completed, submissions, tasks, acceptTask } = useTaskStore();
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState(null);

  const acceptedCount  = accepted.size;
  const completedCount = completed.size;
  const pendingCount   = submissions.filter(s => s.status === 'pending').length;
  const openCount      = tasks.filter(t => t.status === 'Pending' || t.status === 'Open').length;

  // Fetch volunteer profile for recommendations
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setVolunteer({ skills: d.skills || [], location: d.location || d.city || '' });
      }
    }).catch(() => {});
  }, [user?.uid]);

  const recommendations = volunteer ? getRecommendations(volunteer, tasks).slice(0, 5) : [];

  const handleAccept = (id) => {
    acceptTask(id);
    setLocalAccepted(p => new Set([...p, id]));
  };

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #8b5cf6 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-6 left-1/4 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌿</span>
            <p className="text-white/90 text-sm font-semibold">Good morning!</p>
          </div>
          <h2 className="text-2xl font-bold mb-1">Ready to make an impact?</h2>
          <p className="text-white/75 text-sm mb-4">
            {pendingCount > 0 ? `${pendingCount} pending approval · ` : ''}{openCount} open tasks available
          </p>
          <button onClick={() => onNavigate('available')}
            className="bg-white text-emerald-600 font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg active:scale-95">
            Browse Tasks →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Accepted',    value: acceptedCount,          icon: '✅', bg: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-200', tab: 'accepted'    },
          { label: 'Completed',   value: completedCount,         icon: '🏆', bg: 'from-blue-400 to-indigo-500',   shadow: 'shadow-blue-200',    tab: 'completed'   },
          { label: 'Pending',     value: pendingCount,           icon: '⏳', bg: 'from-orange-400 to-rose-500',   shadow: 'shadow-orange-200',  tab: 'pending'     },
          { label: 'Recommended', value: recommendations.length, icon: '⭐', bg: 'from-purple-400 to-pink-500',   shadow: 'shadow-purple-200',  tab: 'recommended' },
        ].map(s => (
          <button key={s.label}
            onClick={() => onNavigate(s.tab)}
            className={`relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br ${s.bg} shadow-lg ${s.shadow} text-left active:scale-95 transition-all`}>
            <div className="absolute -top-3 -right-3 w-14 h-14 bg-white/15 rounded-full" />
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-white/80 font-medium">{s.label}</div>
            <div className="text-[10px] text-white/60 mt-0.5">Tap to view</div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '📋', label: 'Tasks',   key: 'available',   bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            { icon: '🗺️', label: 'Map',     key: 'map',         bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100'    },
            { icon: '⭐', label: 'For You', key: 'recommended', bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100'  },
            { icon: '👤', label: 'Profile', key: 'profile',     bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100'  },
          ].map(item => (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${item.bg} ${item.border} active:scale-95 transition-all`}>
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-bold ${item.text}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Recommended Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">Top Picks for You</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                🤖 AI Recommended
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Tasks recommended based on your skills, location, and urgency.
            </p>
          </div>
          <button onClick={() => onNavigate('recommended')}
            className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors shrink-0">
            See all →
          </button>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-sm font-bold text-gray-700">No recommendations yet</p>
            <p className="text-xs text-gray-400 mt-1">Add skills to your profile to get matched</p>
            <button onClick={() => onNavigate('profile')}
              className="mt-3 text-xs font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full hover:bg-purple-200 transition-colors">
              Update Profile →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(rec => (
              <MiniTaskCard
                key={rec.task.id}
                rec={rec}
                isAccepted={accepted.has(rec.task.id) || localAccepted.has(rec.task.id)}
                onAccept={handleAccept}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VolunteerDashboard({ activeView, onNavigate, searchQuery = '' }) {
  if (activeView === 'available')   return <TaskListPage initialSearch={searchQuery} />;
  if (activeView === 'recommended') return <RecommendedTasksPage />;
  if (activeView === 'map')         return <MapPage />;
  if (activeView === 'profile')     return <ProfilePage />;
  if (activeView === 'mytasks')     return <MyTasksPage />;
  // Handle direct tab navigation from stats cards
  if (activeView === 'accepted')    return <MyTasksPage initialTab="accepted" />;
  if (activeView === 'completed')   return <MyTasksPage initialTab="completed" />;
  if (activeView === 'pending')     return <MyTasksPage initialTab="pending" />;
  return <OverviewPage onNavigate={onNavigate} />;
}
