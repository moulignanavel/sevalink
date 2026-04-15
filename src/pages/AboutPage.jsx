import AppFooter from '../components/AppFooter';

const STATS = [
  { value: '12K+', label: 'Volunteers Registered', icon: '🙋' },
  { value: '340+', label: 'NGO Partners',           icon: '🏢' },
  { value: '8K+',  label: 'Tasks Completed',        icon: '✅' },
  { value: '28',   label: 'States Covered',         icon: '🗺️' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up',                  desc: 'Create your free account as a Volunteer or NGO in under 2 minutes.',                                    icon: '👤', color: 'from-emerald-400 to-teal-500'  },
  { step: '02', title: 'Set Skills & Location',    desc: 'Volunteers add skills and enable location. NGOs post tasks with requirements.',                          icon: '🎯', color: 'from-blue-400 to-indigo-500'   },
  { step: '03', title: 'AI Matches You',           desc: 'Our engine scores every volunteer-task pair by skill fit, proximity, and urgency.',                      icon: '⚡', color: 'from-purple-400 to-pink-500'   },
  { step: '04', title: 'Accept & Show Up',         desc: 'Volunteers accept tasks, see them on the live map, and make real impact.',                               icon: '🤝', color: 'from-orange-400 to-rose-500'   },
];

const FEATURES = [
  { icon: '🗺️', title: 'Live Task Map',          desc: 'Real-time map showing open tasks near you with GPS tracking.'                    },
  { icon: '⭐', title: 'Smart Recommendations',  desc: 'AI ranks tasks by skill match (50%), proximity (30%), urgency (20%).'            },
  { icon: '🔔', title: 'Instant Notifications',  desc: 'Get alerted the moment a matching task is posted in your area.'                  },
  { icon: '📊', title: 'NGO Analytics',          desc: 'Track volunteer engagement, task completion rates, and impact.'                  },
  { icon: '🏆', title: 'Badges & Milestones',    desc: 'Volunteers earn recognition for consistent community service.'                   },
  { icon: '🔒', title: 'Verified NGOs',          desc: 'All NGO partners are verified before posting tasks on the platform.'            },
];

const TEAM = [
  { name: 'Arjun Mehta',  role: 'Founder & CEO',        initials: 'AM', color: 'from-emerald-400 to-teal-500'  },
  { name: 'Priya Sharma', role: 'Head of Partnerships',  initials: 'PS', color: 'from-blue-400 to-indigo-500'   },
  { name: 'Rahul Verma',  role: 'Lead Engineer',         initials: 'RV', color: 'from-purple-400 to-pink-500'   },
  { name: 'Sneha Iyer',   role: 'Community Manager',     initials: 'SI', color: 'from-orange-400 to-rose-500'   },
];

export default function AboutPage({ onBack, onSignUp, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">SevaLink</span>
          </div>
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2 rounded-xl hover:bg-emerald-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden text-white py-24 px-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/35 to-gray-900/40" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-semibold tracking-wide uppercase">About SevaLink</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Connecting Communities.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Powering Volunteers.
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              SevaLink is India's smart volunteer-task matching platform — bridging the gap between NGOs that need help and passionate people ready to give it.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-10 px-5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center text-white">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-5 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
                Making volunteering as easy as ordering food
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                In India, thousands of NGOs struggle to find the right volunteers at the right time — while millions of people want to help but don't know where to start.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                SevaLink solves this with AI-powered matching that considers your skills, your location, and the urgency of each task — so every volunteer hour goes exactly where it's needed most.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Skill-based matching', 'Real-time GPS', 'Urgency scoring', 'Verified NGOs'].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Score card visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-7 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <p className="font-bold text-sm">Smart Match Engine</p>
                    <p className="text-gray-400 text-xs">Running live</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400">Active</span>
                  </div>
                </div>
                {[
                  { label: 'Skill Match', pct: 91, color: 'bg-emerald-500' },
                  { label: 'Proximity',   pct: 74, color: 'bg-blue-500'    },
                  { label: 'Urgency',     pct: 85, color: 'bg-orange-500'  },
                ].map((b) => (
                  <div key={b.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{b.label}</span>
                      <span className="font-bold">{b.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Overall match score: <span className="text-emerald-400 font-bold">87%</span>
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-5 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">From sign-up to impact in 4 steps</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((s) => (
                <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {s.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-300 mb-1">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-5 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Everything you need to volunteer smarter</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-5 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">The Team</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Built by people who care</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {TEAM.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:shadow-md transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 shadow-md`}>
                    {t.initials}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
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
                <h2 className="text-2xl font-bold mb-3">Ready to make a difference?</h2>
                <p className="text-white/80 text-sm mb-6">Join 12,000+ volunteers already creating impact across India.</p>
                <button onClick={onBack}
                  className="bg-white text-emerald-600 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm">
                  Get Started Free →
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
