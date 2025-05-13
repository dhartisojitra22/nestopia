// backend/utils/emailUtility.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_GMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ 
      from: process.env.MY_GMAIL, 
      to, 
      subject, 
      html 
    });
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;