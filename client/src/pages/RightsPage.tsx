import { useEffect, useState } from 'react';
import { fetchDistricts } from '../api';
import type { District } from '../types';
import { getRiskColor } from '../utils/helpers';

const generalRights = [
  {
    title: 'Right to Know',
    desc: 'Citizens have the right to know when they are in a monitored public space. All surveillance infrastructure must be registered in the public CivicLens database.',
    icon: '👁️',
  },
  {
    title: 'Right to Access',
    desc: 'You may request footage in which you appear within 30 days of recording. Requests are processed within 14 business days under the Metrovale Transparency Act.',
    icon: '📋',
  },
  {
    title: 'Right to Deletion',
    desc: 'Non-investigatory footage must be deleted after the retention period expires. Facial recognition templates must be purged within 72 hours unless linked to an active case.',
    icon: '🗑️',
  },
  {
    title: 'Right to Challenge',
    desc: 'Automated surveillance decisions (e.g., facial recognition alerts) can be challenged. Human review is required before any action is taken based solely on automated monitoring.',
    icon: '⚖️',
  },
];

export default function RightsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selected, setSelected] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistricts()
      .then((data) => {
        setDistricts(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading legal frameworks...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Know Your Rights</h1>
        <p className="mt-1 text-sm text-slate-400">
          Privacy laws and legal frameworks for Metrovale City surveillance zones.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {generalRights.map((right) => (
          <div
            key={right.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <span className="text-2xl">{right.icon}</span>
            <h3 className="mt-2 font-semibold text-white">{right.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{right.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Select District
          </h2>
          {districts.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selected?.id === d.id
                  ? 'border-cyan-400/40 bg-cyan-400/5'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getRiskColor(d.risk_level) }}
                />
                <span className="font-medium text-white">{d.name}</span>
              </div>
              <p className="mt-1 text-xs capitalize text-slate-500">
                {d.risk_level} risk · {d.node_count ?? 0} nodes
              </p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="animate-slide-in lg:col-span-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{selected.description}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase"
                  style={{
                    color: getRiskColor(selected.risk_level),
                    backgroundColor: `${getRiskColor(selected.risk_level)}15`,
                  }}
                >
                  {selected.risk_level} risk
                </span>
              </div>

              <div className="mt-6 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-5">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <h3 className="font-semibold text-cyan-400">Applicable Legal Framework</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {selected.legal_framework}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-800/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Coverage Radius</p>
                  <p className="mt-1 text-lg font-semibold text-white">{selected.radius_m}m</p>
                </div>
                <div className="rounded-lg bg-slate-800/60 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Surveillance Nodes</p>
                  <p className="mt-1 text-lg font-semibold text-white">{selected.node_count ?? 0}</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-slate-700 p-4">
                <h4 className="text-sm font-semibold text-white">What You Can Do Here</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Request a list of all active surveillance operators in this district
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    File a privacy complaint if signage requirements are not met
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Opt out of non-essential data collection where applicable
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Report surveillance overreach via the anonymous report form
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
