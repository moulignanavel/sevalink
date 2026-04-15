import { useState, useRef, useEffect } from 'react';
import AppFooter from '../components/AppFooter';

// ── AI Chatbot ────────────────────────────────────────────────────────────────
const BOT_RULES = [
  { match: /hello|hi|hey|namaste/i,            reply: "Hi there! 👋 I'm SevaBot. Ask me anything about volunteering, NGOs, tasks, or SevaLink!" },
  { match: /volunteer|sign up|join|register/i, reply: "To join as a volunteer, click 'Sign Up', add your skills and location, and you'll get matched with tasks near you instantly! 🙋" },
  { match: /ngo|organisation|organization/i,   reply: "NGOs register for free. Upload your registration certificate and our team verifies you within 24 hours. Then post tasks! 🏢" },
  { match: /task|post|create/i,                reply: "NGOs post tasks with title, description, location, urgency, and required skills. Matching volunteers are notified immediately. 📋" },
  { match: /match|recommend|ai/i,              reply: "Our AI scores pairs on: skill match (50%), proximity (30%), urgency (20%). Best matches appear in the Recommended tab. ⚡" },
  { match: /map|location|gps/i,                reply: "The live task map shows open tasks near you with color-coded urgency markers. Enable location for the best experience. 🗺️" },
  { match: /free|cost|price|pay/i,             reply: "SevaLink is completely free for both volunteers and NGOs. No hidden fees. ✅" },
  { match: /badge|reward|point/i,              reply: "Volunteers earn badges: First Task, 3-Task Streak, 10 Completed, and more. Check your Profile page! 🏆" },
  { match: /password|login|account/i,          reply: "For account issues, email support@sevalink.in with your registered email. We'll reset it within 2 hours. 🔐" },
  { match: /contact|email|phone|call/i,        reply: "Reach us at hello@sevalink.in or call +91 80 4567 8900 (Mon–Fri, 9am–6pm IST). 📞" },
  { match: /thank|thanks|great|awesome/i,      reply: "You're welcome! 😊 Anything else I can help with?" },
  { match: /bye|goodbye|exit/i,                reply: "Goodbye! Thanks for reaching out. Have a great day! 🌱" },
];
const DEFAULT_REPLY = "I'm not sure about that! Try asking about volunteering, NGO registration, tasks, or the matching system. Or email hello@sevalink.in 😊";
function getBotReply(msg) {
  for (const rule of BOT_RULES) { if (rule.match.test(msg)) return rule.reply; }
  return DEFAULT_REPLY;
}

function ChatWidget({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm SevaBot 🤖 — SevaLink's AI assistant. Ask me anything about volunteering, NGOs, tasks, or how the platform works!", time: new Date() },
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((p) => [...p, { from: 'user', text: msg, time: new Date() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, { from: 'bot', text: getBotReply(msg), time: new Date() }]);
    }, 800 + Math.random() * 500);
  };

  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '85vh', maxHeight: 580 }}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🤖</div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">SevaBot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
              <span className="text-white/80 text-xs">Online · AI Assistant 24/7</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {m.from === 'bot' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>}
              <div className={`max-w-[78%] flex flex-col gap-0.5 ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{fmt(m.time)}</span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm">🤖</div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0">
          {["How to volunteer?", "Register NGO", "Task matching", "It's free?"].map((q) => (
            <button key={q} onClick={() => send(q)}
              className="shrink-0 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all" />
          <button onClick={() => send()} disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 flex items-center justify-center text-white transition-all active:scale-95 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Map Modal ─────────────────────────────────────────────────────────────────
function MapModal({ onClose }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=12.9352,77.6245`;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">📍</div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">SevaLink Office</p>
            <p className="text-white/80 text-xs">Koramangala, Bangalore · Karnataka 560034</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ height: 260 }} className="bg-gray-100 shrink-0">
          <iframe title="SevaLink Office" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
            src="https://maps.google.com/maps?q=Koramangala,Bangalore,Karnataka&z=15&output=embed" />
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
            <span className="text-xl">🏢</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">SevaLink Technologies Pvt. Ltd.</p>
              <p className="text-xs text-gray-500">5th Floor, Koramangala Industrial Layout</p>
              <p className="text-xs text-gray-500">Bangalore, Karnataka 560034, India</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-sm hover:from-purple-600 hover:to-pink-600 transition-all shadow-md active:scale-95">
              🧭 Get Directions
            </a>
            <a href="https://www.google.com/maps/search/Koramangala+Bangalore" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all active:scale-95">
              🗺️ Open in Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const TOPICS = ['General Enquiry', 'Volunteer Support', 'NGO Partnership', 'Technical Issue', 'Report a Problem', 'Media & Press', 'Other'];
