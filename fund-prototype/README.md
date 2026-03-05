# 基金系统原型 - 后端 API

基于 FastAPI 的基金数据查询原型系统。

## 功能

- 📋 获取基金列表
- 📊 基金估值查询
- 💰 基金净值查询
- 🔄 支持 Tushare 真实数据（可选）

## 快速开始

### 1. 安装依赖

```bash
cd fund-prototype
pip install -r requirements.txt
```

### 2. 启动服务

```bash
# 方式一：直接运行
python app.py

# 方式二：使用 uvicorn
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

服务启动后访问：http://localhost:8000

### 3. 查看 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 接口

### GET /api/funds
获取基金列表（示例 10 只基金）

**响应示例：**
```json
[
  {
    "code": "110022",
    "name": "易方达消费行业股票",
    "type": "股票型",
    "manager": "萧楠",
    "company": "易方达基金",
    "establish_date": "2010-08-20",
    "size": 286.54
  }
]
```

### GET /api/funds/{code}/estimate
获取基金实时估值

**参数：**
- `code`: 基金代码（6位数字）

**响应示例：**
```json
{
  "code": "110022",
  "name": "易方达消费行业股票",
  "estimate_value": 4.6234,
  "estimate_change": 1.34,
  "update_time": "2024-01-15 14:30:00"
}
```

### GET /api/funds/{code}/nav
获取基金净值信息

**参数：**
- `code`: 基金代码（6位数字）

**响应示例：**
```json
{
  "code": "110022",
  "name": "易方达消费行业股票",
  "nav": 4.5623,
  "acc_nav": 5.8234,
  "nav_date": "2024-01-14",
  "day_change": 2.35
}
```

## Tushare 接入（可选）

如需使用真实数据：

1. 注册 [Tushare](https://tushare.pro/) 获取 Token
2. 设置环境变量：

```bash
export TUSHARE_TOKEN=你的token
```

3. 重启服务即可

> 注：Tushare 免费版有调用频率限制，Mock 数据足够原型演示使用。

## 测试示例

```bash
# 获取基金列表
curl http://localhost:8000/api/funds

# 获取基金估值
curl http://localhost:8000/api/funds/110022/estimate

# 获取基金净值
curl http://localhost:8000/api/funds/110022/nav
```

## 目录结构

```
fund-prototype/
├── app.py            # 主应用
├── requirements.txt  # 依赖包
└── README.md         # 说明文档
```

## 技术栈

- **FastAPI** - 现代高性能 Web 框架
- **Pydantic** - 数据验证
- **Uvicorn** - ASGI 服务器
- **Tushare** - 金融数据接口（可选）