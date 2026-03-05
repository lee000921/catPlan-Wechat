#!/usr/bin/env python3
"""
基金数据客户端配置
==================

配置文件 - 支持环境变量和配置文件两种方式
"""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class FundDataConfig:
    """基金数据配置"""
    
    # Tushare 配置
    tushare_token: Optional[str] = None
    
    # 数据源优先级: tushare, akshare, mock
    data_source: str = "tushare"
    
    # 缓存配置
    cache_enabled: bool = True
    cache_ttl: int = 3600  # 缓存过期时间(秒)
    
    # 请求配置
    request_timeout: int = 30
    max_retries: int = 3
    
    # 日志配置
    log_level: str = "INFO"
    
    @classmethod
    def from_env(cls) -> 'FundDataConfig':
        """从环境变量加载配置"""
        return cls(
            tushare_token=os.getenv('TUSHARE_TOKEN'),
            data_source=os.getenv('FUND_DATA_SOURCE', 'tushare'),
            cache_enabled=os.getenv('FUND_CACHE_ENABLED', 'true').lower() == 'true',
            cache_ttl=int(os.getenv('FUND_CACHE_TTL', '3600')),
            request_timeout=int(os.getenv('FUND_REQUEST_TIMEOUT', '30')),
            max_retries=int(os.getenv('FUND_MAX_RETRIES', '3')),
            log_level=os.getenv('FUND_LOG_LEVEL', 'INFO'),
        )
    
    @classmethod
    def from_file(cls, config_path: str = 'fund_config.ini') -> 'FundDataConfig':
        """从配置文件加载配置"""
        import configparser
        
        config = configparser.ConfigParser()
        config.read(config_path)
        
        return cls(
            tushare_token=config.get('tushare', 'token', fallback=None),
            data_source=config.get('general', 'data_source', fallback='tushare'),
            cache_enabled=config.getboolean('cache', 'enabled', fallback=True),
            cache_ttl=config.getint('cache', 'ttl', fallback=3600),
            request_timeout=config.getint('request', 'timeout', fallback=30),
            max_retries=config.getint('request', 'max_retries', fallback=3),
            log_level=config.get('logging', 'level', fallback='INFO'),
        )


# 默认配置实例
config = FundDataConfig.from_env()


# ==================== 示例配置文件 ====================

EXAMPLE_CONFIG = """
[general]
# 数据源: tushare, akshare, mock
data_source = tushare

[tushare]
# Tushare API Token (从 https://tushare.pro/user/token 获取)
token = YOUR_TUSHARE_TOKEN

[cache]
# 是否启用缓存
enabled = true
# 缓存过期时间(秒)
ttl = 3600

[request]
# 请求超时时间(秒)
timeout = 30
# 最大重试次数
max_retries = 3

[logging]
# 日志级别: DEBUG, INFO, WARNING, ERROR
level = INFO
"""

if __name__ == "__main__":
    # 创建示例配置文件
    with open('fund_config.ini.example', 'w') as f:
        f.write(EXAMPLE_CONFIG.strip())
    
    print("配置文件示例已创建: fund_config.ini.example")
    
    # 显示当前配置
    print("\n当前配置:")
    print(f"- Tushare Token: {'已设置' if config.tushare_token else '未设置'}")
    print(f"- 数据源: {config.data_source}")
    print(f"- 缓存启用: {config.cache_enabled}")
    print(f"- 缓存TTL: {config.cache_ttl}秒")