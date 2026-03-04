// ============================================
// notification.service.js — Email + In-App Notifications
// → AWS swap: Replace with AWS SES (email) + SNS (push)
// ============================================

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

// Create Gmail SMTP transporter
// → AWS SES: new SESClient({ region }) + SendEmailCommand
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send an email notification.
 * → AWS SES: sesClient.send(new SendEmailCommand({ Source, Destination, Message }))
 */
const sendEmail = async (to, subject, htmlBody) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject} (No SMTP credentials configured)`);
        return { success: false, reason: 'SMTP not configured' };
    }

    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Project NCIE Gov Portal" <noreply@ncie.gov.in>',
            to,
            subject,
            html: htmlBody
        });
        console.log(`[EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL FAILED] To: ${to} | Error: ${err.message}`);
        return { success: false, error: err.message };
    }
};

/**
 * Create an in-app notification record in the database.
 * → AWS SNS: snsClient.publish({ TopicArn, Message, Subject })
 */
const createNotification = (userId, message, type = 'info', grievanceId = null) => {
    const db_instance = db.getDb();
    const notification = {
        id: `NOTIF-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId,
        grievanceId,
        message,
        type, // info | success | warning | alert
        isRead: false,
        sentAt: new Date().toISOString()
    };

    db_instance.get('notifications')
        .push(notification)
        .write();

    return notification;
};

/**
 * Send grievance filed email to citizen.
 */
const sendGrievanceFiledEmail = async (user, grievance) => {
    const subject = `✅ Grievance Filed — Tracking ID: ${grievance.id}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #050b1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0; color: #FF6B2C;">⚖️ Project NCIE</h2>
        <p style="margin: 5px 0; color: #94a3b8;">AI-Powered Citizen Services</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your grievance has been successfully filed. Here are your details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Tracking ID</td><td style="padding: 8px; background: #f1f5f9;">${grievance.id}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Title</td><td style="padding: 8px;">${grievance.title}</td></tr>
          <tr><td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Category</td><td style="padding: 8px; background: #f1f5f9;">${grievance.category}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Status</td><td style="padding: 8px;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px;">Pending</span></td></tr>
          <tr><td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Filed On</td><td style="padding: 8px; background: #f1f5f9;">${new Date(grievance.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</td></tr>
        </table>
        <p>You can track your grievance status anytime using your Tracking ID at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #FF6B2C;">Project NCIE Portal</a></p>
        <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">Jai Hind 🇮🇳 | Ministry of Electronics and IT | Project NCIE</p>
      </div>
    </div>
  `;
    return await sendEmail(user.email, subject, html);
};

/**
 * Send grievance status update email.
 */
const sendStatusUpdateEmail = async (user, grievance, newStatus) => {
    const subject = `📋 Grievance Update — ${grievance.id} is now ${newStatus}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #050b1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="margin: 0; color: #FF6B2C;">⚖️ Project NCIE</h2>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your grievance <strong>${grievance.id}</strong> has been updated to: <strong>${newStatus}</strong></p>
        <p>Title: ${grievance.title}</p>
        ${grievance.adminNote ? `<p><strong>Officer Note:</strong> ${grievance.adminNote}</p>` : ''}
        <p>Track at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #FF6B2C;">Project NCIE Portal</a></p>
        <p style="color: #6b7280; font-size: 13px;">Jai Hind 🇮🇳 | Project NCIE</p>
      </div>
    </div>
  `;
    return await sendEmail(user.email, subject, html);
};

module.exports = {
    sendEmail,
    createNotification,
    sendGrievanceFiledEmail,
    sendStatusUpdateEmail
};
