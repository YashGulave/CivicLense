const express = require('express');
const db = require('../db/database');

const router = express.Router();

/**
 * GET /api/zones
 * Returns all surveillance nodes and city districts.
 */
router.get('/', (req, res) => {
  const nodes = db.prepare(`
    SELECT n.*, d.name as district_name
    FROM surveillance_nodes n
    LEFT JOIN districts d ON n.district_id = d.id
    ORDER BY n.id
  `).all();

  const districts = db.prepare('SELECT * FROM districts ORDER BY id').all();

  res.json({ nodes, districts, cityCenter: { lat: 40.758, lng: -73.9855 } });
});

/**
 * GET /api/zones/districts/all
 * Returns all districts with node counts.
 */
router.get('/districts/all', (req, res) => {
  const districts = db.prepare(`
    SELECT d.*, COUNT(n.id) as node_count
    FROM districts d
    LEFT JOIN surveillance_nodes n ON n.district_id = d.id
    GROUP BY d.id
    ORDER BY d.id
  `).all();

  res.json(districts);
});

/**
 * GET /api/zones/:id
 * Returns a single surveillance node with district legal info.
 */
router.get('/:id', (req, res) => {
  const node = db.prepare(`
    SELECT n.*, d.name as district_name, d.legal_framework, d.risk_level as district_risk
    FROM surveillance_nodes n
    LEFT JOIN districts d ON n.district_id = d.id
    WHERE n.id = ?
  `).get(req.params.id);

  if (!node) {
    return res.status(404).json({ error: 'Zone not found' });
  }

  res.json(node);
});

module.exports = router;
