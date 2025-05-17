#!/usr/bin/env python3
"""
Qwen-Agent客户端
用于连接到微信MCP服务器并调用send-message工具
使用mcpServers配置方式连接到MCP服务器
"""
import os
import json
from qwen_agent.agents import Assistant
from qwen_agent.utils.output_beautify import typewriter_print

llm_cfg = {
    'model': 'qwen3-32b',
    'model_server': 'dashscope',
    'api_key': os.getenv('DASHSCOPE_API_KEY', '')  # 从环境变量获取API密钥
}

tools = [{
    "mcpServers": {
        "wechat": {
            "command": "python",
            "args": ["../server/server.py"]
        }
    }
}]

agent = Assistant(
    llm=llm_cfg,
    function_list=tools,
    system_message="你是一个能帮助用户发送消息的助手。当用户要求你发送消息时，使用MCP服务器中的send_message工具将消息发送给指定的接收者。请始终使用中文回复。"
)

def main():
    """主函数"""
    print("=== 微信消息发送助手 ===")
    print("你可以要求助手发送消息，例如：'给张三发送一条消息，告诉他明天会议取消了'")
    print("输入'exit'退出程序")
    print("=====================")
    
    messages = []
    
    while True:
        query = input('\n用户请求: ')
        if query.lower() == 'exit':
            break
        
        messages.append({'role': 'user', 'content': query})
        
        response_plain_text = ''
        print('助手回应:')
        
        for response in agent.run(messages=messages):
            response_plain_text = typewriter_print(response, response_plain_text)
        
        messages.extend(response)

if __name__ == "__main__":
    main()
