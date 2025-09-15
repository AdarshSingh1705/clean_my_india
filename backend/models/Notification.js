const pool = require('../db');

class Notification {
  static async create(userId, title, message, type, relatedId = null) {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userId, title, message, type, relatedId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserId(userId, limit = 20) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
  }

  static async markAsRead(notificationId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [notificationId]);
    return rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = Notification;
