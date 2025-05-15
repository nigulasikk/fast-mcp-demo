# 微信MCP服务器演示

一个极简的微信MCP服务器实现，只包含一个send-message工具，使用控制台输出模拟消息发送功能。
通过Qwen-Agent框架调用MCP服务器中的工具。

## 项目结构

```
wechat-mcp-demo/
├── server/               # MCP服务器实现
│   ├── requirements.txt  # 服务器依赖
│   ├── server.py         # Python版MCP服务器
├── client/               # Qwen-Agent客户端实现
│   ├── requirements.txt  # 客户端依赖
│   ├── client.py         # Qwen-Agent客户端
└── README.md             # 项目说明
```

## 安装与使用

### 服务器端

1. 安装依赖:
```bash
cd server
pip install -r requirements.txt
```

2. 运行服务器:
```bash
python server.py
```

注意：服务器通常不需要单独运行，它会由Qwen-Agent自动启动

### 客户端

1. 安装依赖:
```bash
cd client
pip install -r requirements.txt
```

2. 设置环境变量:
```bash
export DASHSCOPE_API_KEY=your_api_key_here
```

3. 运行客户端:
```bash
python client.py
```

## 使用示例

运行client.py后，可以通过对话方式发送消息:

```
用户请求: 给张三发送一条消息，告诉他明天会议取消了
助手回应: 我已经发送消息给张三，告诉他明天会议取消了。
```

## 技术说明

- 服务器使用Python实现，遵循ModelContextProtocol协议
- 消息发送使用print语句模拟，不依赖实际的微信应用
- Qwen-Agent通过MCP协议调用服务器中的send-message工具
- 服务器使用标准输入输出(stdin/stdout)与客户端通信
- 服务器实现了JSON-RPC 2.0协议，支持initialize、tools/list和tools/call方法
- send-message工具需要两个参数：to（接收者ID）和content（消息内容）
