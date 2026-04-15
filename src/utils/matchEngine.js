/**
 * SevaLink Matching Engine
 * Scores volunteer-task pairs:
 *   +2 per matching skill
 *   +2 if same location (city match)
 *   +1 if urgency is High
 *   +2 if urgency is Critical
 */

// ── Score a single task for a volunteer ──────────────────────────────────────
export function scoreTask(volunteer, task) {
  let score = 0;
  const breakdown = { skillPoints: 0, locationPoints: 0, urgencyPoints: 0 };

  // Skill match: +2 per matching skill
  const vSkills = (volunteer.skills || []).map(s => s.toLowerCase());
  const tSkills = (task.requiredSkills || []).map(s => s.toLowerCase());
  const matchedSkills = tSkills.filter(s => vSkills.includes(s));
  breakdown.skillPoints = matchedSkills.length * 2;
  score += breakdown.skillPoints;

  // Location match: +2 if same city (case-insensitive partial match)
  const vCity = (volunteer.location || volunteer.city || '').toLowerCase().trim();
  const tCity = (task.location || '').toLowerCase().trim();
  if (vCity && tCity && (tCity.includes(vCity) || vCity.includes(tCity))) {
    breakdown.locationPoints = 2;
    score += 2;
  }

  // Urgency bonus: +2 Critical, +1 High
  if (task.urgencyLevel === 'Critical') {
    breakdown.urgencyPoints = 2;
    score += 2;
  } else if (task.urgencyLevel === 'High') {
    breakdown.urgencyPoints = 1;
    score += 1;
  }

  // Max possible score for normalisation
  const maxScore = Math.max(tSkills.length * 2 + 2 + 2, 1);
  const matchScore = Math.min(1, score / maxScore);

  return { score, matchScore, breakdown, matchedSkills };
}

// ── Rank all tasks for a volunteer ───────────────────────────────────────────
export function getRecommendations(volunteer, tasks) {
  if (!volunteer.skills?.length) return [];

  return tasks
    .filter(t => t.status === 'Pending' || t.status === 'Open')
    .map(task => ({ task, ...scoreTask(volunteer, task) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || b.matchScore - a.matchScore);
}
