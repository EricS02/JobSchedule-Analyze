# Vercel Database Migration Guide

## Method 1: Vercel CLI (Recommended)

### Step 1: Login to Vercel
```bash
npx vercel login
```

### Step 2: Link your project (if not already linked)
```bash
npx vercel link
```

### Step 3: Pull environment variables
```bash
npx vercel env pull .env.production
```

### Step 4: Run the migration
```bash
# Set the production DATABASE_URL
$env:DATABASE_URL = "your_production_database_url"

# Run the migration
npx prisma migrate deploy
```

## Method 2: Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"

### Step 2: Verify DATABASE_URL
Make sure your `DATABASE_URL` is set correctly in the environment variables.

### Step 3: Use Vercel Functions
1. Go to "Functions" tab
2. Create a new function or use existing one
3. Add this code to run migration:

```javascript
// api/migrate.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Run migrations
    const { execSync } = require('child_process')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    res.status(200).json({ message: 'Migration completed successfully' })
  } catch (error) {
    console.error('Migration failed:', error)
    res.status(500).json({ error: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
```

## Method 3: Direct Database Connection

### Step 1: Get your database connection string
From Vercel dashboard → Settings → Environment Variables → DATABASE_URL

### Step 2: Run migration locally with production DB
```bash
# Set the production database URL
$env:DATABASE_URL = "postgresql://username:password@host:port/database"

# Run migration
npx prisma migrate deploy
```

## Method 4: Vercel Postgres (if using Vercel's database)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Run migration
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Troubleshooting

### If migration fails:
1. **Check DATABASE_URL**: Ensure it's correct and accessible
2. **Check permissions**: Make sure your database user has write permissions
3. **Check network**: Ensure your IP can access the database
4. **Check schema**: Make sure your Prisma schema is valid

### Common errors:
- `P1012: Environment variable not found`: Set DATABASE_URL
- `P1013: Invalid database URL`: Check your connection string
- `P1014: Database does not exist`: Create the database first
- `P1015: Access denied`: Check database permissions

## Verification

After running the migration, verify it worked:

```bash
# Check migration status
npx prisma migrate status

# Check database connection
npx prisma db pull
```

## Production Checklist

✅ **Environment Variables Set**: DATABASE_URL, JWT_SECRET, etc.  
✅ **Database Migration Run**: `npx prisma migrate deploy`  
✅ **Extension Authentication**: Working via web app  
✅ **API Endpoints**: Tested and working  
✅ **Extension Flow**: Automatic token transfer implemented  

## Next Steps

1. **Deploy your app** to Vercel
2. **Run the migration** using one of the methods above
3. **Test the extension** on your production site
4. **Monitor logs** for any issues 