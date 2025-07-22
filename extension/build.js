#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const mode = args[0] || 'dev';

if (mode === 'prod') {
  // Copy production manifest
  fs.copyFileSync('manifest.prod.json', 'manifest.json');
  console.log('✅ Switched to PRODUCTION mode (version: 1.0)');
  console.log('📦 Extension will use: https://jobschedule.io/api');
} else {
  // Ensure development manifest
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  if (!manifest.version.includes('dev')) {
    manifest.version = '1.0-dev';
    fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
  }
  console.log('✅ Switched to DEVELOPMENT mode (version: 1.0-dev)');
  console.log('🔧 Extension will use: http://localhost:3000/api');
}

console.log('\n📋 Usage:');
console.log('  node build.js dev   - Switch to development mode');
console.log('  node build.js prod  - Switch to production mode'); 