import { useState } from 'react';
import AppFooter from '../components/AppFooter';

const SECTIONS = [
  { num: '01', icon: '✋', title: 'Acceptance of Terms',    color: 'bg-emerald-500', text: 'By creating an account or using SevaLink, you agree to these Terms of Service. If you do not agree, please do not use the platform. These terms apply to all users — volunteers, NGOs, and visitors.' },
  { num: '02', icon: '🎂', title: 'Eligibility',            color: 'bg-blue-500',    text: 'You must be at least 18 years old to create an account. NGOs must be legally registered organisations in India. By registering, you confirm all information provided is accurate and complete.' },
  { num: '03', icon: '🙋', title: 'Volunteer Responsibilities', color: 'bg-purple-500', items: ['Complete tasks you accept. Repeated no-shows may result in account suspension.', 'Only claim skills you genuinely possess. Misrepresenting safety-critical skills (First Aid, Medical) leads to immediate removal.', 'Treat NGO staff, beneficiaries, and fellow volunteers with respect at all times.', 'Do not use SevaLink to solicit payment for volunteer services.'] },
  { num: '04', icon: '🏢', title: 'NGO Responsibilities',   color: 'bg-indigo-500',  items: ['Tasks must be genuine, legal, and aligned with your organisation\'s stated mission.', 'Do not post tasks involving illegal activity, exploitation, or harm to any person.', 'You are responsible for the safety and wellbeing of volunteers at your task sites.', 'Do not use volunteer contact details for any purpose other than the specific accepted task.'] },
  { num: '05', icon: '📋', title: 'Platform Rules',         color: 'bg-orange-500',  items: ['Do not create fake accounts or impersonate another person or organisation.', 'Do not attempt to scrape, reverse-engineer, or disrupt the SevaLink platform.', 'Do not post offensive, discriminatory, or misleading content.', 'Do not use SevaLink for commercial recruitment or paid employment purposes.'] },
  { num: '06', icon: '©️',  title: 'Intellectual Property', color: 'bg-pink-500',    text: 'All content, design, and code on SevaLink is owned by SevaLink Technologies Pvt. Ltd. User-generated content remains owned by the user but grants SevaLink a licence to display it on the platform.' },
  { num: '07', icon: '⚖️', title: 'Limitation of Liability', color: 'bg-rose-500',  text: 'SevaLink is a matching platform and is not responsible for the actions of volunteers or NGOs. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the preceding 12 months.' },
  { num: '08', icon: '🚪', title: 'Account Termination',    color: 'bg-gray-600',    text: 'We may suspend or terminate accounts that violate these terms, engage in fraud, or harm other users. You may delete your account at any time from your profile settings.' },
  { num: '09', icon: '🔄', title: 'Changes to Terms',       color: 'bg-teal-500',    text: 'We may update these terms from time to time. We will notify you at least 14 days before significant changes take effect. Continued use constitutes acceptance.' },
  { num: '10', icon: '🏛️', title: 'Governing Law',          color: 'bg-cyan-600',    text: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka.' },
];

function TermCard({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${open ? 'border-gray-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left">
        <div className={`w-9 h-9 rounded-xl ${section.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
          {section.num}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg">{section.icon}</span>
          <span className="font-bold text-gray-800 text-sm truncate">{section.title}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-50">
          {section.text && <p className="text-sm text-gray-500 leading-relaxed">{section.text}</p>}
          {section.items && (
            <ul className="space-y-2.5 mt-1">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                  <span className={`w-5 h-5 rounded-full ${section.color} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function TermsPage({ onBack, onNavigate }) {
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
            <span className="text-sm text-gray-500 hidden sm:block font-medium">Terms of Service</span>
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

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white mb-8"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-900/35 to-purple-900/40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl shadow-xl shrink-0">
              📋
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-blue-300 text-xs font-semibold">Effective: April 11, 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Terms of Service</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                10 clear sections covering your rights and responsibilities as a SevaLink user.
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative z-10 flex gap-1 mt-6">
            {SECTIONS.map((s) => (
              <div key={s.num} className={`h-1 flex-1 rounded-full ${s.color} opacity-70`} />
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { v: '10', l: 'Sections', icon: '📄' },
            { v: 'Free', l: 'For all users', icon: '✅' },
            { v: 'India', l: 'Governing law', icon: '🏛️' },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-bold text-gray-800 text-lg">{s.v}</div>
              <div className="text-xs text-gray-400">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Terms accordion */}
        <div className="space-y-2.5 mb-8">
          {SECTIONS.map((s) => <TermCard key={s.num} section={s} />)}
        </div>

        {/* Footer CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">⚖️</div>
          <div className="text-center sm:text-left">
            <p className="font-bold text-gray-800 mb-0.5">Legal questions?</p>
            <p className="text-sm text-gray-500">Email <span className="text-blue-600 font-semibold">legal@sevalink.in</span> for any terms-related queries.</p>
          </div>
          <button onClick={() => onNavigate?.('contact')}
            className="sm:ml-auto shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors">
            Contact Us
          </button>
        </div>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
