// ============================================
// notification.service.js — Email + SMS + In-App Notifications
// ENABLE_SES=false  → nodemailer SMTP (existing)
// ENABLE_SES=true   → AWS SES SendEmailCommand
// ENABLE_SNS=false  → console.log
// ENABLE_SNS=true   → AWS SNS PublishCommand (direct SMS)
// ============================================

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

const isSES = () => process.env.ENABLE_SES === 'true';
const isSNS = () => process.env.ENABLE_SNS === 'true';

// ─── Lazy SES client ───────────────────────────────────────────────────────────
let _sesClient = null;
const getSESClient = () => {
  if (!_sesClient) {
    const { SESClient } = require('@aws-sdk/client-ses');
    const { awsConfig } = require('../config/aws.config');
    _sesClient = new SESClient(awsConfig);
  }
  return _sesClient;
};

// ─── Lazy SNS client ───────────────────────────────────────────────────────────
let _snsClient = null;
const getSNSClient = () => {
  if (!_snsClient) {
    const { SNSClient } = require('@aws-sdk/client-sns');
    const { awsConfig } = require('../config/aws.config');
    _snsClient = new SNSClient(awsConfig);
  }
  return _snsClient;
};

// ─── NCIE Brand Email Template ─────────────────────────────────────────────────
const buildEmailHtml = (bodyText) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
  background:#06080F;color:#ffffff;padding:32px;border-radius:12px">

  <div style="border-bottom:2px solid #FF6B2C;padding-bottom:16px;margin-bottom:24px">
    <h1 style="color:#FF6B2C;margin:0;font-size:1.4rem;letter-spacing:0.1em">NCIE</h1>
    <p style="color:#475569;margin:4px 0 0;font-size:0.75rem;letter-spacing:0.15em">
      NATIONAL CIVIC INTELLIGENCE ENGINE
    </p>
  </div>

  <p style="color:#CBD5E1;line-height:1.7">${bodyText}</p>

  <div style="border-top:1px solid #1E293B;margin-top:24px;padding-top:16px">
    <p style="color:#334155;font-size:0.75rem">
      This is an automated message from NCIE. A Digital India Initiative. 🇮🇳
    </p>
  </div>
</div>`;

// =============================================================================
//  EMAIL — sendEmail(to, subject, bodyTextOrHtml)
// =============================================================================

const sendEmailViaSES = async (to, subject, bodyText) => {
  const { SendEmailCommand } = require('@aws-sdk/client-ses');
  const client = getSESClient();

  const htmlBody = bodyText.startsWith('<') ? bodyText : buildEmailHtml(bodyText);

  await client.send(new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        Text: { Data: subject, Charset: 'UTF-8' }
      }
    }
  }));
  console.log(`[SES EMAIL SENT] To: ${to} | Subject: ${subject}`);
  return { success: true, provider: 'SES' };
};

const sendEmailViaSmtp = async (to, subject, htmlBody) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject} (No SMTP credentials configured)`);
    return { success: false, reason: 'SMTP not configured' };
  }
  const nodemailerTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  const info = await nodemailerTransport.sendMail({
    from: process.env.EMAIL_FROM || '"Project NCIE" <noreply@ncie.gov.in>',
    to, subject, html: htmlBody
  });
  console.log(`[SMTP EMAIL SENT] To: ${to} | MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId, provider: 'SMTP' };
};

const sendEmail = async (to, subject, htmlBody) => {
  try {
    if (isSES()) return await sendEmailViaSES(to, subject, htmlBody);
    return await sendEmailViaSmtp(to, subject, htmlBody);
  } catch (err) {
    console.error(`[EMAIL FAILED] To: ${to} | Error: ${err.message}`);
    return { success: false, error: err.message };
  }
};

// =============================================================================
//  SMS — sendSMS(phoneNumber, message)
// =============================================================================

const sendSMS = async (phoneNumber, message) => {
  if (!isSNS()) {
    console.log(`[SMS] To: ${phoneNumber} | ${message}`);
    return { success: true, mock: true };
  }

  try {
    const { PublishCommand } = require('@aws-sdk/client-sns');
    const client = getSNSClient();

    // Format as +91XXXXXXXXXX if not already
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+91${phoneNumber.replace(/\D/g, '')}`;

    const response = await client.send(new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    }));
    console.log(`[SNS SMS SENT] To: ${formattedPhone} | MessageId: ${response.MessageId}`);
    return { success: true, messageId: response.MessageId };
  } catch (err) {
    console.error(`[SNS SMS FAILED] Error: ${err.message}`);
    return { success: false, error: err.message };
  }
};

