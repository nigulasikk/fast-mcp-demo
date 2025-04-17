import { z } from "zod";

export const GetWeatherParams = z.object({
  location: z.string().describe("The location to get weather for"),
});

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export const getWeatherData = async (location: string): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockWeatherData: Record<string, WeatherData> = {
    "New York": {
      location: "New York",
      temperature: 22,
      condition: "Sunny",
      humidity: 60,
      windSpeed: 5
    },
    "London": {
      location: "London",
      temperature: 18,
      condition: "Cloudy",
      humidity: 75,
      windSpeed: 8
    },
    "Tokyo": {
      location: "Tokyo",
      temperature: 26,
      condition: "Rainy",
      humidity: 80,
      windSpeed: 7
    },
    "Sydney": {
      location: "Sydney",
      temperature: 30,
      condition: "Clear",
      humidity: 55,
      windSpeed: 10
    }
  };
  
  return mockWeatherData[location] || {
    location,
    temperature: Math.floor(Math.random() * 30) + 5, // Random temp between 5-35
    condition: ["Sunny", "Cloudy", "Rainy", "Clear"][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 50) + 40, // Random humidity between 40-90
    windSpeed: Math.floor(Math.random() * 15) + 1 // Random wind speed between 1-15
  };
};

export const getWeatherTool = {
  name: "getWeather",
  description: "Get weather information for a specific location",
  parameters: GetWeatherParams,
  execute: async (args: z.infer<typeof GetWeatherParams>) => {
    console.log(`[getWeather] Getting weather for ${args.location}`);
    const weatherData = await getWeatherData(args.location);
    return weatherData;
  }
};
