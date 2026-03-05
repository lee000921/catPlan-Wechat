#!/usr/bin/env python3
"""
统一基金数据客户端
==================

统一接口层 - 自动选择可用数据源 (Tushare -> AkShare -> Mock)

使用方式:
    from fund_client import FundClient
    
    client = FundClient()
    funds = client.get_fund_list()
    nav = client.get_nav_daily('110011')
"""

from typing import List, Dict, Optional, Union
import pandas as pd
from dataclasses import dataclass
from datetime import datetime, timedelta

from config import FundDataConfig, config
from tushare_client import TushareFundClient
from akshare_client import AkShareFundClient
from mock_data import MockFundData


class FundClient:
    """
    统一基金数据客户端
    
    自动选择可用数据源，按优先级: Tushare -> AkShare -> Mock
    """
    
    def __init__(self, config: FundDataConfig = None, auto_fallback: bool = True):
        """
        初始化客户端
        
        Args:
            config: 配置对象，默认使用全局配置
            auto_fallback: 是否自动降级到备用数据源
        """
        self.config = config or config
        self.auto_fallback = auto_fallback
        self._tushare_client = None
        self._akshare_client = None
        self._mock_client = None
        self._active_source = None
        
        self._init_clients()
    
    def _init_clients(self):
        """初始化各数据源客户端"""
        # 尝试初始化 Tushare
        if self.config.tushare_token:
            try:
                self._tushare_client = TushareFundClient(self.config.tushare_token)
                self._active_source = 'tushare'
                print("✓ Tushare 客户端初始化成功")
            except Exception as e:
                print(f"✗ Tushare 初始化失败: {e}")
        
        # 初始化 AkShare (备用)
        try:
            self._akshare_client = AkShareFundClient()
            if not self._active_source:
                self._active_source = 'akshare'
            print("✓ AkShare 客户端初始化成功")
        except Exception as e:
            print(f"✗ AkShare 初始化失败: {e}")
        
        # 初始化 Mock (最后备用)
        self._mock_client = MockFundData()
        if not self._active_source:
            self._active_source = 'mock'
            print("⚠ 使用 Mock 数据")
    
    @property
    def active_source(self) -> str:
        """当前激活的数据源"""
        return self._active_source
    
    def _try_source(self, func_tushare, func_akshare, func_mock, *args, **kwargs):
        """
        尝试各数据源
        
        按优先级调用: Tushare -> AkShare -> Mock
        """
        errors = []
        
        # 尝试 Tushare
        if self._tushare_client:
            try:
                result = func_tushare(*args, **kwargs)
                if result is not None and not (isinstance(result, pd.DataFrame) and result.empty):
                    self._active_source = 'tushare'
                    return result
            except Exception as e:
                errors.append(f"Tushare: {e}")
        
        # 尝试 AkShare
        if self._akshare_client and self.auto_fallback:
            try:
                result = func_akshare(*args, **kwargs)
                if result is not None and not (isinstance(result, pd.DataFrame) and result.empty):
                    self._active_source = 'akshare'
                    return result
            except Exception as e:
                errors.append(f"AkShare: {e}")
        
        # 使用 Mock
        if self._mock_client and self.auto_fallback:
            result = func_mock(*args, **kwargs)
            self._active_source = 'mock'
            return result
        
        raise Exception(f"所有数据源均不可用: {'; '.join(errors)}")
    
    # ==================== 基金基础信息 ====================
    
    def get_fund_list(self, fund_type: str = None) -> pd.DataFrame:
        """
        获取基金列表
        
        Args:
            fund_type: 基金类型
                - Tushare: equity/mix/bond/monetary/qdii/etf
                - AkShare: 开放式基金/货币基金/ETF基金等
                - Mock: 混合型/股票型/ETF/指数型/债券型/货币型
        
        Returns:
            DataFrame: 基金列表
        """
        return self._try_source(
            lambda: self._tushare_client.get_fund_list(fund_type),
            lambda: self._akshare_client.get_fund_list(fund_type),
            lambda: self._mock_client.get_fund_list(fund_type),
        )
    
    def get_fund_info(self, fund_code: str) -> Dict:
        """
        获取基金详细信息
        
        Args:
            fund_code: 基金代码 (如 '110011' 或 '110011.OF')
        
        Returns:
            dict: 基金信息
        """
        # 标准化基金代码
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        return self._try_source(
            lambda: self._tushare_client.get_fund_info(ts_code),
            lambda: self._akshare_client.get_fund_info(code),
            lambda: self._mock_client.get_fund_info(code),
        )
    
    # ==================== 基金净值数据 ====================
    
    def get_nav_daily(self, fund_code: str, start_date: str = None,
                      end_date: str = None) -> pd.DataFrame:
        """
        获取基金每日净值
        
        Args:
            fund_code: 基金代码
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
        
        Returns:
            DataFrame: 净值数据
        """
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        return self._try_source(
            lambda: self._tushare_client.get_nav_daily(ts_code, start_date, end_date),
            lambda: self._akshare_client.get_nav_daily(code, start_date, end_date),
            lambda: self._mock_client.get_nav_daily(code, start_date, end_date),
        )
    
    def get_nav_latest(self, fund_code: str) -> Dict:
        """
        获取最新净值
        
        Args:
            fund_code: 基金代码
        
        Returns:
            dict: 最新净值信息
        """
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        return self._try_source(
            lambda: self._tushare_client.get_nav_latest(ts_code),
            lambda: self._akshare_client.get_nav_latest(code),
            lambda: self._mock_client.get_nav_latest(code),
        )
    
    # ==================== 基金持仓数据 ====================
    
    def get_portfolio(self, fund_code: str, period: str = None) -> pd.DataFrame:
        """
        获取基金持仓
        
        Args:
            fund_code: 基金代码
            period: 报告期 (如 '20241231')
        
        Returns:
            DataFrame: 持仓数据
        """
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        return self._try_source(
            lambda: self._tushare_client.get_portfolio(ts_code, period),
            lambda: self._akshare_client.get_portfolio(code),
            lambda: self._mock_client.get_portfolio(code),
        )
    
    def get_top_holdings(self, fund_code: str, top_n: int = 10) -> List[Dict]:
        """
        获取前N大重仓股
        
        Args:
            fund_code: 基金代码
            top_n: 前N大
        
        Returns:
            list: 重仓股列表
        """
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        return self._try_source(
            lambda: self._tushare_client.get_top_holdings(ts_code, top_n),
            lambda: self._akshare_client.get_top_holdings(code, top_n),
            lambda: self._mock_client.get_top_holdings(code, top_n),
        )
    
    # ==================== 基金业绩数据 ====================
    
    def get_performance(self, fund_code: str) -> Dict:
        """
        获取基金业绩
        
        Args:
            fund_code: 基金代码
        
        Returns:
            dict: 业绩数据
        """
        code = fund_code.split('.')[0]
        return self._mock_client.get_performance(code)
    
    def get_dividend(self, fund_code: str) -> pd.DataFrame:
        """
        获取基金分红记录
        
        Args:
            fund_code: 基金代码
        
        Returns:
            DataFrame: 分红记录
        """
        code = fund_code.split('.')[0]
        ts_code = f"{code}.OF" if '.' not in fund_code else fund_code
        
        if self._tushare_client:
            return self._tushare_client.get_dividend(ts_code)
        return pd.DataFrame()


