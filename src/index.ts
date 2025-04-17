import { McpServer } from './server/server';
import { McpClient } from './client';
import { McpHost } from './host';

export {
  McpServer,
  McpClient,
  McpHost
};

async function main() {
  console.log('Starting MCP Demo...');
  
  const PORT = 3000;
  const server = new McpServer(PORT);
  server.start();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const host = new McpHost(`http://localhost:${PORT}`);
  await host.runWeatherReport([
    'New York',
    'London',
    'Tokyo',
    'Sydney',
    'Paris'
  ]);
  
  console.log('\nMCP Demo completed successfully!');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error running MCP Demo:', error);
  });
}
