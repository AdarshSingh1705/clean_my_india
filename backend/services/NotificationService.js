const pool = require('../db');

class NotificationService {
  static async create(userId, title, message, type = 'general', relatedId = null) {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [userId, title, message, type, relatedId];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }

  static async getUserNotifications(userId, limit = 20) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      const { rows } = await pool.query(query, [userId, limit]);
      return rows;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const { rows } = await pool.query(query, [notificationId, userId]);
      return rows[0];
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_read = FALSE
        RETURNING *
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = FALSE
      `;
      const { rows } = await pool.query(query, [userId]);
      return parseInt(rows[0].count);
    } catch (err) {
      console.error('Error getting unread count:', err);
      throw err;
    }
  }
}