# ==================== 便捷函数 ====================

def get_fund(fund_code: str) -> Dict:
    """快速获取基金信息"""
    client = FundClient()
    return client.get_fund_info(fund_code)


def get_nav(fund_code: str, days: int = 30) -> pd.DataFrame:
    """快速获取基金净值"""
    client = FundClient()
    end_date = datetime.now().strftime('%Y%m%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')
    return client.get_nav_daily(fund_code, start_date, end_date)


def get_top10(fund_code: str) -> List[Dict]:
    """快速获取前十大重仓股"""
    client = FundClient()
    return client.get_top_holdings(fund_code, top_n=10)


# ==================== 使用示例 ====================

if __name__ == "__main__":
    print("=== 基金数据客户端示例 ===\n")
    
    # 初始化客户端
    client = FundClient()
    print(f"当前数据源: {client.active_source}\n")
    
    # 示例1: 获取基金列表
    print("=== 基金列表 ===")
    funds = client.get_fund_list()
    print(funds.head())
    print()
    
    # 示例2: 获取基金信息
    print("=== 基金信息 (110011) ===")
    info = client.get_fund_info('110011')
    print(info)
    print()
    
    # 示例3: 获取净值数据
    print("=== 净值数据 (110011) ===")
    nav = client.get_nav_daily('110011')
    print(nav.head())
    print()
    
    # 示例4: 获取重仓股
    print("=== 重仓股 (110011) ===")
    holdings = client.get_top_holdings('110011', top_n=5)
    for h in holdings:
        print(f"  {h.get('stock_name', h.get('name', 'N/A'))}: {h.get('hold_ratio', h.get('mkv', 'N/A'))}%")