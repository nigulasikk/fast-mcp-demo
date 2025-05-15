#!/usr/bin/env python3
"""
直接测试MCP服务器功能
"""
import json
import subprocess
import sys

def test_mcp_server():
    """直接测试MCP服务器功能"""
    print("=== 开始测试MCP服务器 ===")
    
    server_process = subprocess.Popen(
        ["python", "server.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    init_request = {
        "jsonrpc": "2.0",
        "method": "initialize",
        "id": 1
    }
    
    server_process.stdin.write(json.dumps(init_request) + "\n")
    server_process.stdin.flush()
    
    init_response = json.loads(server_process.stdout.readline())
    print("初始化响应:", json.dumps(init_response, indent=2, ensure_ascii=False))
    
    list_request = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "id": 2
    }
    
    server_process.stdin.write(json.dumps(list_request) + "\n")
    server_process.stdin.flush()
    
    list_response = json.loads(server_process.stdout.readline())
    print("工具列表响应:", json.dumps(list_response, indent=2, ensure_ascii=False))
    
    call_request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "send-message",
            "arguments": {
                "to": "filehelper",
                "content": "这是一条测试消息"
            }
        },
        "id": 3
    }
    
    server_process.stdin.write(json.dumps(call_request) + "\n")
    server_process.stdin.flush()
    
    call_response = json.loads(server_process.stdout.readline())
    print("调用工具响应:", json.dumps(call_response, indent=2, ensure_ascii=False))
    
    server_process.terminate()
    
    print("=== 测试完成 ===")

if __name__ == "__main__":
    test_mcp_server()
