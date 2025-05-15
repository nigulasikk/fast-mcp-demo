#!/usr/bin/env python3
"""
Qwen-Agent客户端
用于连接到微信MCP服务器并调用send-message工具
"""
import os
import subprocess
import json
import time
from qwen_agent.agents import Assistant
from qwen_agent.tools.base import BaseTool, register_tool
from qwen_agent.utils.output_beautify import typewriter_print

@register_tool('send_wechat_message')
class SendWechatMessage(BaseTool):
    description = '发送微信消息给指定的接收者'
    parameters = [{
        'name': 'to',
        'type': 'string',
        'description': '接收者ID',
        'required': True
    }, {
        'name': 'content',
        'type': 'string',
        'description': '消息内容',
        'required': True
    }]
    
    def __init__(self, config=None):
        super().__init__()
        self.server_process = subprocess.Popen(
            ["python", "../server/server.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        self._initialize_server()
        self._list_tools()
        
    def _initialize_server(self):
        """初始化服务器连接"""
        init_request = {
            "jsonrpc": "2.0",
            "method": "initialize",
            "id": 1
        }
        self.server_process.stdin.write(json.dumps(init_request) + "\n")
        self.server_process.stdin.flush()
        init_response = json.loads(self.server_process.stdout.readline())
        print(f"服务器初始化响应: {json.dumps(init_response, indent=2, ensure_ascii=False)}")
    
    def _list_tools(self):
        """获取工具列表"""
        list_request = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "id": 2
        }
        self.server_process.stdin.write(json.dumps(list_request) + "\n")
        self.server_process.stdin.flush()
        list_response = json.loads(self.server_process.stdout.readline())
        print(f"工具列表响应: {json.dumps(list_response, indent=2, ensure_ascii=False)}")
    
    def call(self, params: str, **kwargs) -> str:
        """调用工具发送消息"""
        params_dict = json.loads(params)
        to = params_dict.get('to')
        content = params_dict.get('content')
        
        # 调用MCP服务器的send-message工具
        call_request = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": "send-message",
                "arguments": {
                    "to": to,
                    "content": content
                }
            },
            "id": 3
        }
        
        self.server_process.stdin.write(json.dumps(call_request) + "\n")
        self.server_process.stdin.flush()
        call_response = json.loads(self.server_process.stdout.readline())
        
        stderr_output = ""
        while self.server_process.stderr.readable() and not self.server_process.stderr.closed:
            line = self.server_process.stderr.readline()
            if not line:
                break
            stderr_output += line
            if "[MOCK]" in line:
                print(f"服务器日志: {line.strip()}")
        
        result = call_response.get("result", {})
        content_list = result.get("content", [])
        
        if content_list:
            return json.dumps({"result": content_list[0].get("text", "消息发送成功")})
        else:
            return json.dumps({"result": "消息发送成功"})
    
    def __del__(self):
        """清理资源"""
        if hasattr(self, 'server_process') and self.server_process:
            self.server_process.terminate()

llm_cfg = {
    'model': 'qwen3-32b',
    'model_server': 'dashscope',
    'api_key': os.getenv('DASHSCOPE_API_KEY', '')  # 从环境变量获取API密钥
}

agent = Assistant(
    llm=llm_cfg,
    function_list=['send_wechat_message'],
    system_message="你是一个能帮助用户发送消息的助手。当用户要求你发送消息时，使用'send_wechat_message'工具将消息发送给指定的接收者。请始终使用中文回复。"
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
