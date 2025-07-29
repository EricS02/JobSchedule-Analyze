# JobSchedule Extension

A Chrome extension for automatically tracking job applications from LinkedIn.

## Setup

### Development Mode (Local Testing)
```bash
# Switch to development mode
node switch-env.js dev

# Reload extension in Chrome
# Go to chrome://extensions/ → JobSchedule (Dev) → Reload
```

### Production Mode (Live Site)
```bash
# Switch to production mode
node switch-env.js prod

# Reload extension in Chrome
# Go to chrome://extensions/ → JobSchedule → Reload
```

## Authentication

1. **Load the extension** in Chrome
2. **Go to** `https://jobschedule.io/dashboard/extension` (or `http://localhost:3000/dashboard/extension` for dev)
3. **Log in** to your account
4. **Click "Generate Token"** - the extension will automatically receive the token
5. **Return to the extension** and refresh if needed

## Features

- ✅ **Automatic Job Detection**: Detects when you're on LinkedIn job pages
- ✅ **Job Tracking**: Automatically tracks job applications
- ✅ **Dashboard Integration**: Jobs appear in your JobSchedule dashboard
- ✅ **Notifications**: Shows confirmation when jobs are tracked
- ✅ **Web App Authentication**: Seamless authentication via web app

## How It Works

1. **Job Detection**: The extension monitors LinkedIn job pages
2. **Data Extraction**: Extracts job title, company, location, and URL
3. **API Communication**: Sends job data to your JobSchedule backend
4. **Dashboard Update**: Jobs appear in your dashboard automatically

## Troubleshooting

### Extension Not Loading
- Check that the manifest.json has a valid version (e.g., "1.0.1")
- Reload the extension in Chrome

### Authentication Issues
- Make sure you're logged into the web app
- Generate a new token from the extension page
- Check browser console for errors

### Job Tracking Not Working
- Verify the extension is authenticated
- Check that you're on a LinkedIn job page
- Look for console logs starting with "🚀 JobSchedule"

## Development

### Files Structure
- `manifest.json` - Extension configuration
- `background.js` - Background service worker
- `content.js` - LinkedIn job detection script
- `popup.html/js` - Extension popup interface
- `config.js` - Environment configuration

### Environment Switching
- **Development**: Uses localhost:3000 API
- **Production**: Uses jobschedule.io API
- Use `node switch-env.js [dev|prod]` to switch

## Version History

- **1.0.1** - Development version with localhost API
- **1.0.0** - Production version with live API 