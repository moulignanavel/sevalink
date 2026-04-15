import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTaskStore } from '../context/TaskStore';
import { db, doc, getDoc } from '../firebase';
import { getRecommendations } from '../utils/matchEngine';

const URGENCY_STYLE = {
  Critical: { bar: 'from-red-500 to-rose-600',      badge: 'bg-red-100 text-red-700',       ring: 'ring-red-200'    },
  High:     { bar: 'from-orange-400 to-orange-600', badge: 'bg-orange-100 text-orange-700', ring: 'ring-orange-200' },
  Medium:   { bar: 'from-yellow-400 to-amber-500',  badge: 'bg-yellow-100 text-yellow-700', ring: 'ring-yellow-200' },
  Low:      { bar: 'from-green-400 to-emerald-500', badge: 'bg-green-100 text-green-700',   ring: 'ring-green-200'  },
};

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 5 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-gray-400';
  return (
    <div className={`w-12 h-12 rounded-2xl ${color} flex flex-col items-center justify-center text-white shadow-md`}>
      <span className="text-lg font-bold leading-none">{score}</span>
      <span className="text-[9px] font-semibold opacity-80">pts</span>
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────────
function RecCard({ rec, rank, onAccept, isAccepted }) {
  const [expanded, setExpanded] = useState(false);
  const { task, score, breakdown, matchedSkills } = rec;
  const { bar, badge, ring } = URGENCY_STYLE[task.urgencyLevel] || URGENCY_STYLE['Low'];
  const isTop = rank === 1;

  return (
    <div className={`relative bg-white rounded-2xl border overflow-hidden flex flex-col
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300
      ${isAccepted ? 'ring-2 ring-emerald-400 border-emerald-200'
        : isTop ? `ring-2 ${ring} border-gray-100`
        : 'border-gray-100'}`}>

      <div className={`h-1.5 bg-gradient-to-r ${bar}`} />

      {isTop && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
          🏆 Best Match
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* AI label */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            🤖 AI Recommended
          </span>
        </div>

        {/* Score + rank */}
        <div className="flex items-center gap-3 mb-4">
          <ScoreBadge score={score} />
          <div>
            <p className="text-xs text-gray-400 font-medium">Rank #{rank}</p>
            <p className="text-sm font-bold text-gray-700">
              {score >= 5 ? 'Excellent fit' : score >= 3 ? 'Good fit' : 'Partial fit'}
            </p>
          </div>
        </div>

        {/* Title + urgency */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-800 text-sm leading-snug">{task.title}</h3>
          <span className={`shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full ${badge}`}>
            {task.urgencyLevel}
          </span>
        </div>

        {/* Location */}
        <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
          <span>📍</span>{task.location}
          {breakdown.locationPoints > 0 && (
            <span className="text-emerald-600 font-bold">· +{breakdown.locationPoints} location</span>
          )}
        </p>

        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>

        {/* Skills with match highlight */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(task.requiredSkills || []).map(s => {
            const matched = matchedSkills.map(x => x.toLowerCase()).includes(s.toLowerCase());
            return (
              <span key={s} className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                matched ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {matched ? '✓ ' : ''}{s}
                {matched && <span className="ml-1 text-emerald-500 font-bold">+2</span>}
              </span>
            );
          })}
        </div>

        {/* Score breakdown toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors mb-3 font-medium">
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Score breakdown
        </button>

        {expanded && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Skill matches</span>
              <span className="font-bold text-blue-600">+{breakdown.skillPoints} pts ({matchedSkills.length} skills × 2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location match</span>
              <span className={`font-bold ${breakdown.locationPoints > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {breakdown.locationPoints > 0 ? `+${breakdown.locationPoints} pts` : '0 pts'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Urgency bonus</span>
              <span className={`font-bold ${breakdown.urgencyPoints > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                {breakdown.urgencyPoints > 0 ? `+${breakdown.urgencyPoints} pts` : '0 pts'}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-bold text-gray-700">Total Score</span>
              <span className="font-bold text-gray-800">{score} pts</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          {isAccepted ? (
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl">
              ✓ Task Accepted
            </div>
          ) : (
            <button onClick={() => onAccept(task.id)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500
                hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl
                transition-all shadow-md shadow-emerald-100 active:scale-95">
              Accept Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecommendedTasksPage() {
  const { user } = useAuth();
  const { tasks, acceptTask, accepted } = useTaskStore();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading]     = useState(true);

  // Fetch volunteer profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setVolunteer({
            skills:   data.skills   || [],
            location: data.location || data.city || '',
            city:     data.city     || data.location || '',
          });
        }
      } catch (err) {
        console.error('[RecommendedTasksPage] Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  const recommendations = volunteer ? getRecommendations(volunteer, tasks) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading recommendations...</p>
      </div>
    );
  }

  if (!volunteer?.skills?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-lg font-bold text-gray-700">No recommendations yet</p>
        <p className="text-sm text-gray-400 mt-1">Add skills to your profile to get matched with tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
              🤖 AI Recommended
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Tasks are recommended based on your skills, location, and urgency.
          </p>
        </div>
        {volunteer.location && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
            <span className="text-sm">📍</span>
            <span className="text-xs font-semibold text-blue-700">{volunteer.location}</span>
          </div>
        )}
      </div>

      {/* Scoring legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Skill match = +2 pts each</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Same location = +2 pts</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> High urgency = +1 pt</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical urgency = +2 pts</span>
      </div>

      {/* Your skills */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mr-1">Your skills</span>
        {volunteer.skills.map(s => (
          <span key={s} className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
            ✓ {s}
          </span>
        ))}
      </div>

      {/* Cards */}
      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-bold text-gray-600">No matching tasks found</p>
          <p className="text-sm text-gray-400 mt-1">Tasks matching your skills will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {recommendations.map((rec, i) => (
            <RecCard
              key={rec.task.id}
              rec={rec}
              rank={i + 1}
              isAccepted={accepted.has(rec.task.id)}
              onAccept={acceptTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
