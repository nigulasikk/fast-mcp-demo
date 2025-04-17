import { McpClient } from '../client';

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

main();
