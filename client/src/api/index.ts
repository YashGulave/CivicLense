import axios from 'axios';
import type { ZonesResponse, Report, ScoreResult } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export async function fetchZones(): Promise<ZonesResponse> {
  const { data } = await api.get<ZonesResponse>('/zones');
  return data;
}

export async function fetchNode(id: number) {
  const { data } = await api.get(`/zones/${id}`);
  return data;
}

export async function fetchDistricts() {
  const { data } = await api.get('/zones/districts/all');
  return data;
}

export async function fetchReports(): Promise<Report[]> {
  const { data } = await api.get<Report[]>('/reports');
  return data;
}

export async function submitReport(payload: {
  encryptedPayload: string;
  incidentType: string;
  lat: number;
  lng: number;
  confirmationHash: string;
}) {
  const { data } = await api.post('/reports', payload);
  return data;
}

export async function verifyReport(hash: string) {
  const { data } = await api.get(`/reports/verify/${hash}`);
  return data;
}

export async function calculateScore(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<ScoreResult> {
  const { data } = await api.post<ScoreResult>('/score', {
    startLat,
    startLng,
    endLat,
    endLng,
  });
  return data;
}
