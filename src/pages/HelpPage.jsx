import { useState } from 'react';
import AppFooter from '../components/AppFooter';

const CATEGORIES = [
  {
    key: 'start',
    icon: '🚀',
    label: 'Getting Started',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
    questions: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" on the login page, enter your name, email, and password, then select whether you\'re a Volunteer or NGO. Your account is ready instantly — no waiting.' },
      { q: 'Is SevaLink free to use?', a: 'Yes, SevaLink is completely free for both volunteers and NGOs. There are no hidden fees or premium tiers.' },
      { q: 'What\'s the difference between Volunteer and NGO accounts?', a: 'Volunteers browse and accept tasks. NGOs post tasks, manage volunteers, and access analytics. You select your role at registration and it cannot be changed later.' },
    ],
  },
  {
    key: 'volunteer',
    icon: '🙋',
    label: 'For Volunteers',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    accent: 'text-blue-600',
    questions: [
      { q: 'How does task matching work?', a: 'Our AI scores tasks on three factors: skill match (50%), proximity to your location (30%), and task urgency (20%). The highest-scoring tasks appear in your Recommended tab.' },
      { q: 'How do I enable location for better matches?', a: 'When you open Map View, your browser asks for location permission — click Allow. You can also enable it from your browser\'s site settings. Location is only used while the app is open.' },
      { q: 'Can I cancel a task I\'ve accepted?', a: 'Yes. Contact the NGO directly using the task details. Repeated cancellations may affect your profile rating and reduce future recommendations.' },
      { q: 'How do I earn badges?', a: '"First Task" is awarded on your first completion. "3-Task Streak" for three consecutive completions. Check your Profile page to see all available badges and progress.' },
    ],
  },
  {
    key: 'ngo',
    icon: '🏢',
    label: 'For NGOs',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    accent: 'text-purple-600',
    questions: [
      { q: 'How do I post a task?', a: 'Go to Create Task in your dashboard. Fill in the title, description, location, urgency level, and required skills. Once posted, matching volunteers are notified immediately.' },
      { q: 'How quickly will volunteers respond?', a: 'Most tasks receive applications within 1–2 hours. Critical tasks are prioritised. Average fill time across the platform is under 1 hour.' },
      { q: 'Can I see volunteer profiles before accepting them?', a: 'Yes. When a volunteer accepts your task, you can view their name, skills, task history, and ratings from other NGOs.' },
      { q: 'How do I verify my NGO?', a: 'After registration, upload your NGO registration certificate from profile settings. Our team verifies it within 24 hours. Verified NGOs get a blue checkmark.' },
    ],
  },
  {
    key: 'tech',
    icon: '⚙️',
    label: 'Technical',
    color: 'from-orange-500 to-rose-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    accent: 'text-orange-600',
    questions: [
      { q: 'The map isn\'t showing my location. What do I do?', a: 'Ensure location permissions are enabled for your browser. In Chrome: Settings → Privacy → Site Settings → Location → Allow. Then refresh the page.' },
      { q: 'I\'m not receiving notifications. How do I fix this?', a: 'Check that browser notifications are enabled for SevaLink. Also check your email spam folder. Manage notification preferences from your profile settings.' },
      { q: 'How do I reset my password?', a: 'Contact support@sevalink.in with your registered email and we\'ll reset it manually within 2 hours. A self-service reset feature is coming soon.' },
      { q: 'Is my data safe?', a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest. We never sell your personal data. Read our Privacy Policy for full details.' },
    ],
  },
];

function FAQItem({ q, a, accent, bg, border }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${open ? `${bg} ${border}` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left">
        <span className={`text-sm font-semibold ${open ? accent : 'text-gray-700'} leading-snug`}>{q}</span>
        <svg className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200 ${open ? `rotate-180 ${accent}` : 'text-gray-400'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage({ onBack, onContact, onNavigate }) {
  const [activeTab, setActiveTab] = useState('start');
  const [search, setSearch]       = useState('');

  const allQs = CATEGORIES.flatMap((c) => c.questions.map((q) => ({ ...q, cat: c })));
  const searchResults = search.trim()
    ? allQs.filter((q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  const active = CATEGORIES.find((c) => c.key === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">SevaLink</span>
            <span className="text-gray-300 hidden sm:block">/</span>
            <span className="text-sm text-gray-500 hidden sm:block font-medium">Help Center</span>
          </div>
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 w-full">

        {/* Hero with search */}
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white mb-8"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900/92 via-gray-800/90 to-gray-900/92" />
          <div className="relative z-10 text-center max-w-xl mx-auto">
            <div className="text-4xl mb-3">🤝</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">How can we help?</h1>
            <p className="text-gray-400 text-sm mb-6">Search our FAQ or browse by category.</p>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg leading-none">×</button>
              )}
            </div>
          </div>
        </div>

        {/* Search results */}
        {searchResults ? (
          <div className="mb-8">
            <p className="text-xs text-gray-400 mb-4 font-medium">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "<span className="text-gray-600">{search}</span>"
            </p>
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">🔎</div>
                <p className="font-bold text-gray-700 mb-1">No results found</p>
                <p className="text-sm text-gray-400 mb-4">Try different keywords or contact our support team.</p>
                <button onClick={onContact}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors">
                  Contact Support →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((item, i) => (
                  <div key={i}>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-1.5 ${item.cat.bg} ${item.cat.accent}`}>
                      <span>{item.cat.icon}</span>{item.cat.label}
                    </div>
                    <FAQItem q={item.q} a={item.a} accent={item.cat.accent} bg={item.cat.bg} border={item.cat.border} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => setActiveTab(c.key)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                    activeTab === c.key
                      ? `bg-gradient-to-r ${c.color} text-white border-transparent shadow-md`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}>
                  <span>{c.icon}</span>
                  <span className="hidden sm:block">{c.label}</span>
                </button>
              ))}
            </div>

            {/* Active category */}
            {active && (
              <div className={`${active.bg} border ${active.border} rounded-2xl p-5 mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.color} flex items-center justify-center text-xl shadow-md`}>{active.icon}</div>
                  <div>
                    <h2 className="font-bold text-gray-800">{active.label}</h2>
                    <p className="text-xs text-gray-500">{active.questions.length} questions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {active.questions.map((q) => (
                    <FAQItem key={q.q} q={q.q} a={q.a} accent={active.accent} bg={active.bg} border={active.border} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Still need help */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="text-4xl shrink-0">💬</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Still need help?</h3>
              <p className="text-white/80 text-sm">Our support team replies within 24 hours.</p>
            </div>
            <button onClick={onContact}
              className="shrink-0 bg-white text-emerald-700 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-sm shadow-md">
              Contact Support →
            </button>
          </div>
        </div>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
