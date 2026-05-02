const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/super-admin/schools — Fetch all schools
const getAllSchools = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, address, city, state, postal_code, country,
              principal_name, status, plan_type, is_active, expiry_date,
              created_at, updated_at
       FROM school ORDER BY created_at DESC`
    );
    return res.json({ schools: result.rows });
  } catch (err) {
    console.error('Get schools error:', err);
    return res.status(500).json({ error: 'Failed to fetch schools.' });
  }
};

// POST /api/super-admin/schools — Create school + provision first admin
const createSchool = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      name, email, phone, address, city, state, postal_code, country,
      principal_name, plan_type, expiry_date,
      admin_name, admin_email, admin_password
    } = req.body;

    // Validate required fields
    if (!name || !admin_name || !admin_email || !admin_password) {
      return res.status(400).json({
        error: 'School name, admin name, admin email, and admin password are required.'
      });
    }

    // Insert school
    const schoolResult = await client.query(
      `INSERT INTO school (name, email, phone, address, city, state, postal_code,
        country, principal_name, plan_type, is_active, expiry_date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,$11,'active',$12)
       RETURNING id, name, plan_type, expiry_date`,
      [name, email, phone, address, city, state, postal_code,
       country, principal_name, plan_type || 'trial', expiry_date,
       req.staffUser.full_name]
    );

    const school = schoolResult.rows[0];

    // Hash admin password and provision first admin in app_user
    const hashedPassword = await bcrypt.hash(admin_password, 10);

    const adminResult = await client.query(
      `INSERT INTO app_user (school_id, name, email, password_hash, role, status, created_by)
       VALUES ($1, $2, $3, $4, 'admin', 'active', $5)
       RETURNING id, name, email, role`,
      [school.id, admin_name, admin_email, hashedPassword, req.staffUser.full_name]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'School created and admin provisioned successfully.',
      school,
      admin: adminResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create school error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'School name or admin email already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create school.' });
  } finally {
    client.release();
  }
};

// PATCH /api/super-admin/schools/:id — Update school status/expiry
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, expiry_date, plan_type, status } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    if (expiry_date !== undefined) {
      fields.push(`expiry_date = $${paramIndex++}`);
      values.push(expiry_date);
    }
    if (plan_type !== undefined) {
      fields.push(`plan_type = $${paramIndex++}`);
      values.push(plan_type);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    fields.push(`updated_by = $${paramIndex++}`);
    values.push(req.staffUser.full_name);
    values.push(id);

    const result = await pool.query(
      `UPDATE school SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, is_active, expiry_date, plan_type, status`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found.' });
    }

    return res.json({
      message: 'School updated successfully.',
      school: result.rows[0],
    });
  } catch (err) {
    console.error('Update school error:', err);
    return res.status(500).json({ error: 'Failed to update school.' });
  }
};

module.exports = { getAllSchools, createSchool, updateSchool };
