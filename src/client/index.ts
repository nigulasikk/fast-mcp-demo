import http from 'http';

export class McpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async callTool(toolName: string, params: any): Promise<any> {
    console.log(`[McpClient] Calling tool: ${toolName} with params:`, params);
    
    return new Promise((resolve, reject) => {
      const requestData = JSON.stringify({
        tool: toolName,
        params: params
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      };

      const req = http.request(`${this.baseUrl}/tools/call`, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error}`));
            }
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(requestData);
      req.end();
    });
  }

  async getWeather(location: string): Promise<any> {
    return this.callTool('getWeather', { location });
  }
}

async function main() {
  const client = new McpClient('http://localhost:3000');
  
  try {
    console.log('Getting weather for New York...');
    const nyWeather = await client.getWeather('New York');
    console.log('New York Weather:', nyWeather);
    
    console.log('\nGetting weather for London...');
    const londonWeather = await client.getWeather('London');
    console.log('London Weather:', londonWeather);
    
    console.log('\nGetting weather for Tokyo...');
    const tokyoWeather = await client.getWeather('Tokyo');
    console.log('Tokyo Weather:', tokyoWeather);
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}
