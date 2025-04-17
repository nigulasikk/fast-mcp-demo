# Fast MCP Demo

A demonstration of the Model Context Protocol (MCP) using a getWeather scenario. This demo shows how to implement MCP server, client, and host components.

## Components

- **MCP Server**: Handles tool registration and execution
- **MCP Client**: Communicates with the server to call tools
- **MCP Host**: Uses the client to interact with the server and display results
- **getWeather Tool**: A tool for retrieving weather information for a location

## Project Structure

```
src/
├── client/       # MCP client implementation
├── host/         # MCP host implementation
├── server/       # MCP server implementation
├── tools/        # Tool implementations
│   └── getWeather.ts
└── index.ts      # Main entry point
```

## Running the Demo

1. Build the project:
   ```
   npm run build
   ```

2. Start the server:
   ```
   npm run start:server
   ```

3. In a separate terminal, run the client:
   ```
   npm run start:client
   ```

4. In another terminal, run the host:
   ```
   npm run start:host
   ```

Alternatively, you can run the complete demo with:
```
npm run dev
```

## Understanding MCP Concepts

- **MCP Server**: Manages tools, resources, and prompts. It provides an API for clients to call tools.
- **MCP Client**: Communicates with the server to call tools and retrieve results.
- **MCP Host**: Uses the client to interact with the server and provides a user interface.
- **Tools**: Functions that can be called by the client through the server.

## getWeather Tool

The getWeather tool demonstrates how to implement a tool in the MCP framework:

1. Define parameters using a schema (Zod in this case)
2. Implement the tool's functionality
3. Register the tool with the server

When called, the getWeather tool returns weather information for a specified location.
