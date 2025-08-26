// Test OAuth URL generation
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

console.log('🔍 Testing OAuth Configuration...\n');

console.log('Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***configured***' : 'MISSING');
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);
console.log('PORT:', process.env.PORT);

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/plus.business.manage'
];

console.log('\n📝 Generated OAuth URL:');
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log(authUrl);

console.log('\n✅ If this URL works, your OAuth configuration is correct!');
console.log('🔗 Copy this URL to your browser to test the OAuth flow manually.');
