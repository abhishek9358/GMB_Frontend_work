import net from 'net';

/**
 * Check if a port is available (not in use)
 * @param {number} port - The port number to check
 * @param {string} host - The host to check (default: 'localhost')
 * @returns {Promise<boolean>} - True if port is available, false if in use
 */
export function isPortAvailable(port, host = 'localhost') {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, host, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Find what process is using a specific port
 * @param {number} port - The port number to check
 * @returns {Promise<string|null>} - Process information or null if not found
 */
export async function getPortUsage(port) {
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      // Use netstat to find what's using the port
      const netstat = spawn('netstat', ['-ano'], { shell: true });
      let output = '';
      
      netstat.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      netstat.on('close', () => {
        const lines = output.split('\n');
        const portLine = lines.find(line => 
          line.includes(`:${port} `) && 
          (line.includes('LISTENING') || line.includes('ESTABLISHED'))
        );
        
        if (portLine) {
          const parts = portLine.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          resolve(`Process ID: ${pid}`);
        } else {
          resolve(null);
        }
      });
      
      netstat.on('error', () => {
        resolve(null);
      });
    });
  } catch (error) {
    return null;
  }
}

/**
 * Check port availability and provide detailed error information
 * @param {number} port - The port number to check
 * @param {string} serviceName - Name of the service (for error messages)
 * @param {string} host - The host to check (default: 'localhost')
 * @returns {Promise<{available: boolean, error?: string, suggestions?: string[]}>}
 */
export async function checkPortWithDetails(port, serviceName = 'Service', host = 'localhost') {
  const available = await isPortAvailable(port, host);
  
  if (available) {
    return { available: true };
  }
  
  const usage = await getPortUsage(port);
  
  const error = `Port ${port} is already in use by another process.`;
  const suggestions = [
    `Stop the process currently using port ${port}`,
    `Use a different port for ${serviceName}`,
    `Check if another instance of ${serviceName} is already running`,
    usage ? `Current usage: ${usage}` : 'Run "netstat -ano | findstr :' + port + '" to identify the process'
  ];
  
  return {
    available: false,
    error,
    suggestions
  };
}

/**
 * Check multiple ports and return detailed status for each
 * @param {Array<{port: number, service: string}>} portConfigs - Array of port configurations
 * @param {string} host - The host to check (default: 'localhost')
 * @returns {Promise<Array<{port: number, service: string, available: boolean, error?: string, suggestions?: string[]}>>}
 */
export async function checkMultiplePorts(portConfigs, host = 'localhost') {
  const results = [];
  
  for (const config of portConfigs) {
    const result = await checkPortWithDetails(config.port, config.service, host);
    results.push({
      port: config.port,
      service: config.service,
      ...result
    });
  }
  
  return results;
}

/**
 * Find an available port starting from a given port number
 * @param {number} startPort - The starting port number
 * @param {number} maxAttempts - Maximum number of ports to try (default: 10)
 * @param {string} host - The host to check (default: 'localhost')
 * @returns {Promise<number|null>} - Available port number or null if none found
 */
export async function findAvailablePort(startPort, maxAttempts = 10, host = 'localhost') {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port, host);
    
    if (available) {
      return port;
    }
  }
  
  return null;
}