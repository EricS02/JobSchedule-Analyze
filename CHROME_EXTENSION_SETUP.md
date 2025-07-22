# Chrome Extension Setup Guide

## Overview
The sidebar now includes a Chrome extension icon that will link to the Chrome Web Store when the extension is published.

## Current Status
- ✅ **Icon Added**: Chrome extension icon is visible in the sidebar
- ✅ **Placeholder State**: Currently shows as disabled with "Coming soon" tooltip
- ✅ **Environment Ready**: Ready to accept Chrome Web Store extension ID

## Setup Instructions

### 1. Get Chrome Extension ID
When you publish your Chrome extension to the Chrome Web Store, you'll receive an extension ID. This is typically a long string of letters and numbers.

### 2. Set Environment Variable
Add the following environment variable to your `.env.local` file:

```env
# Chrome Extension Configuration
NEXT_PUBLIC_CHROME_EXTENSION_ID=your_chrome_extension_id_here
```

### 3. Deploy to Production
For production deployment on Vercel, add the environment variable in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `NEXT_PUBLIC_CHROME_EXTENSION_ID` with your extension ID
4. Redeploy the application

## How It Works

### Current Behavior (No Extension ID)
- Icon appears in sidebar with Chrome icon
- Shows as disabled/grayed out
- Tooltip displays "Chrome Extension" and "Coming soon"
- Clicking does nothing (placeholder state)

### After Extension ID is Set
- Icon becomes clickable
- Links directly to Chrome Web Store extension page
- Opens in new tab with proper security attributes
- Tooltip shows "Chrome Extension"

## URL Format
The extension URL follows this format:
```
https://chrome.google.com/webstore/detail/{extension_id}
```

## Example
If your extension ID is `abcdefghijklmnopqrstuvwxyz123456`, the URL would be:
```
https://chrome.google.com/webstore/detail/abcdefghijklmnopqrstuvwxyz123456
```

## Technical Implementation

### Environment Variable
- **Name**: `NEXT_PUBLIC_CHROME_EXTENSION_ID`
- **Type**: String
- **Required**: No (falls back to placeholder if not set)
- **Scope**: Client-side (NEXT_PUBLIC_ prefix)

### Component Updates
- **NavLink Component**: Enhanced to handle external links and placeholder states
- **Constants**: Added Chrome icon import and extension URL function
- **Sidebar**: Automatically includes the extension link

### Security Features
- External links open in new tabs
- Proper `rel="noopener noreferrer"` attributes
- Environment variable validation

## Troubleshooting

### Icon Not Visible
- Check that the Chrome icon is properly imported
- Verify the sidebar links array includes the extension link

### Link Not Working
- Ensure environment variable is set correctly
- Check that the extension ID is valid
- Verify the URL format is correct

### Environment Variable Not Loading
- Restart the development server after adding the variable
- Check that the variable name starts with `NEXT_PUBLIC_`
- Verify the variable is set in production environment

## Future Enhancements
- Add extension installation detection
- Show different states for installed vs not installed
- Add extension version checking
- Include extension update notifications 