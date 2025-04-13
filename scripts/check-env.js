require('dotenv').config();

const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'WHATSAPP_VERIFY_TOKEN',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('🔍 Checking environment variables...\n');

let allSet = true;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ ${varName} is not set`);
    allSet = false;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

if (allSet) {
  console.log('\n✨ All required environment variables are set!');
} else {
  console.log('\n⚠️ Some environment variables are missing. Please set them in your .env file.');
} 