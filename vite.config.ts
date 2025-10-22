// vite.config.ts

import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// Environment variable validation
function validateEnvVars(env: Record<string, string>) {
  const errors: string[] = []
  
  // Validate HTTPS_PORT
  if (env.HTTPS_PORT && isNaN(parseInt(env.HTTPS_PORT))) {
    errors.push(`HTTPS_PORT must be a valid number, got: ${env.HTTPS_PORT}`)
  }
  
  // Validate SERVER_NAMES format if provided
  if (env.SERVER_NAMES) {
    const serverNames = env.SERVER_NAMES.split(',').map(name => name.trim())
    const invalidNames = serverNames.filter(name => !name || name.length === 0)
    if (invalidNames.length > 0) {
      errors.push(`SERVER_NAMES contains invalid entries: ${env.SERVER_NAMES}`)
    }
  }
  
  // Validate ACME configuration completeness
  if (env.ACME_DIRECTORY_URL && !env.SERVER_NAMES) {
    errors.push('ACME_DIRECTORY_URL is set but SERVER_NAMES is missing')
  }
  
  if (env.SERVER_NAMES && !env.ACME_DIRECTORY_URL) {
    errors.push('SERVER_NAMES is set but ACME_DIRECTORY_URL is missing')
  }
  
  return errors
}

// Anchor LCL configuration helper
function createAnchorLCLConfig(env: Record<string, string>, baseConfig: any, httpsPort: number) {
  try {
    const { createSNICallback } = require('anchor-pki/auto-cert/sni-callback')
    const { TermsOfServiceAcceptor } = require('anchor-pki/auto-cert/terms-of-service-acceptor')
    
    const serverNames = env.SERVER_NAMES.split(',').map(name => name.trim())
    
    const SNICallback = createSNICallback({
      name: 'sni-callback',
      directoryUrl: env.ACME_DIRECTORY_URL,
      allowIdentifiers: serverNames,
      tosAcceptors: TermsOfServiceAcceptor.createAny(),
      cacheDir: 'tmp/acme',
    })

    console.log(`✅ Using Anchor LCL for HTTPS certificates`)
    console.log(`   Server Names: ${serverNames.join(', ')}`)
    console.log(`   ACME Directory: ${env.ACME_DIRECTORY_URL}`)
    
    return {
      ...baseConfig,
      server: {
        port: httpsPort,
        host: '0.0.0.0', // Allow access from lcl.host subdomains
        https: {
          SNICallback,
        },
      },
    }
  } catch (error) {
    console.warn(`⚠️  Anchor LCL configuration failed:`, error.message)
    throw error
  }
}

// Fallback mkcert configuration
async function createMkcertConfig(baseConfig: any, httpsPort: number) {
  console.log(`✅ Using mkcert for HTTPS certificates`)
  
  // Dynamically import mkcert only when needed
  let mkcert: any = null
  try {
    mkcert = (await import('vite-plugin-mkcert')).default
  } catch (error) {
    console.warn('⚠️  vite-plugin-mkcert not available, falling back to HTTP')
    return {
      ...baseConfig,
      server: {
        port: httpsPort,
        host: '0.0.0.0',
        https: false,
      },
    }
  }
  
  return {
    ...baseConfig,
    plugins: [mkcert()],
    server: {
      port: httpsPort,
      host: '0.0.0.0', // Allow access from lcl.host subdomains and network
      https: true,
    },
  }
}

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Validate environment variables
  const validationErrors = validateEnvVars(env)
  if (validationErrors.length > 0) {
    console.error(`❌ Environment variable validation failed:`)
    validationErrors.forEach(error => console.error(`   - ${error}`))
    process.exit(1)
  }
  
  // Parse configuration
  const httpsPort = parseInt(env.HTTPS_PORT || '44391')
  const hasAnchorLCLConfig = env.ACME_DIRECTORY_URL && env.SERVER_NAMES
  
  console.log(`🔧 Vite HTTPS Configuration:`)
  console.log(`   Mode: ${mode}`)
  console.log(`   Port: ${httpsPort}`)
  console.log(`   Anchor LCL Available: ${hasAnchorLCLConfig ? 'Yes' : 'No'}`)
  
  // Base configuration with path resolution
  const baseConfig = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        // Externalize Stripe packages as suggested by Rollup error
        external: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        output: {
          globals: {
            '@stripe/stripe-js': 'Stripe',
            '@stripe/react-stripe-js': 'StripeReact'
          }
        }
      }
    },
    optimizeDeps: {
      // Pre-bundle Stripe packages to avoid resolution issues during development
      include: ['@stripe/stripe-js', '@stripe/react-stripe-js']
    }
  }
  
  // Try Anchor LCL first if configured
  if (hasAnchorLCLConfig) {
    try {
      return createAnchorLCLConfig(env, baseConfig, httpsPort)
    } catch (error) {
      console.warn(`⚠️  Falling back to mkcert due to Anchor LCL error`)
    }
  }
  
  // Fallback to mkcert
  return await createMkcertConfig(baseConfig, httpsPort)
})
