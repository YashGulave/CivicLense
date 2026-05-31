const express = require('express');
const db = require('../db/database');

const router = express.Router();

const RISK_WEIGHTS = { low: 1, medium: 3, high: 7 };
const TYPE_WEIGHTS = {
  cctv: 1.0,
  facial_recognition: 2.5,
  data_collection: 1.8,
  safe_zone: -0.5,
};
const NODE_RADIUS_M = 120;
const DISTRICT_RADIUS_FACTOR = 1.0;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDistanceMeters(px, py, x1, y1, x2, y2) {
  const latScale = 111000;
  const lngScale = 111000 * Math.cos(((y1 + y2) / 2) * Math.PI / 180);

  const ax = x1 * latScale;
  const ay = y1 * lngScale;
  const bx = x2 * latScale;
  const by = y2 * lngScale;
  const pxS = px * latScale;
  const pyS = py * lngScale;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(pxS - ax, pyS - ay);

  let t = ((pxS - ax) * dx + (pyS - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.hypot(pxS - projX, pyS - projY);
}

function lineIntersectsCircle(lat1, lng1, lat2, lng2, clat, clng, radiusM) {
  return pointToSegmentDistanceMeters(clat, clng, lat1, lng1, lat2, lng2) <= radiusM;
}

/**
 * POST /api/score
 * Calculates privacy risk score for a route.
 * Body: { startLat, startLng, endLat, endLng }
 */
router.post('/', (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.body;

  if ([startLat, startLng, endLat, endLng].some(v => v == null)) {
    return res.status(400).json({ error: 'Start and end coordinates required' });
  }

  const routeDistance = haversineMeters(startLat, startLng, endLat, endLng);
  const nodes = db.prepare('SELECT * FROM surveillance_nodes').all();
  const districts = db.prepare('SELECT * FROM districts').all();

  const intersectedNodes = nodes.filter((n) =>
    lineIntersectsCircle(startLat, startLng, endLat, endLng, n.lat, n.lng, NODE_RADIUS_M)
  );

  const intersectedDistricts = districts.filter((d) =>
    lineIntersectsCircle(startLat, startLng, endLat, endLng, d.center_lat, d.center_lng, d.radius_m * DISTRICT_RADIUS_FACTOR)
  );

  let rawScore = 0;
  const breakdown = {
    nodes: [],
    districts: [],
    byType: { cctv: 0, facial_recognition: 0, data_collection: 0, safe_zone: 0 },
  };

  for (const node of intersectedNodes) {
    const nodeScore = RISK_WEIGHTS[node.risk_level] * (TYPE_WEIGHTS[node.type] || 1);
    rawScore += nodeScore;
    breakdown.byType[node.type] = (breakdown.byType[node.type] || 0) + 1;
    breakdown.nodes.push({
      id: node.id,
      name: node.name,
      type: node.type,
      risk_level: node.risk_level,
      operator: node.operator,
      contribution: Math.round(nodeScore * 10) / 10,
    });
  }

  for (const district of intersectedDistricts) {
    const districtScore = RISK_WEIGHTS[district.risk_level] * 2;
    rawScore += districtScore;
    breakdown.districts.push({
      id: district.id,
      name: district.name,
      risk_level: district.risk_level,
      contribution: districtScore,
    });
  }

  const maxPossible = nodes.length * 7 * 2.5 + districts.length * 14;
  const normalizedScore = Math.min(100, Math.round((rawScore / Math.max(maxPossible * 0.15, 1)) * 100));

  let riskLabel = 'Low';
  if (normalizedScore >= 70) riskLabel = 'Critical';
  else if (normalizedScore >= 50) riskLabel = 'High';
  else if (normalizedScore >= 30) riskLabel = 'Moderate';

  res.json({
    score: normalizedScore,
    riskLabel,
    routeDistanceM: Math.round(routeDistance),
    intersectedNodeCount: intersectedNodes.length,
    intersectedDistrictCount: intersectedDistricts.length,
    breakdown,
    recommendations: getRecommendations(normalizedScore, breakdown),
  });
});

function getRecommendations(score, breakdown) {
  const recs = [];
  if (breakdown.byType.facial_recognition > 0) {
    recs.push('Your route passes through facial recognition zones. Consider alternative paths or privacy-preserving accessories where legally permitted.');
  }
  if (breakdown.byType.data_collection > 2) {
    recs.push('Multiple data collection nodes detected. Disable unnecessary device connectivity during transit.');
  }
  if (score >= 50) {
    recs.push('High surveillance density on this route. Review Know Your Rights for affected districts.');
  }
  if (breakdown.byType.safe_zone > 0) {
    recs.push('Safe zones detected along your route — these areas have reduced monitoring.');
  }
  if (recs.length === 0) {
    recs.push('This route has relatively low surveillance exposure. Stay aware of your surroundings.');
  }
  return recs;
}

module.exports = router;
