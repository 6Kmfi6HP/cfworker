#!/usr/bin/env node

// Simple test script to verify the Pages Function proxy is working
// Run this after deploying to test the proxy functionality

const https = require('https');

// Replace with your actual Pages domain
const PAGES_DOMAIN = 'b5374e3f.cfworker-pages.pages.dev';
const TEST_ENDPOINT = `/api/createWorker`;

function testProxy() {
  console.log('🧪 Testing Cloudflare Pages Function proxy...');
  console.log(`📡 Testing endpoint: https://${PAGES_DOMAIN}${TEST_ENDPOINT}`);
  
  const postData = JSON.stringify({
    workerName: 'test-worker',
    email: 'test@example.com',
    globalAPIKey: 'test-key',
    // Add other required fields for your API
  });

  const options = {
    hostname: PAGES_DOMAIN,
    port: 443,
    path: TEST_ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': `https://${PAGES_DOMAIN}`, // Simulate CORS request
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log('📋 Response Headers:');
    
    // Check for CORS headers
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    corsHeaders.forEach(header => {
      if (res.headers[header]) {
        console.log(`  ✅ ${header}: ${res.headers[header]}`);
      } else {
        console.log(`  ❌ Missing: ${header}`);
      }
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📄 Response Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(data);
      }
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ Proxy test successful!');
      } else {
        console.log('\n⚠️  Proxy test completed with non-success status');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  // Send the request
  req.write(postData);
  req.end();
}

// Test OPTIONS request (preflight)
function testOptions() {
  console.log('\n🧪 Testing OPTIONS request (CORS preflight)...');
  
  const options = {
    hostname: PAGES_DOMAIN,
    port: 443,
    path: TEST_ENDPOINT,
    method: 'OPTIONS',
    headers: {
      'Origin': `https://${PAGES_DOMAIN}`,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization',
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📊 OPTIONS Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 204) {
      console.log('✅ OPTIONS request successful!');
    } else {
      console.log('⚠️  OPTIONS request returned unexpected status');
    }
    
    // Test the main request after OPTIONS
    setTimeout(testProxy, 1000);
  });

  req.on('error', (e) => {
    console.error(`❌ OPTIONS request error: ${e.message}`);
  });

  req.end();
}

// Instructions
console.log('🚀 Cloudflare Pages Function Proxy Test');
console.log('=====================================');
console.log('');
console.log('📝 Testing domain: ' + PAGES_DOMAIN);
console.log('');

// Start testing
testOptions(); 