import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/10 via-slate-950 to-slate-950" />

      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
        <div className="animate-fade-up mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 text-sm text-cyan-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Public Surveillance Transparency
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            See the city.<br />
            <span className="text-cyan-400">Protect your privacy.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            CivicLens sits at the intersection of mass surveillance and public safety —
            giving citizens transparency into monitoring infrastructure, tools to report
            incidents anonymously, and knowledge of their privacy rights.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Explore Surveillance Map
            </Link>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Submit Anonymous Report
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '👁️',
              title: 'Live Surveillance Map',
              desc: 'Interactive map of CCTV, facial recognition, and data collection zones across Metrovale.',
              to: '/map',
            },
            {
              icon: '🔒',
              title: 'Anonymous Reports',
              desc: 'End-to-end encrypted, identity-stripped safety reports with verification hashes.',
              to: '/report',
            },
            {
              icon: '📊',
              title: 'Privacy Risk Score',
              desc: 'Calculate surveillance exposure for any route through the city.',
              to: '/score',
            },
            {
              icon: '⚖️',
              title: 'Know Your Rights',
              desc: 'Contextual privacy laws and legal frameworks for each city zone.',
              to: '/rights',
            },
          ].map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-cyan-400/30 hover:bg-slate-900"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-semibold text-white group-hover:text-cyan-400">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-20 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">The Ethical Tension</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Public safety demands visibility. Personal freedom demands privacy.
            CivicLens doesn't pick a side — it gives citizens the data to make
            informed decisions in a monitored world.
          </p>
        </div>
      </section>
    </div>
  );
}
