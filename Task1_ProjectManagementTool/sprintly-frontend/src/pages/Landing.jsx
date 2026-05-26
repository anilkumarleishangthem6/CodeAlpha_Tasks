import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Users, Zap, CheckCircle, MoveRight } from 'lucide-react';

const Landing = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const titles = useMemo(
    () => ['smarter.', 'faster.', 'together.', 'focused.', 'better.'],
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [titleNumber, titles]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#6366f1" />
              <path d="M8 16L12 10L16 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 18V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-white">Sprintly</span>
          </button>

          {/* desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', id: 'features' },
              { label: 'Solutions', id: 'solutions' },
              { label: 'How it works', id: 'howitworks' },
              { label: 'Pricing', id: 'pricing' },
              { label: 'Contact', id: 'contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* right buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-white text-black font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Get started
            </Link>
          </div>

          {/* mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* mobile menu */}
        {
          menuOpen && (
            <div className="md:hidden border-t border-white/5 bg-[#0a0a0a] px-6 py-4 flex flex-col gap-4">
              {[
                { label: 'Features', id: 'features' },
                { label: 'Solutions', id: 'solutions' },
                { label: 'How it works', id: 'howitworks' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-sm text-gray-400 hover:text-white transition text-left"
                >
                  {item.label}
                </button>
              ))}
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Log in</Link>
              <Link to="/register" className="text-sm bg-white text-black font-medium px-4 py-2 rounded-lg text-center">Get started</Link>
            </div>
          )
        }
      </nav >

      {/* hero section */}
      <section className="pt-28 pb-20 px-6 flex flex-col items-center text-center hero-grid">
        {/* badge */}
        < motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-white/10 transition">
            Built for modern teams <MoveRight className="w-3.5 h-3.5" />
          </button>
        </motion.div >

        {/* headline */}
        < motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight max-w-3xl leading-tight"
        >
          <span className="text-white">Your team deserves</span>
          <br />
          <span className="relative inline-flex justify-center overflow-hidden h-[1.6em] w-full pb-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={titleNumber}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -80, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, mass: 0.8 }}
                className="absolute text-indigo-400 font-extrabold text-6xl md:text-8xl"
              >
                {titles[titleNumber]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1 >

        {/* subtext */}
        < motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-lg text-gray-400 max-w-xl leading-relaxed"
        >
          Sprintly brings your team, tasks, and projects into one clean workspace.
          Plan sprints, track progress, and ship together — without the chaos.
        </motion.p >

        {/* cta buttons */}
        < motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-row gap-3"
        >
          <Link
            to="/register"
            className="flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition text-sm"
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => scrollTo('howitworks')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition text-sm"
          >
            See how it works
          </button>
        </motion.div >

        {/* fake dashboard preview */}
        < motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 w-full max-w-4xl bg-[#111111] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* fake browser bar */}
          < div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d0d]" >
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="ml-4 bg-white/5 rounded-md px-4 py-1 text-xs text-gray-500">
              app.sprintly.io/dashboard
            </div>
          </div >
          {/* fake dashboard UI */}
          <img
            src={require('../assets/dashboard.png')}
            alt="Sprintly Dashboard"
            className="w-full rounded-b-xl"
          />

        </motion.div >
        {/* social proof */}
        < div className="py-10 px-6 border-t border-white/5" >
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10">
              {[
                {
                  name: 'Notion',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
                    </svg>
                  ),
                },
                {
                  name: 'Vercel',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 22.525H0l12-21.05 12 21.05z" />
                    </svg>
                  ),
                },
                {
                  name: 'Linear',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.275 19.219a.306.306 0 0 0 .434.432l-.434-.432zM.463 15.54a.306.306 0 0 0 .432.434L.463 15.54zm9.946 4.418L.463 15.54l-.432.434 9.946 4.418.432-.434zM3.275 19.219 1.46 17.4l-.433.433 1.816 1.819.433-.433zM.614 7.19 16.81 23.385l.433-.433L1.046 6.757.614 7.19zm1.904-1.9L18.714 21.49l.433-.433L2.95 4.857l-.433.433zm2.115-1.739 16.196 16.195.433-.433L5.066 3.117l-.433.434zM23.386 16.81 7.19.614l-.433.433 16.196 16.196.433-.433zM21.49 18.714 5.294 2.518l-.433.433L21.057 19.147l.433-.433zM19.597 20.607 3.401 4.411l-.433.433 16.196 16.196.433-.433z" />
                    </svg>
                  ),
                },
                {
                  name: 'Stripe',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                    </svg>
                  ),
                },
                {
                  name: 'Figma',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 10.48c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm4.587-1.471h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49h-4.588V9.009zm4.588 7.509c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117v6.038h3.117zm-4.588 1.471H8.148c-2.476 0-4.49 2.014-4.49 4.49s2.014 4.49 4.49 4.49c2.476 0 4.49-2.014 4.49-4.49v-4.49zm-4.587 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019h3.117v3.019c0 1.665-1.355 3.019-3.117 3.019z" />
                    </svg>
                  ),
                },
              ].map((company) => (
                <div key={company.name} className="flex items-center gap-2.5 text-white/60 hover:text-white/90 transition cursor-default">
                  <span className="w-6 h-6">{company.icon}</span>
                  <span className="font-black text-base tracking-tight">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div >
      </section >

      {/* board screenshot */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 bg-white/5 rounded-md px-4 py-1 text-xs text-gray-500">
                app.sprintly.io/board
              </div>
            </div>
            <img
              src={require('../assets/board.png')}
              alt="Sprintly Board"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* features section */}
      < section id="features" className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything your team needs
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              No bloat, no fluff. Just the tools that actually help your team move faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" />,
                title: 'Kanban Boards',
                desc: 'Visualize your workflow with drag and drop task boards. Move tasks across stages effortlessly.',
              },
              {
                icon: <Users className="w-5 h-5 text-purple-400" />,
                title: 'Team Collaboration',
                desc: 'Invite members, assign tasks, leave comments and communicate right where the work happens.',
              },
              {
                icon: <Zap className="w-5 h-5 text-teal-400" />,
                title: 'Real-time Updates',
                desc: 'See changes instantly with WebSocket powered live updates. Everyone stays on the same page.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/[0.03] border border-white/5 rounded-2xl p-6 transition duration-300 ${i === 0 ? 'hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5' :
                    i === 1 ? 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5' :
                      'hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5'
                  }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* solutions section */}
      < section id="solutions" className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium mb-3">Solutions</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Built for every kind of team
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Whether you're a startup or a growing team, Sprintly adapts to how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Engineering Teams',
                desc: 'Plan sprints, track bugs, manage releases and ship code faster with structured workflows.',
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
              },
              {
                title: 'Design Teams',
                desc: 'Manage design projects, review cycles and feedback loops in one organized space.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                title: 'Product Teams',
                desc: 'Roadmap planning, feature tracking and cross-team coordination made simple.',
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
              },
              {
                title: 'Startups',
                desc: 'Move fast without breaking things. Sprintly keeps your small team aligned and focused.',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition"
              >
                <div className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${item.bg} ${item.color}`}>
                  {item.title}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* how it works section */}
      < section id="howitworks" className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Up and running in minutes
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                step: '01',
                title: 'Create your workspace',
                desc: 'Sign up and create your first project in seconds. Invite your team with a single link.',
              },
              {
                step: '02',
                title: 'Add tasks and assign them',
                desc: 'Break your project into tasks, set priorities, due dates and assign them to the right people.',
              },
              {
                step: '03',
                title: 'Track progress and ship',
                desc: 'Move tasks across your board, collaborate in comments and watch your project come to life.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 items-start bg-white/[0.03] border border-white/5 rounded-2xl p-6"
              >
                <span className="text-3xl font-bold text-white/10 shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* pricing section */}
      < section id="pricing" className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              No hidden fees. No surprises. Pick the plan that fits your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                desc: 'Perfect for individuals and small teams just getting started.',
                features: [
                  '3 projects',
                  'Up to 5 members',
                  'Basic kanban boards',
                  'Community support',
                ],
                cta: 'Get started free',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$12',
                period: 'per month',
                desc: 'For growing teams that need more power and flexibility.',
                features: [
                  'Unlimited projects',
                  'Up to 20 members',
                  'Priority support',
                  'Real-time updates',
                  'Task comments',
                  'Due dates & priorities',
                ],
                cta: 'Start free trial',
                highlight: true,
              },
              {
                name: 'Team',
                price: '$29',
                period: 'per month',
                desc: 'For larger teams that need full control and customization.',
                features: [
                  'Everything in Pro',
                  'Unlimited members',
                  'Admin controls',
                  'Custom integrations',
                  'Dedicated support',
                  'Analytics dashboard',
                ],
                cta: 'Contact sales',
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 flex flex-col gap-5 ${plan.highlight
                  ? 'bg-indigo-600 border border-indigo-500'
                  : 'bg-white/[0.03] border border-white/5 hover:border-white/10'
                  } transition`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <p className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.desc}
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-indigo-400'}`} />
                      <span className={plan.highlight ? 'text-white' : 'text-gray-400'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mt-auto text-center text-sm font-medium px-4 py-2.5 rounded-lg transition ${plan.highlight
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* contact section */}
      < section id="contact" className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-xl mx-auto text-center">
          <p className="text-indigo-400 text-sm font-medium mb-3">Contact</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Get in touch
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-left flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-600"
            />
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-600"
            />
            <textarea
              placeholder="Your message"
              rows={4}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-600 resize-none"
            />
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition">
              Send message
            </button>
          </div>
        </div>
      </section >

      {/* cta banner */}
      < section className="py-24 px-6 border-t border-white/5" >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ready to move faster?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Join teams already using Sprintly to ship better work.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition text-sm"
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section >

      {/* footer */}
      <footer className="border-t border-white/5 px-6 py-16">
        <div className="max-w-6xl mx-auto">

          {/* top row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* brand col */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="8" fill="#6366f1" />
                  <path d="M8 16L12 10L16 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M19 18V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-white font-bold tracking-tight text-lg">Sprintly</span>
              </button>
              <p className="text-xs text-gray-500 leading-relaxed">
                The modern project management tool built for teams that move fast.
              </p>

              {/* social icons */}
              <div className="flex items-center gap-3 mt-1">
                {[
                  {
                    label: 'Twitter',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                  },
                  {
                    label: 'GitHub',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
                  },
                  {
                    label: 'LinkedIn',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
                  },
                  {
                    label: 'Facebook',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
                  },
                  {
                    label: 'YouTube',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
                  },
                  {
                    label: 'Instagram',
                    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="/#"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* product links */}
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Product</p>
              <div className="flex flex-col gap-3">
                {['Features', 'Solutions', 'Pricing', 'Changelog'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item.toLowerCase())}
                    className="text-sm text-gray-500 hover:text-white transition text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* company links */}
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Company</p>
              <div className="flex flex-col gap-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item.toLowerCase())}
                    className="text-sm text-gray-500 hover:text-white transition text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* legal links */}
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Legal</p>
              <div className="flex flex-col gap-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
                  <button
                    key={item}
                    className="text-sm text-gray-500 hover:text-white transition text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* bottom row */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 Sprintly. All rights reserved.</p>
            <p className="text-xs text-gray-600">Built with heart for modern teams</p>
          </div>
        </div>

      </footer>
    </div >
  );
};

export default Landing;