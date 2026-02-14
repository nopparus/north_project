'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const appsRoutes = require('./routes/apps');
const pmsRoutes = require('./routes/pms');

const app = express();
const PORT = process.env.PORT || 3001;

initDB();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/pms', pmsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Nexus API running on port ${PORT}`);
});
