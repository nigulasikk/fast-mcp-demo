import { z } from "zod";

export const ChatMessageParams = z.object({
  message: z.string().describe("The message to send"),
  sender: z.string().describe("The sender of the message"),
});

export interface ChatMessage {
  message: string;
  sender: string;
  timestamp: string;
}

export const chatTool = {
  name: "chat",
  description: "Send a chat message",
  parameters: ChatMessageParams,
  execute: async (args: z.infer<typeof ChatMessageParams>) => {
    console.log(`[chatTool] Received message from ${args.sender}: ${args.message}`);
    
    const chatMessage: ChatMessage = {
      message: args.message,
      sender: args.sender,
      timestamp: new Date().toISOString()
    };
    
    return chatMessage;
  }
};
