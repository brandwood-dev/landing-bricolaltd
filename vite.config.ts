import { defineConfig, loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Simple configuration for both development and production
  const config = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      // Pre-bundle Stripe packages to avoid resolution issues during development
      include: ['@stripe/stripe-js', '@stripe/react-stripe-js']
    }
  }

  // Only add HTTPS configuration for development mode
  if (mode === 'development') {
    const httpsPort = parseInt(env.HTTPS_PORT || '44391')
    
    // Try to use mkcert for development HTTPS, fallback to HTTP if not available
    try {
      const mkcert = require('vite-plugin-mkcert')
      config.plugins = [mkcert()]
      config.server = {
        port: httpsPort,
        host: '0.0.0.0',
        https: true,
      }
      console.log(`🔧 Development server with HTTPS on port ${httpsPort}`)
    } catch (error) {
      config.server = {
        port: httpsPort,
        host: '0.0.0.0',
        https: false,
      }
      console.log(`🔧 Development server with HTTP on port ${httpsPort} (mkcert not available)`)
    }
  }

  return config
})
