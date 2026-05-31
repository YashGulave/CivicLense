import CryptoJS from 'crypto-js';

const DEMO_KEY = 'civiclens-demo-key';

export interface ReportPayload {
  incidentType: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export function stripMetadata(payload: Omit<ReportPayload, 'timestamp'>): ReportPayload {
  return {
    incidentType: payload.incidentType,
    description: payload.description.trim(),
    lat: Math.round(payload.lat * 10000) / 10000,
    lng: Math.round(payload.lng * 10000) / 10000,
    timestamp: new Date().toISOString(),
  };
}

export function encryptReport(payload: ReportPayload): string {
  const sanitized = JSON.stringify({
    t: payload.incidentType,
    d: payload.description,
    la: payload.lat,
    lo: payload.lng,
  });
  return CryptoJS.AES.encrypt(sanitized, DEMO_KEY).toString();
}

export function generateConfirmationHash(encryptedPayload: string): string {
  const random = CryptoJS.lib.WordArray.random(16).toString();
  return CryptoJS.SHA256(encryptedPayload + random).toString().substring(0, 16);
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'high': return '#ef4444';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#38bdf8';
  }
}

export function getTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getTypeIcon(type: string): string {
  switch (type) {
    case 'cctv': return '📹';
    case 'facial_recognition': return '👁️';
    case 'data_collection': return '📡';
    case 'safe_zone': return '🛡️';
    default: return '📍';
  }
}
