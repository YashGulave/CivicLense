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

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CivicLens API' });
});

app.use('/api/zones', zonesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/score', scoreRouter);

const clientDist = path.join(__dirname, '../client/dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CivicLens API running on http://localhost:${PORT}`);
});
