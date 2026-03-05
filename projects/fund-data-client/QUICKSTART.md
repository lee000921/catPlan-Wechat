# 快速开始指南

## 一、Tushare 注册指南 (推荐)

### 步骤 1: 注册账号

1. 访问 Tushare 官网: https://tushare.pro/register
2. 填写注册信息:
   - 手机号/邮箱
   - 设置密码
   - 验证手机/邮箱

### 步骤 2: 获取 Token

1. 登录后进入「个人中心」
2. 点击左侧菜单「接口Token」
3. 复制你的 Token（类似：`1234567890abcdef1234567890abcdef`）

### 步骤 3: 配置 Token

**方式一: 环境变量 (推荐)**

```bash
# Linux/Mac
export TUSHARE_TOKEN=your_token_here

# Windows CMD
set TUSHARE_TOKEN=your_token_here

# Windows PowerShell
$env:TUSHARE_TOKEN="your_token_here"
```

**方式二: 配置文件**

```bash
# 复制示例配置
cp fund_config.ini.example fund_config.ini

# 编辑配置文件，填入你的 Token
vim fund_config.ini
```

```ini
[tushare]
token = 你的Token
```

### 步骤 4: 验证配置

```bash
python3 -c "
from config import config
print(f'Token 已设置: {bool(config.tushare_token)}')
"
```

---

## 二、使用 AkShare (无需注册)

如果你不想注册 Tushare，可以直接使用 AkShare：

```bash
# 安装 AkShare
pip3 install --user akshare
```

```python
from akshare_client import AkShareFundClient

client = AkShareFundClient()

# 获取基金列表
funds = client.get_fund_list()

# 获取净值数据
nav = client.get_nav_daily('110011')
```

**注意**: AkShare 数据可能不如 Tushare 完整，部分接口可能不稳定。

---

## 三、使用 Mock 数据 (开发测试)

如果你只是想测试代码，可以使用 Mock 数据：

```python
from mock_data import MockFundData

mock = MockFundData()

# 获取基金列表
funds = mock.get_fund_list()

# 获取净值数据
nav = mock.get_nav_daily('110011')

# 获取持仓数据
holdings = mock.get_top_holdings('110011')
```

---

## 四、统一接口 (推荐)

使用统一接口，自动选择可用数据源：

```python
from fund_client import FundClient

# 初始化客户端 (自动检测数据源)
client = FundClient()

# 查看当前数据源
print(f"当前数据源: {client.active_source}")

# 获取基金列表
funds = client.get_fund_list()

# 获取基金信息
info = client.get_fund_info('110011')

# 获取净值数据
nav = client.get_nav_daily('110011')

# 获取重仓股
holdings = client.get_top_holdings('110011', top_n=10)
```

---

## 五、常见问题

### Q: Tushare 提示 "积分不足" 怎么办？

A: Tushare 免费版有积分限制，解决方法：
1. 完成「新手任务」获取积分
2. 等待每日积分重置
3. 升级付费版
4. 使用 AkShare 或 Mock 数据

### Q: AkShare 接口超时怎么办？

A: AkShare 可能偶尔不稳定，建议：
1. 增加重试次数
2. 添加延时
3. 使用 Tushare 作为主力

### Q: 如何查看 API 调用情况？

A: 设置日志级别：

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 六、下一步

1. 查看 [README.md](README.md) 了解完整 API
2. 运行 `python3 fund_client.py` 测试示例
3. 集成到你的项目中

---

**祝你使用愉快！** 🎉