/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Vercel Toolbar in production
  devIndicators: {
    buildActivity: false,
  },
  // Disable Vercel Toolbar
  env: {
    ...process.env,
    NEXT_DISABLE_VERCEL_TOOLBAR: '1',
    VERCEL_TOOLBAR_DISABLED: '1',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/dms/image/**',
      },
      {
        protocol: 'https',
        hostname: 'static.licdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  env: {
    // Only use fallbacks in development
    ...(process.env.NODE_ENV === 'development' ? {
      DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || "sqlite",
      AUTH_SECRET: process.env.AUTH_SECRET || "Z5jXQ5zznTNgKpNf0SOqDxPkTFQtapMF0B3T6J9owzg=",
      JWT_SECRET: process.env.JWT_SECRET || process.env.AUTH_SECRET || "Z5jXQ5zznTNgKpNf0SOqDxPkTFQtapMF0B3T6J9owzg=",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
      // Kinde Auth (Server-side) - only fallbacks in development
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET || "placeholder",
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL || "https://placeholder.kinde.com",
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID || "placeholder",
      KINDE_SITE_URL: process.env.KINDE_SITE_URL || "http://localhost:3000",
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL || "http://localhost:3000",
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL || "http://localhost:3000/dashboard",
      // Kinde Auth (Client-side - NEXT_PUBLIC_) - only fallbacks in development
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID || process.env.KINDE_CLIENT_ID || "placeholder",
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN || "placeholder.kinde.com",
      NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI || "http://localhost:3000",
      NEXT_PUBLIC_KINDE_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI || "http://localhost:3000/dashboard",
      // Stripe - only fallbacks in development
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "placeholder",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "placeholder",
      // AI Services - only fallbacks in development
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "placeholder",
      OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY || "placeholder",
      // Encryption - only fallbacks in development
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "placeholder-encryption-key-32-chars-long!!",
    } : {
      // In production, only pass through the actual environment variables
      // This ensures Kinde gets the real values from Vercel
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || "postgresql",
      AUTH_SECRET: process.env.AUTH_SECRET,
      JWT_SECRET: process.env.JWT_SECRET || process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
      KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID,
      KINDE_SITE_URL: process.env.KINDE_SITE_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      NEXT_PUBLIC_KINDE_CLIENT_ID: process.env.NEXT_PUBLIC_KINDE_CLIENT_ID,
      NEXT_PUBLIC_KINDE_DOMAIN: process.env.NEXT_PUBLIC_KINDE_DOMAIN,
      NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_LOGOUT_REDIRECT_URI,
      NEXT_PUBLIC_KINDE_REDIRECT_URI: process.env.NEXT_PUBLIC_KINDE_REDIRECT_URI,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY,
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    }),
  },
  webpack: (config, { isServer, dev }) => {
    // Server-side configuration
    if (isServer) {
      // Exclude client-only packages from server bundle
      config.externals = config.externals || [];
      config.externals.push({
        'pdfjs-dist': 'commonjs pdfjs-dist',
        'pdfjs-dist/build/pdf.worker.entry': 'commonjs pdfjs-dist/build/pdf.worker.entry',
      });
      
      // Server-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
      
      // Ignore pdf-parse test files that cause ENOENT errors
      config.externals.push({
        './test/data/05-versions-space.pdf': 'false',
        '../test/data/05-versions-space.pdf': 'false',
        'test/data/05-versions-space.pdf': 'false',
      });

      config.externals.push('@prisma/client');
    } else {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        canvas: false,
      };
      
      // Ensure pdfjs-dist is properly handled on client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.js',
      };
    }
    
    return config;
  },
};

export default nextConfig;
