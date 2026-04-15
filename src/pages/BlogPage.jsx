import { useState } from 'react';
import AppFooter from '../components/AppFooter';

const POSTS = [
  {
    id: 1,
    category: 'Impact Story',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    title: 'How 200 Volunteers Coordinated Flood Relief in Assam in 48 Hours',
    excerpt: 'When the Brahmaputra overflowed its banks, SevaLink\'s real-time matching system helped HopeNGO deploy trained volunteers across 12 relief camps within two days.',
    author: 'Riya Patel',
    authorRole: 'Director, HopeNGO',
    date: 'Apr 5, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80',
  },
  {
    id: 2,
    category: 'How It Works',
    categoryColor: 'bg-purple-100 text-purple-700',
    title: 'The Science Behind SevaLink\'s AI Matching Engine',
    excerpt: 'Our algorithm scores every volunteer-task pair across three dimensions: skill overlap (50%), geographic proximity (30%), and task urgency (20%). Here\'s how we built it.',
    author: 'Rahul Verma',
    authorRole: 'Lead Engineer, SevaLink',
    date: 'Mar 28, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  },
  {
    id: 3,
    category: 'Volunteer Story',
    categoryColor: 'bg-orange-100 text-orange-700',
    title: 'From Software Engineer to First-Aid Volunteer: Karthik\'s Story',
    excerpt: 'Karthik Nair had first-aid certification but no idea where to use it. Three months after joining SevaLink, he\'s completed 11 medical camp tasks across Chennai.',
    author: 'Sneha Iyer',
    authorRole: 'Community Manager',
    date: 'Mar 15, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  },
  {
    id: 4,
    category: 'NGO Guide',
    categoryColor: 'bg-blue-100 text-blue-700',
    title: '5 Ways NGOs Can Get More From SevaLink\'s Analytics Dashboard',
    excerpt: 'Most NGOs use SevaLink to post tasks — but the analytics dashboard can tell you which skills are most in demand, peak volunteer hours, and your impact score over time.',
    author: 'Priya Sharma',
    authorRole: 'Head of Partnerships',
    date: 'Mar 8, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    id: 5,
    category: 'Impact Story',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    title: 'Tree Plantation Drive: 500 Volunteers, One Weekend, 3000 Trees',
    excerpt: 'GreenEarth Foundation used SevaLink to coordinate their largest plantation drive ever — spanning 6 city parks across Bangalore with volunteers matched by proximity.',
    author: 'Suresh Kumar',
    authorRole: 'GreenEarth Foundation',
    date: 'Feb 22, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80',
  },
  {
    id: 6,
    category: 'Tips',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    title: 'How to Build a Strong Volunteer Profile That Gets Matched First',
    excerpt: 'Volunteers with complete profiles — verified skills, location enabled, and a bio — get matched 3x more often. Here\'s exactly what to fill in and why it matters.',
    author: 'Arjun Mehta',
    authorRole: 'Founder, SevaLink',
    date: 'Feb 10, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  },
];

const CATEGORIES = ['All', 'Impact Story', 'How It Works', 'Volunteer Story', 'NGO Guide', 'Tips'];

export default function BlogPage({ onBack, onSignUp, onNavigate }) {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? POSTS : POSTS.filter((p) => p.category === active);

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
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-sm font-semibold text-gray-500">Blog</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">← Back</button>
            <button onClick={onSignUp} className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-100">
              Get Started →
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden text-white py-20 px-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-gray-800/35" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-lg">📝</span>
              <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">SevaLink Blog</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Stories, Guides & Impact</h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto">
              Real stories from volunteers and NGOs, how-to guides, and insights on making volunteering smarter across India.
            </p>
          </div>
        </section>

        {/* Filter pills */}
        <section className="sticky top-16 z-10 bg-white border-b border-gray-100 px-5 py-3">
          <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActive(c)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  active === c
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-12 px-5">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-gray-400 mb-6 font-medium">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <article key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer">

                  {/* Card image */}
                  <div className="h-44 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${post.categoryColor}`}>
                      {post.category}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {post.author[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 leading-none">{post.author}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{post.date}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 px-5 bg-gray-50">
          <div className="max-w-xl mx-auto text-center">
            <div className="text-3xl mb-3">📬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the loop</h2>
            <p className="text-gray-500 text-sm mb-6">Get the latest impact stories and volunteer tips delivered to your inbox.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all" />
              <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-100">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <AppFooter onNavigate={onNavigate} />
    </div>
  );
}
