import { McpClient } from '../client';
import { createSDK } from 'dashscope-node';
import * as dotenv from 'dotenv';

dotenv.config();

export interface ChatMessage {
  message: string;
  sender: string;
  timestamp: string;
}

export class ChatPage {
  private client: McpClient;
  private messages: ChatMessage[] = [];
  private container: HTMLElement;
  private messageList!: HTMLElement;
  private inputField!: HTMLInputElement;
  private username: string = "User";
  private DashScopeAPI: any;
  private conversationHistory: Array<{role: string, content: string}> = [];

  constructor(serverUrl: string, containerId: string) {
    this.client = new McpClient(serverUrl);
    
    this.DashScopeAPI = createSDK({
      accessToken: process.env.TONGYI_API_KEY,
    });
    
    this.container = document.getElementById(containerId) as HTMLElement;
    if (!this.container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }
    
    this.initializeUI();
  }

  private initializeUI() {
    this.container.className = 'chat-container';
    this.container.innerHTML = `
      <div class="chat-header">
        <h2>MCP Chat Demo</h2>
      </div>
      <div class="message-list" id="message-list"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Type your message..." />
        <button class="send-button">Send</button>
      </div>
    `;

    this.messageList = document.getElementById('message-list') as HTMLElement;
    this.inputField = this.container.querySelector('.chat-input') as HTMLInputElement;
    const sendButton = this.container.querySelector('.send-button') as HTMLButtonElement;

    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    this.addStyles();
  }

  private addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: #1a1a1a;
        color: #f0f0f0;
        border-radius: 8px;
        overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .chat-header {
        background-color: #2d2d2d;
        padding: 15px;
        text-align: center;
        border-bottom: 1px solid #3a3a3a;
      }

      .chat-header h2 {
        margin: 0;
        color: #ffffff;
      }

      .message-list {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .message {
        max-width: 70%;
        padding: 10px 15px;
        border-radius: 18px;
        word-break: break-word;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .message.user {
        align-self: flex-end;
        background-color: #4a5568;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.system {
        align-self: flex-start;
        background-color: #2d3748;
        color: #e2e8f0;
        border-bottom-left-radius: 4px;
      }

      .message-info {
        font-size: 0.7rem;
        margin-top: 5px;
        opacity: 0.7;
      }

      .chat-input-container {
        display: flex;
        padding: 15px;
        background-color: #2d2d2d;
        border-top: 1px solid #3a3a3a;
      }

      .chat-input {
        flex: 1;
        padding: 12px 15px;
        border: none;
        border-radius: 20px;
        background-color: #3a3a3a;
        color: #ffffff;
        outline: none;
        transition: background-color 0.3s;
      }

      .chat-input:focus {
        background-color: #454545;
      }

      .send-button {
        margin-left: 10px;
        padding: 0 20px;
        background-color: #4a5568;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .send-button:hover {
        background-color: #5a6577;
      }

      .send-button:active {
        background-color: #3a4555;
      }

      /* Scrollbar styling */
      .message-list::-webkit-scrollbar {
        width: 6px;
      }

      .message-list::-webkit-scrollbar-track {
        background: #2d2d2d;
      }

      .message-list::-webkit-scrollbar-thumb {
        background-color: #4a4a4a;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(styleElement);
  }

  private async sendMessage() {
    const messageText = this.inputField.value.trim();
    if (!messageText) return;

    this.inputField.value = '';

    const userMessage: ChatMessage = {
      message: messageText,
      sender: this.username,
      timestamp: new Date().toISOString()
    };
    this.addMessageToUI(userMessage);

    this.conversationHistory.push({
      role: "user",
      content: messageText
    });

    const isWeatherQuery = messageText.toLowerCase().includes('weather') || 
                          messageText.includes('天气');

    try {
      const tools = isWeatherQuery ? [{
        name: "getWeather",
        description: "Get weather information for a location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city or location to get weather for"
            }
          },
          required: ["location"]
        }
      }] : undefined;

      const requestParams: any = {
        model: 'qwen-max',
        input: {
          messages: this.conversationHistory
        }
      };
      
      if (isWeatherQuery && tools) {
        requestParams.tools = tools;
      }
      
      const result = await this.DashScopeAPI.chat.completion.request(requestParams);

      const aiReply = result?.output?.text || "抱歉，我无法理解你的问题。";
      
      this.conversationHistory.push({
        role: "assistant",
        content: aiReply
      });

      const aiMessage: ChatMessage = {
        message: aiReply,
        sender: "通义千问",
        timestamp: new Date().toISOString()
      };
      this.addMessageToUI(aiMessage);

      if (result?.output?.tool_calls && result.output.tool_calls.length > 0) {
        const toolCall = result.output.tool_calls[0];
        
        if (toolCall.name === "getWeather") {
          try {
            const location = JSON.parse(toolCall.parameters).location;
            const weatherData = await this.client.getWeather(location);
            
            const weatherMessage: ChatMessage = {
              message: `
                ${location}的天气情况:
                温度: ${weatherData.temperature}°C
                天气状况: ${weatherData.condition}
                湿度: ${weatherData.humidity}%
                风速: ${weatherData.windSpeed} km/h
              `,
              sender: "天气服务",
              timestamp: new Date().toISOString()
            };
            
            this.addMessageToUI(weatherMessage);
          } catch (error) {
            console.error('获取天气信息时出错:', error);
            this.addMessageToUI({
              message: `抱歉，我无法获取天气信息。`,
              sender: "系统",
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }
    } catch (error) {
      console.error('发送消息时出错:', error);
      this.addMessageToUI({
        message: `错误: ${error instanceof Error ? error.message : String(error)}`,
        sender: "系统",
        timestamp: new Date().toISOString()
      });
    }
  }

  private addMessageToUI(message: ChatMessage) {
    this.messages.push(message);

    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender === this.username ? 'user' : 'system'}`;
    
    const timestamp = new Date(message.timestamp);
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div class="message-content">${message.message}</div>
      <div class="message-info">${message.sender} • ${formattedTime}</div>
    `;
    
    this.messageList.appendChild(messageElement);
    
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  setUsername(username: string) {
    this.username = username;
  }

  addWelcomeMessage() {
    this.addMessageToUI({
      message: 'Welcome to the MCP Chat Demo! You can ask about the weather by typing "weather in [location]".',
      sender: 'System',
      timestamp: new Date().toISOString()
    });
  }
}
