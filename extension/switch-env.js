#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const env = args[0];

if (!env || !['dev', 'prod'].includes(env)) {
  console.log('Usage: node switch-env.js [dev|prod]');
  console.log('');
  console.log('This script switches between development and production manifests.');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-env.js dev   # Switch to development (localhost)');
  console.log('  node switch-env.js prod  # Switch to production (jobschedule.io)');
  process.exit(1);
}

const manifestPath = path.join(__dirname, 'manifest.json');
const devManifestPath = path.join(__dirname, 'manifest.dev.json');

if (env === 'dev') {
  // Copy dev manifest to main manifest
  if (fs.existsSync(devManifestPath)) {
    fs.copyFileSync(devManifestPath, manifestPath);
    console.log('✅ Switched to DEVELOPMENT mode');
    console.log('   - API: http://localhost:3000/api');
    console.log('   - Test endpoints: enabled');
  } else {
    console.error('❌ Development manifest not found');
    process.exit(1);
  }
} else if (env === 'prod') {
  // Create production manifest
  const prodManifest = {
    "manifest_version": 3,
    "name": "JobSchedule",
    "version": "1.0.0",
    "description": "Track job applications from LinkedIn",
    "permissions": [
      "storage",
      "notifications",
      "scripting"
    ],
    "host_permissions": [
      "http://localhost:3000/*",
      "https://jobschedule.io/*",
      "*://*.linkedin.com/*"
    ],
    "action": {
      "default_popup": "popup.html",
      "default_icon": {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      }
    },
    "background": {
      "service_worker": "background.js",
      "type": "module"
    },
    "content_scripts": [
      {
        "matches": ["*://*.linkedin.com/*"],
        "js": ["content.js"]
      },
      {
        "matches": [
          "http://localhost:3000/*",
          "https://jobschedule.io/*"
        ],
        "js": ["jobschedule-content.js"]
      }
    ],
    "icons": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(prodManifest, null, 2));
  console.log('✅ Switched to PRODUCTION mode');
  console.log('   - API: https://jobschedule.io/api');
  console.log('   - Test endpoints: disabled');
}

console.log('');
console.log('🔄 Please reload the extension in Chrome to apply changes.');
console.log('   Chrome: chrome://extensions/ → JobSchedule → Reload'); 