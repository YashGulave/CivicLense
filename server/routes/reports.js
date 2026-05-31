const express = require('express');
const CryptoJS = require('crypto-js');
const db = require('../db/database');

const router = express.Router();

/**
 * GET /api/reports
 * Returns anonymized report metadata (no decrypted content).
 */
router.get('/', (req, res) => {
  const reports = db.prepare(`
    SELECT id, submission_hash, incident_type, lat, lng, created_at
    FROM reports
    ORDER BY created_at DESC
    LIMIT 50
  `).all();

  res.json(reports);
});

/**
 * POST /api/reports
 * Accepts client-side encrypted, metadata-stripped report payload.
 * Body: { encryptedPayload, incidentType, lat, lng, confirmationHash }
 */
router.post('/', (req, res) => {
  const { encryptedPayload, incidentType, lat, lng, confirmationHash } = req.body;

  if (!encryptedPayload || !incidentType || lat == null || lng == null || !confirmationHash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = db.prepare('SELECT id FROM reports WHERE submission_hash = ?').get(confirmationHash);
  if (existing) {
    return res.status(409).json({ error: 'Duplicate submission hash' });
  }

  const result = db.prepare(`
    INSERT INTO reports (submission_hash, incident_type, encrypted_payload, lat, lng)
    VALUES (?, ?, ?, ?, ?)
  `).run(confirmationHash, incidentType, encryptedPayload, lat, lng);

  res.status(201).json({
    id: result.lastInsertRowid,
    confirmationHash,
    message: 'Report submitted anonymously. Save your confirmation hash to verify later.',
  });
});

/**
 * GET /api/reports/verify/:hash
 * Verifies a submission exists by confirmation hash.
 */
router.get('/verify/:hash', (req, res) => {
  const report = db.prepare(`
    SELECT id, submission_hash, incident_type, created_at
    FROM reports
    WHERE submission_hash = ?
  `).get(req.params.hash);

  if (!report) {
    return res.status(404).json({ verified: false, error: 'Hash not found' });
  }

  res.json({ verified: true, report });
});

module.exports = router;
