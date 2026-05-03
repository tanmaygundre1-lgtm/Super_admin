const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/announcements', async (req, res) => {
  try {
    const result = await pool.query('SELECT title, message FROM system_announcements WHERE is_active = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

module.exports = router;