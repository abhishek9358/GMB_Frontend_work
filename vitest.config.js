import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment configuration
    environment: 'node',
    
    // Test file patterns
    include: [
      'test/**/*.test.js',
      'test/**/*.spec.js'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'backend/node_modules/**'
    ],
    
    // Global test timeout (30 seconds)
    testTimeout: 30000,
    
    // Hook timeouts
    hookTimeout: 10000,
    
    // Test execution settings
    globals: true,
    
    // Reporter configuration
    reporter: ['verbose', 'json'],
    
    // Output configuration
    outputFile: {
      json: './test/test-results.json'
    },
    
    // Coverage configuration (if needed)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'test/**',
        'dist/**',
        '**/*.config.js',
        '**/*.config.ts'
      ]
    },
    
    // Retry configuration for flaky tests
    retry: 1,
    
    // Concurrent execution (disabled for startup tests to avoid port conflicts)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Setup files
    setupFiles: [],
    
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      TEST_TIMEOUT: '30000'
    }
  }
});