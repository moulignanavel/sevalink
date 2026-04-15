import { useState } from 'react';
import AppFooter from '../components/AppFooter';

const SECTIONS = [
  {
    icon: '📥',
    title: 'Information We Collect',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    items: [
      { sub: 'Account Information', text: 'Name, email, phone, date of birth, and role collected at registration to create and manage your account.' },
      { sub: 'Location Data', text: 'Real-time GPS (with permission) to match you with nearby tasks and display your position on the task map. Revocable anytime.' },
      { sub: 'Profile Information', text: 'Skills, bio, profile photo, and task history stored to power our matching engine and display your volunteer record.' },
      { sub: 'Usage Data', text: 'Pages visited, tasks viewed, and interactions collected to improve platform experience.' },
    ],
  },
  {
    icon: '⚙️',
    title: 'How We Use Your Information',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    items: [
      { sub: 'Volunteer-Task Matching', text: 'Skills and location power our AI engine to recommend relevant tasks and notify you of nearby opportunities.' },
      { sub: 'Communications', text: 'Email and phone used for task notifications and account updates. Opt out anytime from settings.' },
      { sub: 'Platform Improvement', text: 'Aggregated, anonymised usage data helps us improve features and fix issues.' },
      { sub: 'Safety & Verification', text: 'NGO registration details used for verification to ensure all organisations are legitimate.' },
    ],
  },
  {
    icon: '🤝',
    title: 'Data Sharing',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    items: [
      { sub: 'With NGOs', text: 'When you accept a task, the NGO sees your name, contact, and relevant skills only — not your full profile or location history.' },
      { sub: 'With Volunteers', text: 'NGO name, task details, and contact info are visible to volunteers browsing tasks.' },
      { sub: 'Third Parties', text: 'We never sell your data. Anonymised aggregated data may be shared with research partners only.' },
      { sub: 'Legal Requirements', text: 'Disclosure only if required by law, court order, or to protect user safety.' },
    ],
  },
  {
    icon: '🔒',
    title: 'Data Security',
    color: 'from-orange-500 to-rose-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    items: [
      { sub: 'Encryption', text: 'All data in transit is encrypted with TLS 1.3. Passwords are hashed with bcrypt and never stored in plain text.' },
      { sub: 'Access Controls', text: 'Only authorised SevaLink team members can access user data, and only when necessary.' },
      { sub: 'Data Retention', text: 'Account data retained while active. Deleted accounts are permanently purged within 30 days.' },
    ],
  },
  {
    icon: '✅',
    title: 'Your Rights',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    items: [
      { sub: 'Access & Correction', text: 'View and update your personal information anytime from your Profile page.' },
      { sub: 'Data Deletion', text: 'Request full deletion by emailing privacy@sevalink.in. Processed within 30 days.' },
      { sub: 'Location Opt-Out', text: 'Revoke location permissions from device settings. Affects task recommendations and map features.' },
      { sub: 'Communication Preferences', text: 'Manage notification preferences from account settings or unsubscribe via email link.' },
    ],
  },
];

function Section({ section, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`rounded-2xl border ${section.border} overflow-hidden transition-all duration-300`}>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${open ? section.bg : 'bg-white hover:bg-gray-50'}`}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl shadow-md shrink-0`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-gray-800 text-sm">{section.title}</span>
          <span className="text-xs text-gray-400 ml-2">{section.items.length} items</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.items.map((item) => (
            <div key={item.sub} className={`${section.bg} rounded-xl p-4 border ${section.border}`}>
              <p className="text-xs font-bold text-gray-700 mb-1">{item.sub}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPage({ onBack, onNavigate }) {
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
            <span className="text-sm text-gray-500 hidden sm:block font-medium">Privacy Policy</span>
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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900/40 via-gray-800/35 to-gray-900/40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-xl shrink-0">
              🔒
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 text-xs font-semibold">Last updated: April 11, 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Privacy Policy</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                We're committed to protecting your data. Here's exactly what we collect, why, and how you stay in control.
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🚫', text: 'Never sold' },
            { icon: '🔐', text: 'TLS encrypted' },
            { icon: '🗑️', text: 'Delete anytime' },
            { icon: '📍', text: 'Location optional' },
          ].map((p) => (
            <div key={p.text} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2 shadow-sm">
              <span className="text-lg">{p.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{p.text}</span>
            </div>
          ))}
        </div>

        {/* Accordion sections */}
        <div className="space-y-3 mb-8">
          {SECTIONS.map((section, i) => (
            <Section key={section.title} section={section} index={i} />
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">📧</div>
          <div className="text-center sm:text-left">
            <p className="font-bold text-gray-800 mb-0.5">Privacy questions?</p>
            <p className="text-sm text-gray-500">Email us at <span className="text-emerald-600 font-semibold">privacy@sevalink.in</span> — we reply within 24 hours.</p>
          </div>
          <button onClick={() => onNavigate?.('contact')}
            className="sm:ml-auto shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors">
            Contact Us
          </button>
        </div>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
