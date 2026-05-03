const pool = require('../config/db');

const renewSchoolSubscription = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { amount, currency, period_months, paid_on, notes, reactivate_school } = req.body;

    if (!period_months || Number(period_months) <= 0) {
      return res.status(400).json({ error: 'period_months must be greater than 0.' });
    }

    await client.query('BEGIN');

    const schoolResult = await client.query(
      'SELECT id, expiry_date, is_active FROM school WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (schoolResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'School not found.' });
    }

    const nextExpiryResult = await client.query(
      `SELECT (
         GREATEST(COALESCE($1::date, CURRENT_DATE), CURRENT_DATE)
         + ($2::int * INTERVAL '1 month')
       )::date AS next_expiry_date`,
      [schoolResult.rows[0].expiry_date, period_months]
    );

    const nextExpiryDate = nextExpiryResult.rows[0].next_expiry_date;

    const renewalResult = await client.query(
      `INSERT INTO school_subscription_renewal (
         school_id, amount, currency, period_months, paid_on,
         new_expiry_date, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, school_id, amount, currency, period_months, paid_on, new_expiry_date, notes, created_at`,
      [
        id,
        amount || null,
        currency || 'INR',
        period_months,
        paid_on || new Date().toISOString().slice(0, 10),
        nextExpiryDate,
        notes || null,
        req.staffUser.full_name,
      ]
    );

    const shouldReactivate = reactivate_school === true || reactivate_school === 'true';
    const schoolUpdateResult = await client.query(
      `UPDATE school
       SET expiry_date = $1,
           is_active = CASE WHEN $2 THEN TRUE ELSE is_active END,
           status = CASE WHEN $2 THEN 'active' ELSE status END,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $3
       WHERE id = $4
       RETURNING id, name, is_active, status, expiry_date, plan_type`,
      [nextExpiryDate, shouldReactivate, req.staffUser.full_name, id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'School subscription renewed successfully.',
      renewal: renewalResult.rows[0],
      school: schoolUpdateResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Renew school error:', err);
    return res.status(500).json({ error: 'Failed to renew school subscription.' });
  } finally {
    client.release();
  }
};

const getSchoolRenewals = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, school_id, amount, currency, period_months, paid_on,
              new_expiry_date, notes, created_by, created_at
       FROM school_subscription_renewal
       WHERE school_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    return res.json({ renewals: result.rows });
  } catch (err) {
    console.error('Get renewals error:', err);
    return res.status(500).json({ error: 'Failed to fetch renewal history.' });
  }
};

module.exports = { renewSchoolSubscription, getSchoolRenewals };