// =============================================================================
//  IN-APP NOTIFICATION — createNotification()
// =============================================================================

const createNotification = (userId, message, type = 'info', grievanceId = null) => {
  const db_instance = db.getDb();
  const notification = {
    id: `NOTIF-${uuidv4().slice(0, 8).toUpperCase()}`,
    userId,
    grievanceId,
    message,
    type,
    isRead: false,
    sentAt: new Date().toISOString()
  };
  db_instance.get('notifications').push(notification).write();
  return notification;
};

// =============================================================================
//  CONVENIENCE EMAIL TRIGGERS
// =============================================================================

const sendGrievanceFiledEmail = async (user, grievance) => {
  const subject = `✅ Grievance Filed — Tracking ID: ${grievance.id}`;
  const bodyText = `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your grievance has been successfully filed.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tr><td style="padding:8px;background:#0f172a;font-weight:bold;color:#94a3b8">Tracking ID</td>
            <td style="padding:8px;background:#0f172a;color:#FF6B2C"><strong>${grievance.id}</strong></td></tr>
        <tr><td style="padding:8px;color:#94a3b8">Title</td>
            <td style="padding:8px;color:#e2e8f0">${grievance.title}</td></tr>
        <tr><td style="padding:8px;background:#0f172a;color:#94a3b8">Category</td>
            <td style="padding:8px;background:#0f172a;color:#e2e8f0">${grievance.category}</td></tr>
        <tr><td style="padding:8px;color:#94a3b8">Priority</td>
            <td style="padding:8px;color:#e2e8f0">${grievance.priority}</td></tr>
      </table>
      <p>You can track your grievance status anytime on the 
         <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color:#FF6B2C">NCIE Portal</a>.</p>`;
  return await sendEmail(user.email, subject, buildEmailHtml(bodyText));
};

const sendStatusUpdateEmail = async (user, grievance, newStatus) => {
  const subject = `📋 Grievance Update — ${grievance.id} is now ${newStatus}`;
  const bodyText = `
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your grievance <strong>${grievance.id}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
      <p>Title: ${grievance.title}</p>
      ${grievance.adminNote ? `<p><strong>Officer Note:</strong> ${grievance.adminNote}</p>` : ''}
      <p>Track at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color:#FF6B2C">NCIE Portal</a></p>`;
  return await sendEmail(user.email, subject, buildEmailHtml(bodyText));
};

const sendEscrowFundsReleasedEmail = async (userEmail, userName, grievanceId) => {
  const subject = `💰 Funds Released — NyayKosh | ${grievanceId}`;
  const bodyText = `<p>Dear <strong>${userName}</strong>,</p>
      <p>The government funds for your grievance <strong>${grievanceId}</strong> have been released after your verification. The work is officially complete. Thank you for participating in NyayKosh.</p>`;
  return await sendEmail(userEmail, subject, buildEmailHtml(bodyText));
};

const sendSLABreachEmail = async (officerEmail, grievanceId, hoursOverdue) => {
  const subject = `⚠️ SLA Breach Warning — ${grievanceId}`;
  const bodyText = `<p>This is an automated SLA Breach notification.</p>
      <p>Grievance <strong>${grievanceId}</strong> has exceeded SLA by <strong>${hoursOverdue} hours</strong>. Immediate action is required to avoid escalation.</p>`;
  return await sendEmail(officerEmail, subject, buildEmailHtml(bodyText));
};

const sendPreSevaAlertEmail = async (departmentEmail, state, category, probability) => {
  const subject = `🚨 PreSeva Alert — High Risk Pattern Detected`;
  const bodyText = `<p>PreSeva AI has detected a high-risk grievance pattern.</p>
      <p><strong>State:</strong> ${state}<br>
         <strong>Category:</strong> ${category}<br>
         <strong>Risk Probability:</strong> ${Math.round(probability * 100)}%</p>
      <p>Please take preventive action immediately.</p>`;
  return await sendEmail(departmentEmail, subject, buildEmailHtml(bodyText));
};

module.exports = {
  sendEmail,
  sendSMS,
  createNotification,
  sendGrievanceFiledEmail,
  sendStatusUpdateEmail,
  sendEscrowFundsReleasedEmail,
  sendSLABreachEmail,
  sendPreSevaAlertEmail,
  isSES,
  isSNS
};
