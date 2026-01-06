const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

// Initialize email transporter
const initializeEmailService = () => {
  if (config.EMAIL_USER && config.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
    console.log('✅ Email service initialized');
  } else {
    console.log('⚠️  Email credentials not configured. Email functionality will be disabled.');
  }
};

// Send email
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log(`📧 Email not sent (service not configured): ${subject} to ${to}`);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: config.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent: ${subject} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, name = 'User') => {
  const subject = 'Your OTP for InventroOps';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to InventroOps!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please use the following OTP to verify your email:</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">InventroOps - AI-Powered Inventory Management</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp) => {
  const subject = 'Password Reset - InventroOps';
  const html = `
    <h2>Password Reset Request</h2>
    <p>Your password reset OTP is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail
};
