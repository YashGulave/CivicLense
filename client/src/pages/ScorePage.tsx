import { useEffect, useState } from 'react';
import { fetchZones, calculateScore } from '../api';
import type { ZonesResponse, ScoreResult } from '../types';
import SurveillanceMap from '../components/SurveillanceMap';
import { getRiskColor, getTypeLabel } from '../utils/helpers';

const defaultLayers = {
  cctv: true,
  facial_recognition: true,
  data_collection: true,
  safe_zone: true,
};

export default function ScorePage() {
  const [data, setData] = useState<ZonesResponse | null>(null);
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [clickMode, setClickMode] = useState<'start' | 'end'>('start');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchZones().then(setData).catch(() => setError('Failed to load map'));
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (clickMode === 'start') {
      setStart({ lat, lng });
      setClickMode('end');
    } else {
      setEnd({ lat, lng });
    }
    setResult(null);
  };

  const handleCalculate = async () => {
    if (!start || !end) {
      setError('Please set both start and end points on the map.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const score = await calculateScore(start.lat, start.lng, end.lat, end.lng);
      setResult(score);
    } catch {
      setError('Failed to calculate score.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStart(null);
    setEnd(null);
    setResult(null);
    setClickMode('start');
  };

  const scoreColor = result
    ? result.score >= 70 ? '#ef4444' : result.score >= 50 ? '#f97316' : result.score >= 30 ? '#eab308' : '#22c55e'
    : '#38bdf8';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Privacy Route Checker</h1>
        <p className="mt-1 text-sm text-slate-400">
          Set start and end points to calculate your Privacy Risk Score (0–100).
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={() => setClickMode('start')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            clickMode === 'start'
              ? 'bg-cyan-400/15 text-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
          }`}
        >
          {start ? '✓ Start Set' : 'Set Start Point'}
        </button>
        <button
          onClick={() => setClickMode('end')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            clickMode === 'end'
              ? 'bg-cyan-400/15 text-cyan-400 ring-1 ring-cyan-400/40'
              : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
          }`}
        >
          {end ? '✓ End Set' : 'Set End Point'}
        </button>
        <button
          onClick={handleCalculate}
          disabled={!start || !end || loading}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
        >
          {loading ? 'Calculating...' : 'Calculate Score'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-4 py-2 text-sm text-slate-400 ring-1 ring-slate-700 hover:text-white"
        >
          Reset
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {data && (
            <SurveillanceMap
              nodes={data.nodes}
              districts={data.districts}
              cityCenter={data.cityCenter}
              activeLayers={defaultLayers}
              onMapClick={handleMapClick}
              clickMode={clickMode}
              routePoints={[start, end].filter(Boolean) as Array<{ lat: number; lng: number }>}
              height="500px"
            />
          )}
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500">Privacy Risk Score</p>
                <p className="mt-2 text-6xl font-bold" style={{ color: scoreColor }}>
                  {result.score}
                </p>
                <p className="mt-1 text-lg font-medium" style={{ color: scoreColor }}>
                  {result.riskLabel} Risk
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Route: {result.routeDistanceM}m · {result.intersectedNodeCount} nodes · {result.intersectedDistrictCount} districts
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <h3 className="text-sm font-semibold text-white">Surveillance Breakdown</h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(result.breakdown.byType).map(([type, count]) =>
                    count > 0 ? (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-slate-400">{getTypeLabel(type)}</span>
                        <span className="font-medium text-white">{count}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {result.breakdown.districts.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                  <h3 className="text-sm font-semibold text-white">Districts Crossed</h3>
                  <div className="mt-3 space-y-2">
                    {result.breakdown.districts.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{d.name}</span>
                        <span style={{ color: getRiskColor(d.risk_level) }} className="text-xs uppercase">
                          {d.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <h3 className="text-sm font-semibold text-white">Recommendations</h3>
                <ul className="mt-3 space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-cyan-400 shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 p-8">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">
                  Set start and end points, then calculate your privacy risk score.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
