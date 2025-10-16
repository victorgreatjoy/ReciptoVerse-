// Test Email Configuration
// Run this to test if your email service is working

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailService() {
  console.log('\n📧 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  
  // Check if all required variables are set
  const missingVars = [];
  if (!process.env.EMAIL_HOST) missingVars.push('EMAIL_HOST');
  if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
  if (!process.env.EMAIL_PASS) missingVars.push('EMAIL_PASS');
  
  if (missingVars.length > 0) {
    console.log('\n❌ Missing environment variables:', missingVars.join(', '));
    console.log('\n🔧 Add these to your Railway environment variables:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_SECURE=false');
    console.log('EMAIL_USER=leandro.mirantexd@gmail.com');
    console.log('EMAIL_PASS=owno rsht xbyo dkhq');
    console.log('EMAIL_FROM=ReceiptoVerse <leandro.mirantexd@gmail.com>');
    return;
  }
  
  console.log('\n✅ All environment variables are set!');
  
  // Test email connection
  try {
    console.log('\n🔌 Testing SMTP connection...');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('\n📨 Sending test email...');
    
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'ReceiptoVerse Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">📧 Email Test Successful!</h2>
          <p>Your ReceiptoVerse email service is working correctly.</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Authentication failed! Check your Gmail App Password:');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Generate a new app password');
      console.log('3. Update EMAIL_PASS with the new password');
    }
  }
}

testEmailService();