import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const BASE_URL = process.env.BASE_URL;
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in environment variables.");
  }

  const verificationLink = `${BASE_URL}/verify?token=${encodeURIComponent(token)}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `OROA <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "⚔️ BEGIN YOUR QUEST - One small click for you, one giant leap for hero-kind",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap');
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #FFF3E0;
          margin: 0;
          padding: 0;
          color: #212121;
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(216, 67, 21, 0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #D84315, #FF5722);
          padding: 50px 32px 60px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: "";
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .header::after {
          content: "";
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }
        
        .logo {
          margin-bottom: 20px;
        }
        
        .logo-text {
          font-size: 42px;
          font-weight: 800;
          font-family: 'Merriweather', serif;
          background: linear-gradient(45deg, #FFF3E0, #FFFFFF);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          letter-spacing: 1px;
          line-height: 1;
          display: inline-block;
          padding: 0 16px;
        }
        
        .content {
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }
        
        .hero-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          margin: 0 auto 32px;
          display: block;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .button {
          display: inline-block;
          padding: 18px 36px;
          background: linear-gradient(to right, #D84315, #FF7043);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 20px;
          margin: 32px 0;
          text-align: center;
          box-shadow: 0 4px 16px rgba(216, 67, 21, 0.3);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(216, 67, 21, 0.4);
          background: linear-gradient(to right, #BF360C, #F4511E);
        }
        
        .link-text {
          word-break: break-all;
          background: #FFF3E0;
          padding: 14px 18px;
          border-radius: 8px;
          font-size: 14px;
          margin: 24px 0;
          border: 1px solid rgba(216, 67, 21, 0.1);
          font-family: monospace;
          line-height: 1.5;
        }
        
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #757575;
          border-top: 1px solid rgba(216, 67, 21, 0.1);
          background: rgba(255, 243, 224, 0.5);
        }
        
        h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 24px;
          color: #212121;
          line-height: 1.3;
          font-family: 'Merriweather', serif;
        }
        
        p {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 24px;
          color: #424242;
        }
        
        .highlight {
          color: #D84315;
          font-weight: 700;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(216, 67, 21, 0.2), transparent);
          margin: 32px 0;
        }
        
        .emoji {
          font-size: 24px;
          vertical-align: middle;
          line-height: 1;
        }
        
        .hero-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 24px;
          background: linear-gradient(to right, #D84315, #FF5722);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: 'Merriweather', serif;
          text-align: center;
        }
        
        .cta-badge {
          display: inline-block;
          padding: 12px 24px;
          background: #FFF3E0;
          border-radius: 24px;
          font-size: 16px;
          color: #D84315;
          font-weight: 600;
          margin: 24px auto;
          text-align: center;
          box-shadow: 0 4px 12px rgba(216, 67, 21, 0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .info-note {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .info-note .emoji {
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .info-note p {
          margin: 0;
          font-size: 15px;
          color: #616161;
        }
        
        .header-tagline {
          font-size: 26px;
          font-weight: 700;
          margin: 16px 0 8px;
          color: white;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          letter-spacing: 0.5px;
        }
        
        .header-subtagline {
          font-size: 22px;
          opacity: 0.95;
          margin: 0;
          color: rgba(255,255,255,0.95);
          font-weight: 500;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Hero Header -->
        <div class="header">
          <div class="logo">
            <div class="logo-text">OROA</div>
          </div>
          <div class="header-tagline">BEGIN YOUR HEROIC JOURNEY</div>
          <div class="header-subtagline">One small click for you,<br>one giant leap for hero-kind</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <img src="https://res.cloudinary.com/dhawc8ola/image/upload/v1747930426/bcjt77wfvjtjrzasroli.jpg" alt="Heroic Adventure" class="hero-image">

          <h1 class="hero-title">Welcome, Brave Hero! <span class="emoji">🛡️</span></h1>

          <p>We're thrilled to have you join our legendary community of adventurers at <span class="highlight">OROA</span>. Before you can embark on your first epic quest, we need to verify your email address.</p>

          <p>This sacred ritual ensures the safety of your account and helps us maintain a secure realm for all heroes.</p>

          <div style="text-align: center;">
            <a href="${verificationLink}" class="button" style="color: white;">VERIFY MY EMAIL</a>
          </div>

          <div class="divider"></div>

          <div class="info-note">
            <span class="emoji">⏳</span>
            <p>This verification link will expire in <strong>30 minutes</strong>.</p>
          </div>
          
          <div class="info-note">
            <span class="emoji">⚠️</span>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
          
          <div class="info-note">
            <span class="emoji">🔗</span>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          </div>

          <div class="link-text">${verificationLink}</div>
          
          <div style="text-align: center; margin-top: 40px;">
            <div class="cta-badge">
              ⚡ YOUR ADVENTURE BEGINS NOW ⚡
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>© ${new Date().getFullYear()} OROA. All rights reserved.</p>
          <p>Where heroes forge legends and claim eternal glory <span class="emoji">⚔️</span></p>
        </div>
      </div>
    </body>
    </html>
    `,
    text: `BEGIN YOUR QUEST WITH OROA!\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this email, please ignore it.\n\n- The OROA Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const BASE_URL = process.env.BASE_URL;
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in environment variables.");
  }

  const verificationLink = `${BASE_URL}/verify?token=${encodeURIComponent(token)}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: `OROA <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "⚔️ BEGIN YOUR QUEST - One small click for you, one giant leap for hero-kind",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap');
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #FFF3E0;
          margin: 0;
          padding: 0;
          color: #212121;
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(216, 67, 21, 0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #D84315, #FF5722);
          padding: 50px 32px 60px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: "";
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .header::after {
          content: "";
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }
        
        .logo {
          margin-bottom: 20px;
        }
        
        .logo-text {
          font-size: 42px;
          font-weight: 800;
          font-family: 'Merriweather', serif;
          background: linear-gradient(45deg, #FFF3E0, #FFFFFF);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          letter-spacing: 1px;
          line-height: 1;
          display: inline-block;
          padding: 0 16px;
        }
        
        .content {
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }
        
        .hero-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          margin: 0 auto 32px;
          display: block;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .button {
          display: inline-block;
          padding: 18px 36px;
          background: linear-gradient(to right, #D84315, #FF7043);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 20px;
          margin: 32px 0;
          text-align: center;
          box-shadow: 0 4px 16px rgba(216, 67, 21, 0.3);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(216, 67, 21, 0.4);
          background: linear-gradient(to right, #BF360C, #F4511E);
        }
        
        .link-text {
          word-break: break-all;
          background: #FFF3E0;
          padding: 14px 18px;
          border-radius: 8px;
          font-size: 14px;
          margin: 24px 0;
          border: 1px solid rgba(216, 67, 21, 0.1);
          font-family: monospace;
          line-height: 1.5;
        }
        
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #757575;
          border-top: 1px solid rgba(216, 67, 21, 0.1);
          background: rgba(255, 243, 224, 0.5);
        }
        
        h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 24px;
          color: #212121;
          line-height: 1.3;
          font-family: 'Merriweather', serif;
        }
        
        p {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 24px;
          color: #424242;
        }
        
        .highlight {
          color: #D84315;
          font-weight: 700;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(216, 67, 21, 0.2), transparent);
          margin: 32px 0;
        }
        
        .emoji {
          font-size: 24px;
          vertical-align: middle;
          line-height: 1;
        }
        
        .hero-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 24px;
          background: linear-gradient(to right, #D84315, #FF5722);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: 'Merriweather', serif;
          text-align: center;
        }
        
        .cta-badge {
          display: inline-block;
          padding: 12px 24px;
          background: #FFF3E0;
          border-radius: 24px;
          font-size: 16px;
          color: #D84315;
          font-weight: 600;
          margin: 24px auto;
          text-align: center;
          box-shadow: 0 4px 12px rgba(216, 67, 21, 0.1);
          border: 1px solid rgba(216, 67, 21, 0.1);
        }
        
        .info-note {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .info-note .emoji {
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .info-note p {
          margin: 0;
          font-size: 15px;
          color: #616161;
        }
        
        .header-tagline {
          font-size: 26px;
          font-weight: 700;
          margin: 16px 0 8px;
          color: white;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          letter-spacing: 0.5px;
        }
        
        .header-subtagline {
          font-size: 22px;
          opacity: 0.95;
          margin: 0;
          color: rgba(255,255,255,0.95);
          font-weight: 500;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Hero Header -->
        <div class="header">
          <div class="logo">
            <div class="logo-text">OROA</div>
          </div>
          <div class="header-tagline">BEGIN YOUR HEROIC JOURNEY</div>
          <div class="header-subtagline">One small click for you,<br>one giant leap for hero-kind</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <img src="https://res.cloudinary.com/dhawc8ola/image/upload/v1747930426/bcjt77wfvjtjrzasroli.jpg" alt="Heroic Adventure" class="hero-image">

          <h1 class="hero-title">Welcome, Brave Hero! <span class="emoji">🛡️</span></h1>

          <p>We're thrilled to have you join our legendary community of adventurers at <span class="highlight">OROA</span>. Before you can embark on your first epic quest, we need to verify your email address.</p>

          <p>This sacred ritual ensures the safety of your account and helps us maintain a secure realm for all heroes.</p>

          <div style="text-align: center;">
            <a href="${verificationLink}" class="button" style="color: white;">VERIFY MY EMAIL</a>
          </div>

          <div class="divider"></div>

          <div class="info-note">
            <span class="emoji">⏳</span>
            <p>This verification link will expire in <strong>30 minutes</strong>.</p>
          </div>
          
          <div class="info-note">
            <span class="emoji">⚠️</span>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
          
          <div class="info-note">
            <span class="emoji">🔗</span>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          </div>

          <div class="link-text">${verificationLink}</div>
          
          <div style="text-align: center; margin-top: 40px;">
            <div class="cta-badge">
              ⚡ YOUR ADVENTURE BEGINS NOW ⚡
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>© ${new Date().getFullYear()} OROA. All rights reserved.</p>
          <p>Where heroes forge legends and claim eternal glory <span class="emoji">⚔️</span></p>
        </div>
      </div>
    </body>
    </html>
    `,
    text: `BEGIN YOUR QUEST WITH OROA!\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this email, please ignore it.\n\n- The OROA Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    throw error;
  }
}