import { McpClient } from '../client/index';

export class McpHost {
  private client: McpClient;
  
  constructor(serverUrl: string) {
    this.client = new McpClient(serverUrl);
  }
  
  async displayWeather(location: string): Promise<string> {
    try {
      const weatherData = await this.client.getWeather(location);
      
      return `
Weather for ${weatherData.location}:
-----------------------------
Temperature: ${weatherData.temperature}°C
Condition: ${weatherData.condition}
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.windSpeed} km/h
      `;
    } catch (error) {
      return `Error getting weather for ${location}: ${error}`;
    }
  }
  
  async runWeatherReport(locations: string[]): Promise<void> {
    console.log('=== Weather Report ===');
    
    for (const location of locations) {
      console.log(await this.displayWeather(location));
    }
    
    console.log('=== End of Report ===');
  }
}

async function main() {
  const host = new McpHost('http://localhost:3000');
  
  await host.runWeatherReport([
    'New York',
    'London',
    'Tokyo',
    'Sydney',
    'Paris'
  ]);
}

if (require.main === module) {
  main();
}
