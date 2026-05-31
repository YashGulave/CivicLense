import { useEffect, useState } from 'react';
import { fetchZones, submitReport } from '../api';
import type { ZonesResponse } from '../types';
import SurveillanceMap from '../components/SurveillanceMap';
import { stripMetadata, encryptReport, generateConfirmationHash } from '../utils/helpers';

const incidentTypes = [
  { value: 'theft', label: 'Theft / Burglary' },
  { value: 'assault', label: 'Assault / Violence' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'hazard', label: 'Public Hazard' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'traffic_incident', label: 'Traffic Incident' },
];

const defaultLayers = {
  cctv: true,
  facial_recognition: true,
  data_collection: true,
  safe_zone: true,
};

export default function ReportPage() {
  const [data, setData] = useState<ZonesResponse | null>(null);
  const [incidentType, setIncidentType] = useState('hazard');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationHash, setConfirmationHash] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchZones().then(setData).catch(() => setError('Failed to load map data'));
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description.trim()) {
      setError('Please select a location on the map and provide a description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = stripMetadata({
        incidentType,
        description,
        lat: location.lat,
        lng: location.lng,
      });

      const encrypted = encryptReport(payload);
      const hash = generateConfirmationHash(encrypted);

      await submitReport({
        encryptedPayload: encrypted,
        incidentType,
        lat: location.lat,
        lng: location.lng,
        confirmationHash: hash,
      });

      setConfirmationHash(hash);
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setConfirmationHash('');
    setDescription('');
    setLocation(null);
    setIncidentType('hazard');
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Report Submitted Anonymously</h2>
          <p className="mt-2 text-slate-400">
            Your identity was stripped client-side. Only encrypted data was transmitted.
          </p>
          <div className="mt-6 rounded-lg bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Confirmation Hash</p>
            <p className="mt-1 font-mono text-lg text-cyan-400 break-all">{confirmationHash}</p>
            <p className="mt-2 text-xs text-slate-500">Save this hash to verify your submission later.</p>
          </div>
          <button
            onClick={resetForm}
            className="mt-6 rounded-lg bg-cyan-400 px-6 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Anonymous Safety Report</h1>
        <p className="mt-1 text-sm text-slate-400">
          All metadata is stripped and your report is encrypted before transmission.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Incident Type</label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {incidentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you observed..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              required
            />
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-sm font-medium text-slate-300">Location</p>
            <p className="mt-1 text-xs text-slate-500">Click on the map to pin the incident location</p>
            {location ? (
              <p className="mt-2 font-mono text-sm text-cyan-400">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No location selected</p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-slate-400">
              Client-side encryption via AES. No IP, device info, or personal identifiers are collected.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {submitting ? 'Encrypting & Submitting...' : 'Submit Encrypted Report'}
          </button>
        </form>

        {data && (
          <div>
            <p className="mb-2 text-sm text-slate-400">Click to set incident location</p>
            <SurveillanceMap
              nodes={data.nodes}
              districts={data.districts}
              cityCenter={data.cityCenter}
              activeLayers={defaultLayers}
              onMapClick={handleMapClick}
              clickMode="report"
              routePoints={location ? [location] : undefined}
              height="450px"
            />
          </div>
        )}
      </div>
    </div>
  );
}
