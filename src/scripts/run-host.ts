import { McpHost } from '../host';

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

main();
