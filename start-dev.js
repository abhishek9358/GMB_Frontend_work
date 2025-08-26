#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';
import { checkMultiplePorts, findAvailablePort } from './utils/port-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Validates that required dependencies are installed
 */
async function validateDependencies() {
  console.log('📦 Validating dependencies...');
  
  const errors = [];
  
  // Check if node_modules exists in root
  if (!existsSync(join(__dirname, 'node_modules'))) {
    errors.push({
      error: 'Frontend dependencies not installed',
      details: 'node_modules directory not found in project root',
      suggestions: [
        'Run "npm install" in the project root directory',
        'Or run "pnpm install" if using pnpm',
        'Make sure you have Node.js and npm/pnpm installed'
      ]
    });
  }
  
  // Check if backend node_modules exists
  if (!existsSync(join(__dirname, 'backend', 'node_modules'))) {
    errors.push({
      error: 'Backend dependencies not installed',
      details: 'node_modules directory not found in backend directory',
      suggestions: [
        'Run "cd backend && npm install"',
        'Or run "npm run backend:install" if available',
        'Make sure the backend package.json exists'
      ]
    });
  }
  
  // Check if package.json files exist
  if (!existsSync(join(__dirname, 'package.json'))) {
    errors.push({
      error: 'Frontend package.json missing',
      details: 'package.json not found in project root',
      suggestions: [
        'Ensure you are in the correct project directory',
        'Restore package.json from version control if deleted'
      ]
    });
  }
  
  if (!existsSync(join(__dirname, 'backend', 'package.json'))) {
    errors.push({
      error: 'Backend package.json missing',
      details: 'package.json not found in backend directory',
      suggestions: [
        'Ensure the backend directory structure is correct',
        'Restore backend/package.json from version control if deleted'
      ]
    });
  }
  
  return errors;
}

/**
 * Validates required environment variables
 */
