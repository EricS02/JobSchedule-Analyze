# JobSchedule Extension

A Chrome extension for tracking job applications from LinkedIn.

## Environment Configuration

The extension now uses environment-based configuration instead of hardcoded development mode.

### How it works

The extension automatically detects whether it's running in development or production mode based on the version in `manifest.json`:

- **Development**: Version contains "dev" (e.g., "1.0-dev")
  - Uses: `http://localhost:3000/api`
  - Enables test endpoints and development features

- **Production**: Version is clean (e.g., "1.0")
  - Uses: `https://jobschedule.io/api`
  - Disables test endpoints and development features

### Switching Modes

Use the build script to switch between development and production modes:

```bash
# Switch to development mode
node build.js dev

# Switch to production mode
node build.js prod
```

### Manual Configuration

If you prefer to manually configure:

1. **Development Mode**: Edit `manifest.json` and set `"version": "1.0-dev"`
2. **Production Mode**: Edit `manifest.json` and set `"version": "1.0"`

### Files Changed

- `config.js` - Now uses `chrome.runtime.getManifest().version` to detect mode
- `background.js` - Imports configuration from `config.js`
- `manifest.json` - Updated to include production domain permissions
- `manifest.prod.json` - Production version of manifest
- `build.js` - Script to switch between modes

### Benefits

✅ **No more hardcoded development mode**  
✅ **Automatic environment detection**  
✅ **Easy switching between dev/prod**  
✅ **Production-ready configuration**  
✅ **Maintains backward compatibility**

## Security Enhancements

The extension now includes comprehensive security features:

### Message Validation
- **Action Whitelist**: Only allows predefined actions (`trackJobApplication`, `checkAuth`)
- **Data Structure Validation**: Validates required fields and data types
- **Enhanced Logging**: Detailed security event logging

### Input Sanitization
- **String Sanitization**: Trims and limits string lengths
- **URL Validation**: Validates URL format before processing
- **Data Type Validation**: Ensures proper data types for all fields

### Rate Limiting
- **Request Limiting**: 10 requests per minute per user
- **Abuse Prevention**: Prevents spam and abuse
- **Configurable Limits**: Easy to adjust rate limits

### Security Utilities (`security.js`)
- `sanitizeString()` - Sanitize string inputs
- `isValidUrl()` - Validate URL format
- `isValidEmail()` - Validate email format
- `validateJobData()` - Comprehensive job data validation
- `logSecurityEvent()` - Security event logging
- `RateLimiter` - Rate limiting utility

### Security Features
✅ **Input validation and sanitization**  
✅ **Rate limiting protection**  
✅ **Action whitelisting**  
✅ **Comprehensive error logging**  
✅ **Data type validation**  
✅ **URL validation**  
✅ **Security event tracking**

## Error Logging & Monitoring

The extension now includes production-ready error logging and monitoring:

### Centralized Error Logger (`error-logger.js`)
- `logError()` - Enhanced error logging with context
- `getUserFriendlyMessage()` - Convert technical errors to user-friendly messages
- `logApiError()` - Log API response errors with full context
- `showErrorNotification()` - Show error notifications to users
- `logPerformance()` - Track operation performance metrics
- `logLifecycleEvent()` - Log extension lifecycle events

### Error Categories
- **Network Errors**: Connection issues, timeouts
- **Authentication Errors**: 401/403 responses
- **Server Errors**: 500/502/503 responses
- **Validation Errors**: Invalid data, missing fields
- **Rate Limiting**: Too many requests
- **Critical Errors**: Security-related issues

### Performance Monitoring
- **Operation Timing**: Track how long operations take
- **Slow Operation Detection**: Warn when operations take >5 seconds
- **Success/Failure Metrics**: Track operation success rates

### Error Features
✅ **Comprehensive error context**  
✅ **User-friendly error messages**  
✅ **Performance monitoring**  
✅ **Security event integration**  
✅ **API error logging**  
✅ **Lifecycle event tracking**  
✅ **Critical error detection**  
✅ **Stack trace preservation** 