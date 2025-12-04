const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials not configured. EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
      console.log('⚠️ EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
      return;
    }

    console.log('📧 Initializing email service with:', process.env.EMAIL_USER);

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Email service initialized');
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.log('❌ Email service not configured, skipping email to:', to);
      throw new Error('Email service not initialized');
    }

    console.log('📤 Attempting to send email to:', to);
    console.log('📤 Subject:', subject);

    try {
      const mailOptions = {
        from: `"Clean My India" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      console.log('📤 Sending email with options:', { from: mailOptions.from, to: mailOptions.to });
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully! MessageId:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Email send error - Full details:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async sendIssueStatusUpdate(userEmail, userName, issueTitle, oldStatus, newStatus) {
    const statusEmojis = {
      pending: '⏳',
      in_progress: '🔧',
      resolved: '✅',
      closed: '🔒'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Issue Status Update</h2>
        <p>Hello ${userName},</p>
        <p>Your reported issue has been updated:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${issueTitle}</h3>
          <p style="margin: 10px 0;">
            Status changed from: 
            <strong>${statusEmojis[oldStatus]} ${oldStatus.replace('_', ' ').toUpperCase()}</strong>
            →
            <strong>${statusEmojis[newStatus]} ${newStatus.replace('_', ' ').toUpperCase()}</strong>
          </p>
        </div>
        <p>Thank you for helping keep India clean!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Clean My India. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail(
      userEmail,
      `Issue Update: ${issueTitle}`,
      html
    );
  }

  async sendNewCommentNotification(userEmail, userName, issueTitle, commenterName, commentText) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Comment on Your Issue</h2>
        <p>Hello ${userName},</p>
        <p><strong>${commenterName}</strong> commented on your issue:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${issueTitle}</h3>
          <p style="background: white; padding: 15px; border-left: 3px solid #2563eb; margin: 10px 0;">
            "${commentText}"
          </p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/issues" 
             style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Issue
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Clean My India. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail(
      userEmail,
      `New comment on: ${issueTitle}`,
      html
    );
  }

  async sendIssueResolvedNotification(userEmail, userName, issueTitle) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 Issue Resolved!</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your reported issue has been resolved:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">${issueTitle}</h3>
          <p style="margin: 10px 0;">
            ✅ Status: <strong>RESOLVED</strong>
          </p>
        </div>
        <p>Thank you for your contribution to making India cleaner! 🇮🇳</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Clean My India. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail(
      userEmail,
      `✅ Issue Resolved: ${issueTitle}`,
      html
    );
  }
}

module.exports = new EmailService();
