const db = require('./database');
const CryptoJS = require('crypto-js');

const CITY_CENTER = { lat: 40.758, lng: -73.9855 };

const districts = [
  {
    name: 'Downtown Core',
    risk_level: 'high',
    description: 'Dense commercial district with extensive CCTV and facial recognition coverage.',
    center_lat: 40.758,
    center_lng: -73.9855,
    radius_m: 800,
    legal_framework: 'Metrovale Surveillance Act §4.2 — Public spaces may be monitored without individual consent. Facial recognition requires posted signage within 50m.',
  },
  {
    name: 'Financial District',
    risk_level: 'high',
    description: 'High-security zone with private and public surveillance integration.',
    center_lat: 40.7549,
    center_lng: -73.984,
    radius_m: 600,
    legal_framework: 'Financial Privacy Charter §12 — Data retention capped at 90 days for non-investigatory footage. Right to request deletion after 30 days.',
  },
  {
    name: 'Riverside Park',
    risk_level: 'low',
    description: 'Recreational area with minimal surveillance, designated privacy-friendly zone.',
    center_lat: 40.772,
    center_lng: -73.972,
    radius_m: 700,
    legal_framework: 'Green Space Privacy Ordinance §3 — No facial recognition permitted. CCTV limited to entrance/exit points only.',
  },
  {
    name: 'Residential North',
    risk_level: 'medium',
    description: 'Mixed residential-commercial area with moderate surveillance density.',
    center_lat: 40.768,
    center_lng: -73.982,
    radius_m: 650,
    legal_framework: 'Residential Privacy Code §7 — Residents may opt out of non-essential data collection. 45-day retention default.',
  },
  {
    name: 'Industrial East',
    risk_level: 'medium',
    description: 'Warehouse and logistics hub with data collection nodes and perimeter CCTV.',
    center_lat: 40.752,
    center_lng: -73.968,
    radius_m: 750,
    legal_framework: 'Industrial Monitoring Regulation §9 — Employers must notify workers of surveillance. Union areas exempt from audio recording.',
  },
];

const operators = [
  'Metrovale PD',
  'CityGrid Analytics',
  'SecureWatch Inc.',
  'Metro Transit Authority',
  'Private Security Co.',
  'OpenSafe Initiative',
];

const nodeTypes = ['cctv', 'facial_recognition', 'data_collection', 'safe_zone'];

function randomOffset(maxMeters = 500) {
  const latOffset = (Math.random() - 0.5) * (maxMeters / 111000) * 2;
  const lngOffset = (Math.random() - 0.5) * (maxMeters / (111000 * Math.cos(CITY_CENTER.lat * Math.PI / 180))) * 2;
  return { lat: latOffset, lng: lngOffset };
}

function generateNodes(count = 45) {
  const nodes = [];
  const typeWeights = [
    { type: 'cctv', weight: 0.4, risk: ['medium', 'high'] },
    { type: 'facial_recognition', weight: 0.2, risk: ['high'] },
    { type: 'data_collection', weight: 0.25, risk: ['medium', 'high'] },
    { type: 'safe_zone', weight: 0.15, risk: ['low'] },
  ];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let cumulative = 0;
    let selected = typeWeights[0];
    for (const tw of typeWeights) {
      cumulative += tw.weight;
      if (roll <= cumulative) {
        selected = tw;
        break;
      }
    }

    const district = districts[Math.floor(Math.random() * districts.length)];
    const offset = randomOffset(district.radius_m * 0.8);
    const risk = selected.risk[Math.floor(Math.random() * selected.risk.length)];

    nodes.push({
      name: `${selected.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Node ${String(i + 1).padStart(2, '0')}`,
      type: selected.type,
      operator: operators[Math.floor(Math.random() * operators.length)],
      retention_days: selected.type === 'safe_zone' ? 0 : Math.floor(Math.random() * 90) + 7,
      lat: district.center_lat + offset.lat,
      lng: district.center_lng + offset.lng,
      district_id: null,
      risk_level: risk,
      description: `Active ${selected.type.replace('_', ' ')} monitoring point operated by ${operators[Math.floor(Math.random() * operators.length)]}.`,
    });
  }
  return nodes;
}

const incidentTypes = ['theft', 'assault', 'vandalism', 'hazard', 'suspicious_activity', 'traffic_incident'];

function generateReports(count = 10) {
  const reports = [];
  for (let i = 0; i < count; i++) {
    const offset = randomOffset(1200);
    const lat = CITY_CENTER.lat + offset.lat;
    const lng = CITY_CENTER.lng + offset.lng;
    const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const payload = JSON.stringify({
      incident_type: incident,
      description: `Sample anonymized report #${i + 1}: ${incident} observed in the area.`,
      lat,
      lng,
    });
    const hash = CryptoJS.SHA256(payload + Date.now() + i).toString().substring(0, 16);
    const encrypted = CryptoJS.AES.encrypt(payload, 'civiclens-demo-key').toString();
    reports.push({ submission_hash: hash, incident_type: incident, encrypted_payload: encrypted, lat, lng });
  }
  return reports;
}

function seed() {
  const districtCount = db.prepare('SELECT COUNT(*) as count FROM districts').get().count;
  if (districtCount > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const insertDistrict = db.prepare(`
    INSERT INTO districts (name, risk_level, description, center_lat, center_lng, radius_m, legal_framework)
    VALUES (@name, @risk_level, @description, @center_lat, @center_lng, @radius_m, @legal_framework)
  `);

  const districtIds = {};
  for (const d of districts) {
    const result = insertDistrict.run(d);
    districtIds[d.name] = result.lastInsertRowid;
  }

  const insertNode = db.prepare(`
    INSERT INTO surveillance_nodes (name, type, operator, retention_days, lat, lng, district_id, risk_level, description)
    VALUES (@name, @type, @operator, @retention_days, @lat, @lng, @district_id, @risk_level, @description)
  `);

  const nodes = generateNodes(45);
  for (const node of nodes) {
    const nearestDistrict = districts.reduce((best, d) => {
      const dist = Math.hypot(node.lat - d.center_lat, node.lng - d.center_lng);
      return dist < best.dist ? { name: d.name, dist } : best;
    }, { name: districts[0].name, dist: Infinity });
    node.district_id = districtIds[nearestDistrict.name];
    insertNode.run(node);
  }

  const insertReport = db.prepare(`
    INSERT INTO reports (submission_hash, incident_type, encrypted_payload, lat, lng)
    VALUES (@submission_hash, @incident_type, @encrypted_payload, @lat, @lng)
  `);

  for (const report of generateReports(10)) {
    insertReport.run(report);
  }

  console.log(`Seeded ${districts.length} districts, ${nodes.length} surveillance nodes, and 10 reports.`);
}

seed();
