import http from 'http';
import { getWeatherTool } from '../tools/getWeather';
import { URL } from 'url';

export class McpServer {
  private server: http.Server;
  private tools: Map<string, any>;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.tools = new Map();
    this.server = http.createServer(this.handleRequest.bind(this));
    
    this.registerTool(getWeatherTool);
  }

  registerTool(tool: any) {
    this.tools.set(tool.name, tool);
    console.log(`[McpServer] Registered tool: ${tool.name}`);
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://localhost:${this.port}`);
    const path = parsedUrl.pathname;

    if (path === '/tools/call' && req.method === 'POST') {
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { tool: toolName, params } = JSON.parse(body);
          const tool = this.tools.get(toolName);
          
          if (!tool) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Tool '${toolName}' not found` }));
            return;
          }
          
          try {
            const result = await tool.execute(params);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            console.error(`[McpServer] Error executing tool '${toolName}':`, error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Error executing tool '${toolName}': ${error}` }));
          }
        } catch (error) {
          console.error('[McpServer] Error parsing request:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`[McpServer] Server started and listening on http://localhost:${this.port}`);
      console.log(`[McpServer] Registered tools: ${Array.from(this.tools.keys()).join(', ')}`);
    });
    return this.server;
  }

  stop() {
    this.server.close();
    console.log('[McpServer] Server stopped');
  }
}
