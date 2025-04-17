import { McpServer } from '../server/server';

const PORT = 3000;
const server = new McpServer(PORT);
server.start();

console.log('MCP Server is running...');
console.log('Press Ctrl+C to stop');

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.stop();
  process.exit(0);
});