function validateEnvironmentVariables() {
  console.log('🔧 Validating environment variables...');
  
  const errors = [];
  const backendEnvPath = join(__dirname, 'backend', '.env');
  
  // Check if backend .env file exists
  if (!existsSync(backendEnvPath)) {
    errors.push({
      error: 'Backend environment file missing',
      details: 'backend/.env file not found',
      suggestions: [
        'Create a backend/.env file with required variables',
        'Copy from backend/.env.example if available',
        'Ensure the file contains: PORT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI'
      ]
    });
    return errors; // Can't continue validation without the file
  }
  
  let backendEnv;
  try {
    backendEnv = dotenv.parse(readFileSync(backendEnvPath));
  } catch (error) {
    errors.push({
      error: 'Failed to parse backend environment file',
      details: `Error reading backend/.env: ${error.message}`,
      suggestions: [
        'Check that backend/.env file is not corrupted',
        'Ensure proper key=value format in the file',
        'Remove any special characters that might cause parsing issues'
      ]
    });
    return errors;
  }
  
  // Required environment variables for backend
  const requiredVars = [
    { key: 'PORT', description: 'Backend server port' },
    { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth client ID' },
    { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth client secret' },
    { key: 'REDIRECT_URI', description: 'OAuth redirect URI' }
  ];
  
  for (const { key, description } of requiredVars) {
    if (!backendEnv[key] || backendEnv[key].trim() === '') {
      errors.push({
        error: `Missing required environment variable: ${key}`,
        details: `${description} is not set or is empty`,
        suggestions: [
          `Add ${key}=<value> to backend/.env file`,
          key === 'PORT' ? 'Use PORT=3001 for development' : 
          key.includes('GOOGLE') ? 'Get OAuth credentials from Google Cloud Console' :
          key === 'REDIRECT_URI' ? 'Use http://localhost:3001/auth/callback for development' :
          'Check documentation for the correct value'
        ]
      });
    }
  }
  
  // Validate PORT is a valid number
  if (backendEnv.PORT && isNaN(parseInt(backendEnv.PORT))) {
    errors.push({
      error: 'Invalid PORT value',
      details: `PORT value "${backendEnv.PORT}" is not a valid number`,
      suggestions: [
        'Set PORT to a valid number (e.g., PORT=3001)',
        'Ensure PORT is between 1024 and 65535',
        'Use PORT=3001 for development'
      ]
    });
  }
  
  return { errors, backendEnv };
}

/**
 * Reports validation errors with clear formatting
 */
function reportValidationErrors(dependencyErrors, environmentErrors) {
  const allErrors = [...dependencyErrors, ...environmentErrors];
  
  if (allErrors.length === 0) return false;
  
  console.log('\n❌ Startup validation failed:\n');
  
  allErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.error}`);
    console.log(`   Details: ${error.details}`);
    console.log('   Suggestions:');
    error.suggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });
    console.log('');
  });
  
  console.log('💡 Please resolve the above issues and try again.\n');
  return true;
}

// Perform validation before starting servers
console.log('🚀 Starting GMB Management Development Environment...\n');

const dependencyErrors = await validateDependencies();
const envValidation = validateEnvironmentVariables();
const environmentErrors = envValidation.errors || [];

// Report any validation errors and exit
if (reportValidationErrors(dependencyErrors, environmentErrors)) {
  process.exit(1);
}

console.log('✅ All validations passed!\n');

// Load backend environment variables to get the correct port
const backendEnv = envValidation.backendEnv;
const BACKEND_PORT = parseInt(backendEnv.PORT) || 3001;
const FRONTEND_PORT = 8080;

console.log('🚀 Starting GMB Management Development Environment...\n');

// Check port availability before starting servers
console.log('🔍 Checking port availability...');
const portResults = await checkMultiplePorts([
  { port: BACKEND_PORT, service: 'Backend Server' },
  { port: FRONTEND_PORT, service: 'Frontend Server' }
]);

// Check if any ports are unavailable
const unavailablePorts = portResults.filter(result => !result.available);

if (unavailablePorts.length > 0) {
  console.log('\n❌ Port conflicts detected:\n');
  
  for (const result of unavailablePorts) {
    console.log(`🚫 ${result.service} (Port ${result.port}): ${result.error}`);
    console.log('   Suggestions:');
    result.suggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });
    console.log('');
  }
  
  // Offer alternative ports
  console.log('🔧 Looking for alternative ports...');
  for (const result of unavailablePorts) {
    const alternativePort = await findAvailablePort(result.port + 1, 10);
    if (alternativePort) {
      console.log(`✅ Alternative port for ${result.service}: ${alternativePort}`);
    } else {
      console.log(`❌ No alternative ports found for ${result.service} in range ${result.port + 1}-${result.port + 10}`);
    }
  }
  
  console.log('\n💡 Please resolve the port conflicts and try again.');
  process.exit(1);
}

console.log('✅ All ports are available!\n');

/**
 * Starts a server process with enhanced error handling
 */
function startServerProcess(name, command, args, cwd, port) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Starting ${name} (Port ${port})...`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let hasStarted = false;
    let errorOutput = '';
    
    // Capture stderr for error reporting
    process.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;
      
      // Forward to console
      console.error(output);
      
      // Check for common startup errors
      if (output.includes('EADDRINUSE') || output.includes('address already in use')) {
        if (!hasStarted) {
          reject({
            error: `${name} failed to start - port ${port} is already in use`,
            details: `Another process is using port ${port}`,
            suggestions: [
              `Stop the process using port ${port}`,
              `Use "lsof -ti:${port} | xargs kill" to kill the process (macOS/Linux)`,
              `Use "netstat -ano | findstr :${port}" to find the process (Windows)`,
              'Change the port in the configuration file'
            ],
            code: 'PORT_IN_USE'
          });
        }
      } else if (output.includes('MODULE_NOT_FOUND') || output.includes('Cannot find module')) {
        if (!hasStarted) {
          reject({
            error: `${name} failed to start - missing dependencies`,
            details: 'Required npm packages are not installed or corrupted',
            suggestions: [
              `Run "npm install" in ${cwd}`,
              'Delete node_modules and package-lock.json, then run npm install',
              'Check that all dependencies in package.json are correct'
            ],
            code: 'MISSING_DEPENDENCIES'
          });
        }
      }
    });
    
    // Capture stdout
    process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Look for successful startup indicators
      if ((output.includes('Server running') || output.includes('Local:') || output.includes('ready')) && !hasStarted) {
        hasStarted = true;
        resolve(process);
      }
    });
    
    // Handle process errors
    process.on('error', (error) => {
      if (!hasStarted) {
        reject({
          error: `Failed to start ${name}`,
          details: error.message,
          suggestions: [
            'Check that Node.js is installed and accessible',
            'Verify the npm script exists in package.json',
            'Ensure you have proper permissions to run the command'
          ],
          code: 'PROCESS_ERROR'
        });
      }
    });
    
    // Handle unexpected exit
    process.on('exit', (code, signal) => {
      if (!hasStarted && code !== 0) {
        reject({
          error: `${name} exited unexpectedly`,
          details: `Process exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`,
          suggestions: [
            'Check the error output above for specific issues',
            'Verify all dependencies are installed',
            'Check that configuration files are correct',
            errorOutput ? 'Review the error details in the output' : 'Enable verbose logging for more details'
          ],
          code: 'UNEXPECTED_EXIT'
        });
      }
    });
    
    // Timeout after 30 seconds if server doesn't start
    setTimeout(() => {
      if (!hasStarted) {
        process.kill();
        reject({
          error: `${name} startup timeout`,
          details: `Server did not start within 30 seconds`,
          suggestions: [
            'Check for errors in the server output above',
            'Verify the server configuration is correct',
            'Try starting the server manually to debug issues',
            'Check system resources (CPU, memory, disk space)'
          ],
          code: 'STARTUP_TIMEOUT'
        });
      }
    }, 30000);
  });
}

