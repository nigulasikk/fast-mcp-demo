import { McpServer } from './server';

const PORT = 3000;
const server = new McpServer(PORT);
server.start();

console.log(`MCP Server started on http://localhost:${PORT}`);

export { server };
