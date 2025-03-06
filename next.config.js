/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Custom plugin to create client reference manifest files
class CreateManifestPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CreateManifestPlugin', (compilation) => {
      const outputPath = compilation.outputOptions.path;
      if (!outputPath) return;

      const serverDir = path.join(outputPath, 'server');
      const dashboardDir = path.join(serverDir, 'app', 'dashboard');
      
      // Create dashboard directory if it doesn't exist
      if (!fs.existsSync(dashboardDir)) {
        fs.mkdirSync(dashboardDir, { recursive: true });
      }
      
      // Create manifest file
      const manifestPath = path.join(dashboardDir, 'page_client-reference-manifest.js');
      fs.writeFileSync(manifestPath, 'self.__RSC_MANIFEST={};');
      
      // Also create in standalone directory if it exists
      const standaloneDir = path.join(outputPath, 'standalone', '.next', 'server', 'app', 'dashboard');
      if (fs.existsSync(path.join(outputPath, 'standalone'))) {
        if (!fs.existsSync(standaloneDir)) {
          fs.mkdirSync(standaloneDir, { recursive: true });
        }
        fs.writeFileSync(path.join(standaloneDir, 'page_client-reference-manifest.js'), 'self.__RSC_MANIFEST={};');
      }
    });
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix for the Vercel deployment error
  output: 'standalone',
  experimental: {
    // Improve tree-shaking
    optimizePackageImports: ['react-icons'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new CreateManifestPlugin());
    }
    return config;
  },
};

module.exports = nextConfig; 