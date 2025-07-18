/** @type {import('next').NextConfig} */
const nextConfig = {
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
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    AUTH_SECRET: process.env.AUTH_SECRET || "Z5jXQ5zznTNgKpNf0SOqDxPkTFQtapMF0B3T6J9owzg=",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
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
