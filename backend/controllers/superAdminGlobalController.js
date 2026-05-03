const pool = require('../config/db');

// Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  const created_by = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO system_announcements (title, message, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, message, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

exports.updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, message, is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE system_announcements SET title = $1, message = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, message, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Support Tickets
exports.getSupportTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT st.*, s.name as school_name, au.username as submitted_by_name
      FROM support_tickets st
      JOIN school s ON st.school_id = s.id
      JOIN app_user au ON st.submitted_by = au.id
      ORDER BY st.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
};

exports.updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;

  try {
    const result = await pool.query(
      'UPDATE support_tickets SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, assigned_to, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};