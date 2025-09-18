#!/usr/bin/env node

import { 
  isPortAvailable, 
  checkPortWithDetails, 
  checkMultiplePorts, 
  findAvailablePort 
} from './port-checker.js';

async function testPortChecker() {
  console.log('🧪 Testing Port Checker Utility\n');
  
  // Test 1: Check if a commonly available port is available
  console.log('Test 1: Checking available port (9999)...');
  const available = await isPortAvailable(9999);
  console.log(`Port 9999 available: ${available ? '✅' : '❌'}\n`);
  
  // Test 2: Check port with details
  console.log('Test 2: Checking port with detailed information...');
  const details = await checkPortWithDetails(9999, 'Test Service');
  console.log('Result:', details);
  console.log('');
  
  // Test 3: Check multiple ports
  console.log('Test 3: Checking multiple ports...');
  const multipleResults = await checkMultiplePorts([
    { port: 3000, service: 'Backend' },
    { port: 5173, service: 'Frontend' },
    { port: 9999, service: 'Test Service' }
  ]);
  
  multipleResults.forEach(result => {
    const status = result.available ? '✅ Available' : '❌ In Use';
    console.log(`${result.service} (Port ${result.port}): ${status}`);
    if (!result.available && result.suggestions) {
      result.suggestions.forEach(suggestion => {
        console.log(`  • ${suggestion}`);
      });
    }
  });
  console.log('');
  
  // Test 4: Find available port
  console.log('Test 4: Finding available port starting from 9990...');
  const availablePort = await findAvailablePort(9990, 5);
  if (availablePort) {
    console.log(`✅ Found available port: ${availablePort}`);
  } else {
    console.log('❌ No available ports found in range');
  }
  
  console.log('\n🎉 Port checker utility tests completed!');
}

// Run tests
testPortChecker().catch(console.error);