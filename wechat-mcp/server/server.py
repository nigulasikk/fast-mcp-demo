#!/usr/bin/env python3
"""
极简微信MCP服务器
只包含一个send-message工具，通过控制台输出模拟消息发送功能
使用FastMCP框架实现
"""
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("微信MCP服务器")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool()
def send_message(recipient: str, message: str) -> str:
    """
    给指定的接收者发送消息。
    
    Args:
        recipient: 接收者的名称或ID
        message: 要发送的消息内容
    
    Returns:
        str: 发送状态信息
    """
    try:
        print(f"[MOCK] 发送消息到 {recipient}: {message}")
        
        
        return f"消息已成功发送给 {recipient}，消息内容：{message}"
    except Exception as e:
        return f"发送消息失败: {str(e)}"

if __name__ == "__main__":
    mcp.run()