/**
 * Reports server startup errors with clear formatting
 */
function reportServerError(error, serverName) {
  console.log(`\n❌ ${serverName} startup failed:\n`);
  console.log(`Error: ${error.error}`);
  console.log(`Details: ${error.details}`);
  console.log('Suggestions:');
  error.suggestions.forEach(suggestion => {
    console.log(`• ${suggestion}`);
  });
  console.log('');
}

// Start servers with enhanced error handling
try {
  // Initialize process variables
  let backend, frontend;
  
  // Start backend server
  backend = await startServerProcess(
    'Backend Server',
    'npm',
    ['run', 'dev'],
    join(__dirname, 'backend'),
    BACKEND_PORT
  );
  
  console.log('✅ Backend server started successfully!\n');
  
  // Start frontend server
  frontend = await startServerProcess(
    'Frontend Server', 
    'npm',
    ['run', 'dev'],
    __dirname,
    FRONTEND_PORT
  );
  
  console.log('✅ Frontend server started successfully!\n');
  
  console.log('🌐 Development environment ready:');
  console.log(`   Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`   Backend: http://localhost:${BACKEND_PORT}`);
  console.log(`   Auth: http://localhost:${BACKEND_PORT}/auth/google`);
  console.log('\nPress Ctrl+C to stop both servers\n');

  // Process coordination and monitoring
  let isShuttingDown = false;
  let restartAttempts = 0;
  const MAX_RESTART_ATTEMPTS = 3;
  const RESTART_DELAY = 2000; // 2 seconds
  
  /**
   * Gracefully shuts down both servers
   */
  async function gracefulShutdown(reason = 'Manual termination') {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`\n🛑 Shutting down servers (${reason})...`);
    
    // Send SIGTERM to both processes
    try {
      if (backend && !backend.killed) {
        console.log('   Stopping backend server...');
        backend.kill('SIGTERM');
      }
      if (frontend && !frontend.killed) {
        console.log('   Stopping frontend server...');
        frontend.kill('SIGTERM');
      }
    } catch (error) {
      console.log(`   Warning: Error during graceful shutdown: ${error.message}`);
    }
    
    // Wait for graceful shutdown, then force kill if necessary
    setTimeout(() => {
      try {
        if (backend && !backend.killed) {
          console.log('   Force killing backend server...');
          backend.kill('SIGKILL');
        }
        if (frontend && !frontend.killed) {
          console.log('   Force killing frontend server...');
          frontend.kill('SIGKILL');
        }
      } catch (error) {
        console.log(`   Warning: Error during force kill: ${error.message}`);
      }
      
      console.log('✅ All servers stopped');
      process.exit(0);
    }, 5000);
  }
  
  /**
   * Attempts to restart a crashed server
   */
  async function attemptRestart(serverName, serverType) {
    if (isShuttingDown || restartAttempts >= MAX_RESTART_ATTEMPTS) {
      return false;
    }
    
    restartAttempts++;
    console.log(`\n🔄 Attempting to restart ${serverName} (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
    
    // Wait before restart
    await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));
    
    try {
      let newProcess;
      if (serverType === 'backend') {
        newProcess = await startServerProcess(
          'Backend Server',
          'npm',
          ['run', 'dev'],
          join(__dirname, 'backend'),
          BACKEND_PORT
        );
        backend = newProcess;
        setupBackendMonitoring();
      } else {
        newProcess = await startServerProcess(
          'Frontend Server',
          'npm',
          ['run', 'dev'],
          __dirname,
          FRONTEND_PORT
        );
        frontend = newProcess;
        setupFrontendMonitoring();
      }
      
      console.log(`✅ ${serverName} restarted successfully!`);
      restartAttempts = 0; // Reset counter on successful restart
      return true;
    } catch (error) {
      console.log(`❌ Failed to restart ${serverName}: ${error.error || error.message}`);
      
      if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
        console.log(`\n💥 Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached for ${serverName}`);
        console.log('🛑 Shutting down development environment...');
        await gracefulShutdown('Max restart attempts reached');
      }
      
      return false;
    }
  }
  
  /**
   * Sets up monitoring for the backend process
   */
  function setupBackendMonitoring() {
    backend.on('exit', async (code, signal) => {
      console.log(`\n⚠️  Backend server exited (code: ${code}, signal: ${signal})`);
      
      if (isShuttingDown) return;
      
      if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
        console.log('❌ Backend server crashed unexpectedly');
        reportServerError({
          error: 'Backend server crashed',
          details: `Server process exited with code ${code}`,
          suggestions: [
            'Check the backend logs above for error details',
            'The system will attempt to restart automatically',
            'If restart fails, verify backend configuration and dependencies'
          ]
        }, 'Backend');
        
        // Attempt to restart
        const restarted = await attemptRestart('Backend Server', 'backend');
        if (!restarted) {
          await gracefulShutdown('Backend server failed to restart');
        }
      } else {
        // Normal shutdown
        await gracefulShutdown('Backend server stopped');
      }
    });
  }
  
  /**
   * Sets up monitoring for the frontend process
   */
  function setupFrontendMonitoring() {
    frontend.on('exit', async (code, signal) => {
      console.log(`\n⚠️  Frontend server exited (code: ${code}, signal: ${signal})`);
      
      if (isShuttingDown) return;
      
      if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
        console.log('❌ Frontend server crashed unexpectedly');
        reportServerError({
          error: 'Frontend server crashed',
          details: `Server process exited with code ${code}`,
          suggestions: [
            'Check the frontend logs above for error details',
            'The system will attempt to restart automatically',
            'If restart fails, verify frontend configuration and dependencies'
          ]
        }, 'Frontend');
        
        // Attempt to restart
        const restarted = await attemptRestart('Frontend Server', 'frontend');
        if (!restarted) {
          await gracefulShutdown('Frontend server failed to restart');
        }
      } else {
        // Normal shutdown
        await gracefulShutdown('Frontend server stopped');
      }
    });
  }
  
  // Set up process monitoring
  setupBackendMonitoring();
  setupFrontendMonitoring();
  
  // Handle process termination signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT received'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM received'));
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP received'));
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.log('\n💥 Uncaught exception:', error.message);
    console.log('Stack trace:', error.stack);
    gracefulShutdown('Uncaught exception');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.log('\n💥 Unhandled rejection at:', promise, 'reason:', reason);
    gracefulShutdown('Unhandled rejection');
  });
  
  // Periodic health check for process monitoring
  const healthCheckInterval = setInterval(() => {
    if (isShuttingDown) {
      clearInterval(healthCheckInterval);
      return;
    }
    
    // Check if processes are still running
    if (backend && backend.killed) {
      console.log('\n⚠️  Backend process detected as killed, monitoring for restart...');
    }
    if (frontend && frontend.killed) {
      console.log('\n⚠️  Frontend process detected as killed, monitoring for restart...');
    }
  }, 30000); // Check every 30 seconds

} catch (error) {
  // Handle server startup failures
  if (error.code === 'PORT_IN_USE' || error.code === 'MISSING_DEPENDENCIES' || 
      error.code === 'PROCESS_ERROR' || error.code === 'UNEXPECTED_EXIT' || 
      error.code === 'STARTUP_TIMEOUT') {
    reportServerError(error, error.error.includes('Backend') ? 'Backend' : 'Frontend');
  } else {
    console.log('\n❌ Unexpected error during server startup:');
    console.log(`Error: ${error.message || error.error || error}`);
    console.log('\nSuggestions:');
    console.log('• Check the error details above');
    console.log('• Try restarting the development environment');
    console.log('• Verify all dependencies are installed');
    console.log('• Check system resources and permissions\n');
  }
  
  process.exit(1);
}
