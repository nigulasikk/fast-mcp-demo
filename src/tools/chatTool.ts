import { z } from "zod";
import { createSDK } from "dashscope-node";
import * as dotenv from "dotenv";

dotenv.config();

const DashScopeAPI = createSDK({
  accessToken: process.env.TONGYI_API_KEY,
});

export const ChatMessageParams = z.object({
  message: z.string().describe("The message to send"),
  sender: z.string().describe("The sender of the message"),
});

export interface ChatMessage {
  message: string;
  sender: string;
  timestamp: string;
}

const conversationHistories: Record<string, Array<{role: string, content: string}>> = {};

export const chatTool = {
  name: "chat",
  description: "Send a chat message and get response from Tongyi Qianwen",
  parameters: ChatMessageParams,
  execute: async (args: z.infer<typeof ChatMessageParams>) => {
    console.log(`[chatTool] Received message from ${args.sender}: ${args.message}`);
    
    if (!conversationHistories[args.sender]) {
      conversationHistories[args.sender] = [];
    }
    
    conversationHistories[args.sender].push({
      role: "user",
      content: args.message
    });
    
    try {
      const result = await DashScopeAPI.chat.completion.request({
        model: 'qwen-max',
        input: {
          messages: conversationHistories[args.sender].map(msg => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content
          }))
        },
      });
      
      const aiReply = result?.output?.text || "抱歉，我无法理解你的问题。";
      
      conversationHistories[args.sender].push({
        role: "assistant",
        content: aiReply
      });
      
      if (conversationHistories[args.sender].length > 10) {
        conversationHistories[args.sender] = conversationHistories[args.sender].slice(-10);
      }
      
      const chatMessage: ChatMessage = {
        message: aiReply,
        sender: "通义千问",
        timestamp: new Date().toISOString()
      };
      
      return chatMessage;
    } catch (error) {
      console.error("[chatTool] Error calling Tongyi Qianwen API:", error);
      
      const errorMessage: ChatMessage = {
        message: `调用AI服务时出错: ${error instanceof Error ? error.message : String(error)}`,
        sender: "System",
        timestamp: new Date().toISOString()
      };
      
      return errorMessage;
    }
  }
};