const inp = (err) => `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all bg-gray-50 focus:bg-white ${err ? 'border-red-300 bg-red-50' : 'border-gray-200'}`;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage({ onBack, onNavigate }) {
  const [form, setForm]           = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [showChat, setShowChat]   = useState(false);
  const [showMap, setShowMap]     = useState(false);

  const CARDS = [
    { icon: '📧', title: 'Email Us',  value: 'hello@sevalink.in',     sub: 'Opens Gmail / mail app', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-100', action: () => window.open('mailto:hello@sevalink.in?subject=SevaLink%20Enquiry', '_blank'), label: 'Send Email' },
    { icon: '📞', title: 'Call Us',   value: '+91 80 4567 8900',       sub: 'Tap to dial instantly',  gradient: 'from-blue-500 to-indigo-500',  bg: 'bg-blue-50',    border: 'border-blue-100',    action: () => window.open('tel:+918045678900', '_self'),                                   label: 'Call Now'   },
    { icon: '📍', title: 'Visit Us',  value: 'Koramangala, Bangalore', sub: 'See on live map',        gradient: 'from-purple-500 to-pink-500',  bg: 'bg-purple-50',  border: 'border-purple-100',  action: () => setShowMap(true),                                                            label: 'View Map'   },
    { icon: '💬', title: 'Live Chat', value: 'AI Assistant 24/7',      sub: 'Instant answers',        gradient: 'from-orange-500 to-rose-500',  bg: 'bg-orange-50',  border: 'border-orange-100',  action: () => setShowChat(true),                                                           label: 'Start Chat' },
  ];

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.topic)          e.topic   = 'Required';
    if (!form.message.trim()) e.message = 'Required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}
      {showMap  && <MapModal  onClose={() => setShowMap(false)}  />}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">SevaLink</span>
            <span className="text-gray-300 hidden sm:block">/</span>
            <span className="text-sm text-gray-500 hidden sm:block font-medium">Contact</span>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-50 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10 text-white mb-7"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/88" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-xs font-semibold">We're online · Avg reply 2 hrs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Get in Touch 👋</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
              Tap any card — email opens your mail app, phone dials directly, map shows our live location, and chat connects you to our AI assistant instantly.
            </p>
          </div>
        </div>

        {/* Live contact cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {CARDS.map((c) => (
            <button key={c.title} onClick={c.action}
              className={`${c.bg} border ${c.border} rounded-2xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 group`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-xl mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                {c.icon}
              </div>
              <p className="font-bold text-gray-800 text-xs mb-0.5">{c.title}</p>
              <p className="text-xs text-gray-600 font-semibold leading-snug">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
              <p className={`mt-2 text-xs font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>{c.label} →</p>
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Send a Message</h2>
            <p className="text-sm text-gray-400 mb-5">We'll get back to you within 24 hours.</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mb-4">✅</div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Message Sent!</h3>
                <p className="text-sm text-gray-500 mb-4">We'll reply to <strong>{form.email}</strong> within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                  className="text-sm text-emerald-600 font-bold hover:underline">Send another →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
                    <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className={inp(errors.name)} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className={inp(errors.email)} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Topic *</label>
                  <select value={form.topic} onChange={(e) => setForm(p => ({ ...p, topic: e.target.value }))} className={inp(errors.topic)}>
                    <option value="">Select a topic…</option>
                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.topic && <p className="text-xs text-red-500 mt-1">{errors.topic}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Message *</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us how we can help…" className={`${inp(errors.message)} resize-none`} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 active:scale-95">
                  Send Message →
                </button>
              </form>
            )}
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-4">🕐 Office Hours</p>
              {[{ day: 'Mon – Fri', time: '9:00 AM – 6:00 PM' }, { day: 'Saturday', time: '10:00 AM – 2:00 PM' }, { day: 'Sunday', time: 'Closed' }].map((h) => (
                <div key={h.day} className="flex justify-between text-xs py-2 border-b border-white/10 last:border-0">
                  <span className="text-gray-400">{h.day}</span>
                  <span className={`font-semibold ${h.time === 'Closed' ? 'text-red-400' : 'text-white'}`}>{h.time}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 rounded-2xl p-5">
              <p className="font-bold text-orange-800 text-sm mb-1">💬 AI Chat Available 24/7</p>
              <p className="text-xs text-orange-700 leading-relaxed mb-3">Get instant answers about volunteering, NGOs, tasks, and more — any time.</p>
              <button onClick={() => setShowChat(true)} className="w-full py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl text-xs hover:from-orange-600 hover:to-rose-600 transition-all active:scale-95">
                Start Chat Now →
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
              <p className="font-bold text-blue-800 text-sm mb-1">🤝 NGO Partnership</p>
              <p className="text-xs text-blue-700 leading-relaxed mb-2">Interested in onboarding your NGO?</p>
              <a href="mailto:partners@sevalink.in" className="text-xs font-bold text-blue-600 hover:underline">partners@sevalink.in →</a>
            </div>
          </div>
        </div>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
