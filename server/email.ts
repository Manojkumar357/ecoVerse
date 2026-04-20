import nodemailer from 'nodemailer';

const MAIL_USER = process.env.GMAIL_USER || process.env.EMAIL;
const MAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
const MAIL_FROM_NAME = process.env.GMAIL_FROM_NAME || 'EcoVerse Platform';

// Create Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email via Gmail
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: `${MAIL_FROM_NAME} <${MAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || 'Please enable HTML emails to view this message.',
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0;">Welcome to EcoVerse!</h1>
      </div>
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>Thank you for signing up to EcoVerse! We're excited to have you join our community dedicated to environmental excellence and gamified learning.</p>
        <p>You can now:</p>
        <ul>
          <li>Complete interactive environmental missions</li>
          <li>Earn eco-points and badges</li>
          <li>Join community challenges</li>
          <li>Track your environmental impact</li>
        </ul>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'http://localhost:5000'}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to EcoVerse!',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetLink: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0;">Reset Your Password</h1>
      </div>
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>We received a request to reset your EcoVerse password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </p>
        <p style="color: #999; font-size: 12px;">
          This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your EcoVerse Password',
    html,
  });
}

/**
 * Send application status notification
 */
export async function sendApplicationStatusEmail(
  email: string,
  name: string,
  status: 'approved' | 'rejected' | 'pending',
  message?: string
) {
  const statusColors = {
    approved: '#10b981',
    rejected: '#ef4444',
    pending: '#f59e0b',
  };

  const statusMessages = {
    approved: 'Your application has been approved! You can now access EcoVerse.',
    rejected: 'Unfortunately, your application was not approved at this time.',
    pending: 'Your application is being reviewed. We will notify you soon.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${statusColors[status]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; text-transform: capitalize;">Application ${status}</h1>
      </div>
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>${statusMessages[status]}</p>
        ${message ? `<p style="background: #fff; padding: 15px; border-left: 4px solid ${statusColors[status]};">${message}</p>` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `EcoVerse Application - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html,
  });
}

/**
 * Test email functionality
 */
export async function testEmail() {
  try {
    await transporter.verify();
    console.log('Email service is configured correctly');
    return { success: true };
  } catch (error) {
    console.error('Email service configuration error:', error);
    throw error;
  }
}
