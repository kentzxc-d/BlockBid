const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Read .env.local manually so we don't need dotenv
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('RESEND_API_KEY=')) {
      apiKey = line.split('=')[1].trim();
      break;
    }
  }
}

if (!apiKey) {
  console.error("Could not find RESEND_API_KEY in .env.local");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'BlockBid <onboarding@blockbid.site>',
      to: ['kentmatubang@g.cjc.edu.ph', 'kriskirigaya23@gmail.com'],
      subject: '🚀 Test Email from BlockBid',
      html: `
        <div style="font-family: monospace; padding: 24px; background: #111; color: #fff; text-align: center;">
          <h2>[ SYSTEM_TEST_SUCCESSFUL ]</h2>
          <p>Bro! The Resend API is working perfectly!</p>
          <p>Your webhooks will be able to send emails to this address without any issues.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Success! Email sent. Response:', data);
    }
  } catch (err) {
    console.error('Crash:', err);
  }
}

testEmail();
