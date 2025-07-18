#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Build configuration
const BUILD_CONFIG = {
  development: {
    environment: 'development',
    manifestFile: 'manifest.json',
    configFile: 'config.js',
    outputDir: 'dist/dev'
  },
  production: {
    environment: 'production',
    manifestFile: 'manifest.production.json',
    configFile: 'config.js',
    outputDir: 'dist/prod'
  }
};

function buildExtension(environment = 'development') {
  console.log(`Building JobSchedule extension for ${environment}...`);
  
  const config = BUILD_CONFIG[environment];
  const sourceDir = __dirname;
  const outputDir = path.join(sourceDir, config.outputDir);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Copy files
  const filesToCopy = [
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'icon16.png',
    'icon48.png',
    'icon128.png',
    'icon.png'
  ];
  
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(outputDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file}`);
    } else {
      console.log(`⚠ Warning: ${file} not found`);
    }
  });
  
  // Copy and update manifest
  const manifestSource = path.join(sourceDir, config.manifestFile);
  const manifestDest = path.join(outputDir, 'manifest.json');
  
  if (fs.existsSync(manifestSource)) {
    fs.copyFileSync(manifestSource, manifestDest);
    console.log(`✓ Copied manifest from ${config.manifestFile}`);
  }
  
  // Update config file for the target environment
  const configSource = path.join(sourceDir, config.configFile);
  const configDest = path.join(outputDir, 'config.js');
  
  if (fs.existsSync(configSource)) {
    let configContent = fs.readFileSync(configSource, 'utf8');
    
    // Update environment in config
    configContent = configContent.replace(
      /ENVIRONMENT:\s*['"]development['"]/,
      `ENVIRONMENT: '${environment}'`
    );
    
    fs.writeFileSync(configDest, configContent);
    console.log(`✓ Updated config for ${environment}`);
  }
  
  console.log(`\n✅ Build complete! Extension built in: ${outputDir}`);
  console.log(`\nTo load the extension in Chrome:`);
  console.log(`1. Go to chrome://extensions/`);
  console.log(`2. Enable "Developer mode"`);
  console.log(`3. Click "Load unpacked"`);
  console.log(`4. Select the folder: ${outputDir}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args[0] || 'development';

if (!BUILD_CONFIG[environment]) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Available environments: ${Object.keys(BUILD_CONFIG).join(', ')}`);
  process.exit(1);
}

buildExtension(environment); 