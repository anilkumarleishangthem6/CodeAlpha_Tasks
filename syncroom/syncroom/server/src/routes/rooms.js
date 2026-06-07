const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticateToken, (req, res) => {
  const roomId = uuidv4().split('-')[0].toUpperCase();
  res.json({ roomId });
});

router.get('/:roomId/exists', (req, res) => {
  res.json({ exists: true });
});

module.exports = router;
