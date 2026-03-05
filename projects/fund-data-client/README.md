# 基金数据客户端

快速接入基金数据的 Python 客户端，支持多种数据源。

## 特性

- ✅ **多数据源支持**: Tushare (主力) → AkShare (备用) → Mock (演示)
- ✅ **自动降级**: 数据源不可用时自动切换备用源
- ✅ **统一接口**: 一套代码，多数据源无缝切换
- ✅ **零配置启动**: 无需任何配置即可使用 Mock 数据测试
- ✅ **类型安全**: 完整的类型注解

## 快速开始

### 1. 安装依赖

```bash
# 必需依赖
pip install pandas

# 数据源依赖 (至少安装一个)
pip install tushare    # Tushare 数据源
pip install akshare    # AkShare 数据源
```

### 2. 配置 Tushare (推荐)

Tushare 提供最完整的基金数据，需要注册获取 token：

#### 注册步骤

1. 访问 https://tushare.pro/register
2. 注册账号并登录
3. 进入「个人中心」→「接口Token」
4. 复制你的 Token

#### 配置方式

**方式一: 环境变量 (推荐)**

```bash
export TUSHARE_TOKEN=your_token_here
```

**方式二: 配置文件**

```bash
# 复制示例配置
cp fund_config.ini.example fund_config.ini

# 编辑配置文件
vim fund_config.ini
```

```ini
[tushare]
token = YOUR_TUSHARE_TOKEN
```

**方式三: 代码中设置**

```python
from fund_client import FundClient
from config import FundDataConfig

config = FundDataConfig(tushare_token='your_token_here')
client = FundClient(config=config)
```

### 3. 使用示例

```python
from fund_client import FundClient

# 初始化客户端 (自动检测数据源)
client = FundClient()

# 获取基金列表
funds = client.get_fund_list()
print(funds.head())

# 获取基金信息
info = client.get_fund_info('110011')

# 获取净值数据
nav = client.get_nav_daily('110011')

# 获取重仓股
holdings = client.get_top_holdings('110011', top_n=10)
```

## 数据源对比

| 特性 | Tushare | AkShare | Mock |
|------|---------|---------|------|
| 注册要求 | ✅ 需要 | ❌ 不需要 | ❌ 不需要 |
| 数据完整性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 基金列表 | ✅ | ✅ | ✅ |
| 净值数据 | ✅ | ✅ | ✅ |
| 持仓数据 | ✅ | ✅ | ✅ |
| 基金经理 | ✅ | ✅ | ✅ |
| 分红数据 | ✅ | ❌ | ❌ |
| 复权因子 | ✅ | ❌ | ❌ |
| API 频率限制 | 有 | 有 | 无 |

## API 参考

### FundClient

```python
from fund_client import FundClient

client = FundClient()
```

#### get_fund_list(fund_type=None)

获取基金列表。

```python
# 获取全部基金
funds = client.get_fund_list()

# 获取股票型基金
funds = client.get_fund_list(fund_type='equity')
```

#### get_fund_info(fund_code)

获取单个基金详细信息。

```python
info = client.get_fund_info('110011')
```

#### get_nav_daily(fund_code, start_date=None, end_date=None)

获取基金每日净值。

```python
# 获取全部历史净值
nav = client.get_nav_daily('110011')

# 指定日期范围
nav = client.get_nav_daily('110011', start_date='20240101', end_date='20241231')
```

#### get_nav_latest(fund_code)

获取最新净值。

```python
nav = client.get_nav_latest('110011')
```

#### get_portfolio(fund_code, period=None)

获取基金持仓。

```python
portfolio = client.get_portfolio('110011')
```

#### get_top_holdings(fund_code, top_n=10)

获取前N大重仓股。

```python
holdings = client.get_top_holdings('110011', top_n=10)
```

#### get_performance(fund_code)

获取基金业绩。

```python
perf = client.get_performance('110011')
```

### 便捷函数

```python
from fund_client import get_fund, get_nav, get_top10

# 快速获取基金信息
info = get_fund('110011')

# 快速获取近30天净值
nav = get_nav('110011', days=30)

# 快速获取前十大重仓股
holdings = get_top10('110011')
```

## 项目结构

```
fund-data-client/
├── fund_client.py      # 统一客户端接口
├── tushare_client.py   # Tushare 数据源
├── akshare_client.py   # AkShare 数据源
├── mock_data.py        # Mock 数据
├── config.py           # 配置管理
├── README.md           # 使用文档
├── fund_config.ini.example  # 配置示例
└── requirements.txt    # 依赖列表
```

## 常见问题

### Q: Tushare 报错 "token 无效"

A: 检查 token 是否正确设置：
```python
import os
print(os.getenv('TUSHARE_TOKEN'))  # 应该输出你的 token
```

### Q: AkShare 数据获取失败

A: AkShare 偶尔会有接口不稳定，建议：
1. 检查网络连接
2. 增加重试次数
3. 使用 Tushare 作为主力数据源

### Q: 如何查看当前使用的数据源？

```python
client = FundClient()
print(client.active_source)  # 输出: tushare/akshare/mock
```

### Q: 如何禁用自动降级？

```python
client = FundClient(auto_fallback=False)
```

## 开发计划

- [ ] 添加缓存层
- [ ] 添加异步支持
- [ ] 添加更多基金类型
- [ ] 添加技术指标计算
- [ ] 添加数据导出功能

## 许可证

MIT License