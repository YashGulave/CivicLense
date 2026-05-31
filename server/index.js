const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database');
require('./db/seed');

const zonesRouter = require('./routes/zones');
const reportsRouter = require('./routes/reports');
const scoreRouter = require('./routes/score');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CivicLens API' });
});

app.use('/api/zones', zonesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/score', scoreRouter);

app.listen(PORT, () => {
  console.log(`CivicLens API running on http://localhost:${PORT}`);
});
