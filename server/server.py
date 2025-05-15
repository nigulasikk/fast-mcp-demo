#!/usr/bin/env python3
"""
极简微信MCP服务器
只包含一个send-message工具，通过控制台输出模拟消息发送功能
"""
import json
import sys
from typing import Dict, Any, List, Optional
import asyncio

class ZodSchema:
    def __init__(self, schema):
        self.schema = schema
    
    def parse(self, data):
        for key, type_info in self.schema.items():
            if key not in data:
                raise ValueError(f"Missing required parameter: {key}")
            
            expected_type = type_info.get("type")
            if expected_type == "string" and not isinstance(data[key], str):
                raise ValueError(f"Parameter {key} must be a string")
        
        return data

class McpServer:
    def __init__(self, config):
        self.name = config.get("name", "MCP Server")
        self.version = config.get("version", "1.0.0")
        self.tools = {}
    
    def tool(self, name, schema, handler):
        """注册工具到MCP服务器"""
        self.tools[name] = {
            "name": name,
            "schema": ZodSchema(schema),
            "handler": handler
        }
        print(f"[INFO] 已注册工具: {name}", file=sys.stderr)
    
    async def call_tool(self, name, params):
        """调用注册的工具"""
        if name not in self.tools:
            return {
                "error": f"工具 '{name}' 不存在"
            }
        
        tool = self.tools[name]
        try:
            validated_params = tool["schema"].parse(params)
            result = await tool["handler"](validated_params)
            return result
        except Exception as e:
            return {
                "error": f"调用工具出错: {str(e)}"
            }
    
    async def handle_request(self, request):
        """处理JSON-RPC请求"""
        if request.get("jsonrpc") != "2.0":
            return {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32600,
                    "message": "无效请求: 不是有效的JSON-RPC 2.0请求"
                },
                "id": request.get("id")
            }
        
        method = request.get("method")
        
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "serverInfo": {
                        "name": self.name,
                        "version": self.version
                    }
                },
                "id": request.get("id")
            }
        
        if method == "tools/list":
            tools_list = [
                {
                    "name": tool["name"],
                    "inputSchema": {
                        "type": "object",
                        "properties": tool["schema"].schema,
                        "required": list(tool["schema"].schema.keys())
                    },
                    "parameters": tool["schema"].schema
                } for tool in self.tools.values()
            ]
            
            return {
                "jsonrpc": "2.0",
                "result": {
                    "tools": tools_list
                },
                "id": request.get("id")
            }
        
        if method == "tools/call":
            params = request.get("params", {})
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            
            if not tool_name:
                return {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32602,
                        "message": "无效参数: 缺少工具名称"
                    },
                    "id": request.get("id")
                }
            
            result = await self.call_tool(tool_name, tool_args)
            
            return {
                "jsonrpc": "2.0",
                "result": result,
                "id": request.get("id")
            }
        
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": -32601,
                "message": f"方法未找到: {method}"
            },
            "id": request.get("id")
        }
    
    async def connect(self, transport):
        """连接到传输层"""
        await transport.connect(self)

class StdioServerTransport:
    async def connect(self, server):
        """通过标准输入输出连接到MCP服务器"""
        print(f"[INFO] MCP服务器已启动: {server.name} v{server.version}", file=sys.stderr)
        print(f"[INFO] 使用标准输入输出进行通信", file=sys.stderr)
        
        while True:
            try:
                line = await self.read_line()
                if not line:
                    break
                
                request = json.loads(line)
                print(f"[DEBUG] 收到请求: {json.dumps(request)}", file=sys.stderr)
                
                response = await server.handle_request(request)
                print(f"[DEBUG] 发送响应: {json.dumps(response)}", file=sys.stderr)
                
                print(json.dumps(response))
                sys.stdout.flush()
                
            except json.JSONDecodeError as e:
                print(f"[ERROR] JSON解析错误: {str(e)}", file=sys.stderr)
            except Exception as e:
                print(f"[ERROR] 处理请求出错: {str(e)}", file=sys.stderr)
    
    async def read_line(self):
        """异步读取一行输入"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, sys.stdin.readline)

async def main():
    server = McpServer({
        "name": "微信MCP服务器",
        "version": "1.0.0"
    })
    
    async def send_message(params):
        to = params["to"]
        content = params["content"]
        
        print(f"[MOCK] 发送消息到 {to}: {content}", file=sys.stderr)
        
        return {
            "content": [
                {"type": "text", "text": f"已成功发送给{to}，信息内容：{content}"}
            ]
        }
    
    server.tool(
        "send-message",
        {
            "to": {"type": "string", "description": "接收者ID"},
            "content": {"type": "string", "description": "消息内容"}
        },
        send_message
    )
    
    transport = StdioServerTransport()
    
    await server.connect(transport)

if __name__ == "__main__":
    asyncio.run(main())
