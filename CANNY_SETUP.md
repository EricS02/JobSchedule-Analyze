# Canny Feedback Widget Setup Guide

## Overview
The feedback and feature requests section uses Canny, an external review board service, to collect user feedback and feature requests.

## Environment Configuration

### Required Environment Variable
Add this to your `.env.local` file:

```env
# Canny Configuration
NEXT_PUBLIC_CANNY_BOARD_TOKEN=your_canny_board_token_here
```

### Current Configuration
- **Board Token**: `6575155d-84fb-8b47-17e8-372da13b27eb` (fallback)
- **Service**: Canny.io
- **Features**: Feedback collection, feature requests, voting

## Setup Steps

### 1. Create Canny Account
1. Sign up at [canny.io](https://canny.io)
2. Create a new board for your application
3. Get your board token from the Canny dashboard

### 2. Configure Environment
1. Create `.env.local` file in your project root
2. Add your Canny board token:
   ```env
   NEXT_PUBLIC_CANNY_BOARD_TOKEN=your_actual_board_token
   ```

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to `/dashboard/feedback`
3. The Canny widget should load automatically

## Troubleshooting

### Common Issues

#### 1. Widget Not Loading
**Symptoms**: Blank page or loading spinner
**Solutions**:
- Check browser console for errors
- Verify board token is correct
- Check network connectivity to canny.io
- Try refreshing the page

#### 2. Network Errors
**Symptoms**: "Failed to load feedback widget" error
**Solutions**:
- Check internet connection
- Verify Canny service is accessible
- Check if corporate firewall blocks canny.io
- Try using a different network

#### 3. Invalid Board Token
**Symptoms**: "Failed to load feedback widget" error
**Solutions**:
- Verify board token in Canny dashboard
- Check environment variable is set correctly
- Restart development server after changing .env

#### 4. Theme Issues
**Symptoms**: Widget doesn't match app theme
**Solutions**:
- Widget automatically detects light/dark theme
- Refresh page after theme change
- Check if theme detection is working

### Debug Information

#### Console Logs
The component logs helpful information:
- `Canny feedback widget loaded successfully` - Widget loaded
- `Error rendering Canny widget: [error]` - Rendering failed
- `Error loading Canny SDK: [error]` - SDK loading failed

#### Network Requests
Check browser Network tab for:
- `https://canny.io/sdk.js` - SDK loading
- Canny API requests - Widget functionality

### Fallback Behavior

If the widget fails to load:
1. **Retry Button**: Users can manually retry loading
2. **Error Message**: Clear explanation of the issue
3. **Support Contact**: Guidance for persistent issues
4. **Token Display**: Shows partial token for debugging

## Features

### User Experience
- ✅ **Automatic Loading**: Widget loads on page visit
- ✅ **Theme Support**: Matches app light/dark theme
- ✅ **Error Handling**: Graceful fallback for failures
- ✅ **Retry Mechanism**: Manual retry option
- ✅ **Loading States**: Clear loading indicators

### Technical Features
- ✅ **Environment Configuration**: Configurable board token
- ✅ **Error Recovery**: Multiple retry attempts
- ✅ **Console Logging**: Detailed error information
- ✅ **Network Resilience**: Handles network issues
- ✅ **Theme Integration**: Automatic theme detection

## Security Considerations

### Public Token
- The board token is public and safe to expose
- It only identifies which board to display
- No sensitive data is transmitted

### Data Privacy
- User feedback is stored on Canny servers
- No personal data is automatically collected
- Users can submit anonymously

## Alternative Solutions

If Canny continues to have issues, consider:

### 1. Internal Feedback System
- Build custom feedback form
- Store feedback in your database
- Email notifications for new feedback

### 2. Other External Services
- **UserVoice**: Alternative feedback platform
- **Intercom**: Customer feedback and support
- **Zendesk**: Help desk with feedback features

### 3. Simple Contact Form
- Basic email form
- Direct email to support
- GitHub issues integration

## Support

For persistent issues:
1. Check Canny status page: [status.canny.io](https://status.canny.io)
2. Contact Canny support: [support.canny.io](https://support.canny.io)
3. Review Canny documentation: [docs.canny.io](https://docs.canny.io) 