#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Environment variables
# API endpoint for worker deployment
VITE_API_ENDPOINT=https://cfworkerback-pages5.pages.dev/createWorker

# Maximum number of proxy IPs
VITE_MAX_PROXY_IPS=50
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
  console.log('📝 You can modify the values in .env file as needed');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n🚀 To start development server with CORS proxy:');
console.log('   npm run dev');
console.log('   or');
console.log('   pnpm dev'); 