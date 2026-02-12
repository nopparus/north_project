'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { generateToken, verifyToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
