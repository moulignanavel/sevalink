import AppFooter from '../components/AppFooter';

const BENEFITS = [
  { icon: '🎯', title: 'Smart Volunteer Matching',  desc: 'Our AI matches your task requirements with the most suitable volunteers based on skills, location, and availability — no manual searching.' },
  { icon: '📍', title: 'Real-Time Task Map',         desc: 'Post tasks and watch volunteers near your location get notified instantly. Track who accepted and their live location.' },
  { icon: '📊', title: 'Analytics Dashboard',        desc: 'Monitor task completion rates, volunteer engagement, and impact metrics all in one place.' },
  { icon: '🔔', title: 'Instant Notifications',      desc: 'Volunteers are alerted the moment you post a task. Critical tasks get priority visibility.' },
  { icon: '✅', title: 'Verified Volunteer Profiles', desc: 'Every volunteer profile includes verified skills, past task history, and ratings from other NGOs.' },
  { icon: '📁', title: 'Task History & Reports',     desc: 'Export detailed reports of all completed tasks, volunteer hours, and impact data for your donors and stakeholders.' },
];

const STEPS = [
  { step: '01', title: 'Register Your NGO',    desc: 'Sign up and complete your NGO profile. Verification takes less than 24 hours.',          icon: '🏢' },
  { step: '02', title: 'Post a Task',          desc: 'Fill in task details — title, description, location, required skills, and urgency level.', icon: '📝' },
  { step: '03', title: 'Get Matched',          desc: 'SevaLink instantly notifies the best-matched volunteers in your area.',                    icon: '⚡' },
  { step: '04', title: 'Track & Complete',     desc: 'Monitor progress on the dashboard. Mark tasks complete and rate volunteers.',              icon: '✅' },
];

const TESTIMONIALS = [
  { quote: 'SevaLink helped us find 50 trained first-aid volunteers for our medical camp in under 3 hours.', name: 'Dr. Meena Rao', org: 'HealthFirst NGO, Pune' },
  { quote: 'We used to spend days calling volunteers. Now we post a task and it\'s filled within the hour.', name: 'Suresh Kumar',   org: 'GreenEarth Foundation, Bangalore' },
];

export default function NgoInfoPage({ onBack, onSignUp, onNavigate }) {
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
              Register NGO →
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden text-white py-24 px-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/35 to-purple-900/40" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xl">🏢</span>
              <span className="text-blue-300 text-xs font-semibold tracking-wide uppercase">For NGOs</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Find the Right Volunteers.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Faster Than Ever.
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              SevaLink's AI matches your tasks with skilled, nearby volunteers in minutes — so you spend less time recruiting and more time creating impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onSignUp}
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
                Register Your NGO Free →
              </button>
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 340+ NGOs already onboard
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-10 px-5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center">
            {[
              { v: '340+', l: 'NGOs Registered' },
              { v: '8K+',  l: 'Tasks Completed'  },
              { v: '< 1hr', l: 'Avg. Fill Time'  },
              { v: '98%',  l: 'Satisfaction Rate' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl font-bold">{s.v}</div>
                <div className="text-white/70 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-5 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Post a task. Get volunteers. Simple.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s) => (
                <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">{s.icon}</div>
                  <div className="text-xs font-bold text-gray-300 mb-1">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-5 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Benefits</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Everything your NGO needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{b.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-5 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">NGOs love SevaLink</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-600 text-sm italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.org}</p>
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
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏢</div>
                <h2 className="text-2xl font-bold mb-3">Ready to find volunteers faster?</h2>
                <p className="text-white/80 text-sm mb-6">Join 340+ NGOs already using SevaLink to power their missions.</p>
                <button onClick={onSignUp} className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
                  Register Your NGO Free →
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
