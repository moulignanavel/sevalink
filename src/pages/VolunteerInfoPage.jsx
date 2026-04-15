import AppFooter from '../components/AppFooter';

const BENEFITS = [
  { icon: '⭐', title: 'Personalised Recommendations', desc: 'Our AI ranks tasks by how well they match your skills, how close they are, and how urgently help is needed.' },
  { icon: '🗺️', title: 'Live Task Map',                desc: 'See all open tasks near you on an interactive map. Filter by urgency and accept with one tap.' },
  { icon: '🏆', title: 'Earn Badges & Recognition',    desc: 'Build your volunteer profile with badges, completed task history, and impact scores.' },
  { icon: '🔔', title: 'Instant Alerts',               desc: 'Get notified the moment a task matching your skills is posted near you.' },
  { icon: '📍', title: 'GPS-Powered Proximity',        desc: 'Tasks are ranked by distance from your real-time location so you always find what\'s closest.' },
  { icon: '🤝', title: 'Trusted NGO Partners',         desc: 'Every NGO on SevaLink is verified. You\'ll always know exactly who you\'re helping.' },
];

const STEPS = [
  { step: '01', title: 'Create Your Profile',  desc: 'Sign up, add your skills, and enable location access.',                                  icon: '👤' },
  { step: '02', title: 'Browse or Get Matched', desc: 'View recommended tasks or explore the live map for opportunities near you.',             icon: '🔍' },
  { step: '03', title: 'Accept a Task',         desc: 'Tap Accept on any task. The NGO is notified and you get full task details.',             icon: '✅' },
  { step: '04', title: 'Show Up & Make Impact', desc: 'Complete the task, get rated, earn badges, and build your volunteer legacy.',            icon: '🌟' },
];

const TESTIMONIALS = [
  { quote: 'I found a blood donation camp 2km from my home within minutes of signing up. SevaLink made it so easy.', name: 'Ananya Singh',  city: 'New Delhi'  },
  { quote: 'The skill matching is incredible. Every task I get recommended actually needs what I can offer.',         name: 'Karthik Nair', city: 'Chennai'    },
];

const SKILLS_SHOWCASE = ['First Aid', 'Driving', 'Teaching', 'Logistics', 'Medical', 'IT Support', 'Photography', 'Cooking', 'Counselling', 'Construction', 'Fundraising', 'Communication'];

export default function VolunteerInfoPage({ onBack, onSignUp, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">SevaLink</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">← Back</button>
            <button onClick={onSignUp} className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-100">
              Join as Volunteer →
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden text-white py-24 px-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/35 to-cyan-900/40" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xl">🙋</span>
              <span className="text-emerald-300 text-xs font-semibold tracking-wide uppercase">For Volunteers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Your Skills Can Change Lives.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Start Today.
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              SevaLink matches you with tasks that need exactly what you offer — near you, right now. No cold calls, no confusion. Just meaningful work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onSignUp}
                className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm">
                Join Free as Volunteer →
              </button>
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 12,000+ volunteers active
              </div>
            </div>
          </div>
        </section>

        {/* Skills cloud */}
        <section className="py-12 px-5 bg-emerald-50">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-bold text-emerald-700 mb-5 uppercase tracking-widest">Skills we match</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SKILLS_SHOWCASE.map((s) => (
                <span key={s} className="text-sm font-semibold bg-white text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full shadow-sm">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-5 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">From sign-up to impact in 4 steps</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s) => (
                <div key={s.step} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">{s.icon}</div>
                  <div className="text-xs font-bold text-gray-300 mb-1">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-5 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Why SevaLink</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Built for volunteers, by volunteers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{b.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Stories</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Volunteers making a difference</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <p className="text-gray-600 text-sm italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-5">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-10 text-white shadow-2xl shadow-emerald-100">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🌱</div>
                <h2 className="text-2xl font-bold mb-3">Ready to start volunteering?</h2>
                <p className="text-white/80 text-sm mb-6">Join 12,000+ volunteers already creating impact across India.</p>
                <button onClick={onSignUp} className="bg-white text-emerald-600 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm">
                  Join Free Today →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
