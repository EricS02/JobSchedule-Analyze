# Production Deployment Guide

## Database Migration

### For Vercel:
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Functions" tab
4. Create a new function or use the CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Run database migration
vercel env pull .env.production
npx prisma migrate deploy
```

### For other platforms:
```bash
# Set your production DATABASE_URL
export DATABASE_URL="your_production_postgresql_url"

# Run the migration
npx prisma migrate deploy
```

## Extension Authentication Flow

### How it works:
1. User logs into the web app at `https://jobschedule.io`
2. User goes to `/dashboard/extension`
3. User clicks "Generate Token"
4. Token is automatically sent to the extension via localStorage
5. Extension picks up the token and stores it
6. Extension can now make authenticated API calls

### Testing the flow:
1. Install the extension in Chrome
2. Go to `https://jobschedule.io/dashboard/extension`
3. Click "Generate Token"
4. The extension should automatically receive the token
5. Test by applying to a job on LinkedIn - it should be tracked automatically

## Environment Variables Required

Make sure these are set in your production environment:

```bash
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
AUTH_SECRET=your_auth_secret_key
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=your_kinde_issuer_url
```

## Troubleshooting

### If extension doesn't receive token:
1. Check browser console for errors
2. Make sure extension is installed and enabled
3. Refresh the extension page
4. Check if localStorage is accessible

### If database migration fails:
1. Check DATABASE_URL is correct
2. Ensure database is accessible
3. Check if you have write permissions

### If API calls fail:
1. Check JWT_SECRET is set correctly
2. Verify environment variables are loaded
3. Check server logs for specific errors 