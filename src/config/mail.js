import nodemailer from 'nodemailer';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Mail Configuration
 *
 * Creates a Nodemailer transporter using SMTP credentials.
 * The transporter is verified lazily on first send to avoid boot-time failures.
 */

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for 587
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
  return transporter;
};

/**
 * Send an email.
 * @param {Object} opts
 * @param {string} opts.to - Recipient email
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html - HTML body
 * @param {string} [opts.text] - Plain text fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      text: text || undefined,
    };
    const info = await getTransporter().sendMail(mailOptions);
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Email send failed', { error: error.message, to });
    throw error;
  }
};

export default { sendEmail };