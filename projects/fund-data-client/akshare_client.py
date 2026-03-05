#!/usr/bin/env python3
"""
AkShare 基金数据客户端 (备用方案)
=================================

安装: pip install akshare
特点: 免费、无需注册、数据丰富

文档: https://akshare.akfamily.xyz/data/fund/fund.html
"""

import akshare as ak
from typing import List, Dict, Optional
import pandas as pd
from datetime import datetime, timedelta


class AkShareFundClient:
    """AkShare 基金数据客户端 - 备用免费方案"""
    
    def __init__(self):
        """初始化客户端 - 无需 token"""
        pass
    
    # ==================== 基金基础信息 ====================
    
    def get_fund_list(self, fund_type: str = "开放式基金") -> pd.DataFrame:
        """
        获取基金列表
        
        Args:
            fund_type: 基金类型
                - 开放式基金
                - 货币基金
                - 理财基金
                - 分级基金
                - ETF基金
                - LOF基金
                - QDII基金
        
        Returns:
            DataFrame: 基金列表
        """
        try:
            df = ak.fund_name_em()
            return df
        except Exception as e:
            print(f"获取基金列表失败: {e}")
            return pd.DataFrame()
    
    def get_fund_info(self, fund_code: str, fund_name: str = None) -> Dict:
        """
        获取基金详细信息
        
        Args:
            fund_code: 基金代码 (如 '110011')
            fund_name: 基金名称 (可选)
        
        Returns:
            dict: 基金信息
        """
        try:
            # 获取基金基本信息
            df = ak.fund_individual_basic_info_xq(fund=fund_code)
            return df.to_dict('records')[0] if not df.empty else {}
        except Exception as e:
            print(f"获取基金信息失败: {e}")
            return {}
    
    # ==================== 基金净值数据 ====================
    
    def get_nav_daily(self, fund_code: str, start_date: str = None,
                      end_date: str = None) -> pd.DataFrame:
        """
        获取基金每日净值
        
        Args:
            fund_code: 基金代码 (如 '110011')
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
        
        Returns:
            DataFrame: 净值数据
        """
        try:
            df = ak.fund_open_fund_daily_em(fund=fund_code)
            
            # 过滤日期范围
            if start_date:
                df = df[df['净值日期'] >= start_date]
            if end_date:
                df = df[df['净值日期'] <= end_date]
            
            return df
        except Exception as e:
            print(f"获取净值数据失败: {e}")
            return pd.DataFrame()
    
    def get_nav_latest(self, fund_code: str) -> Dict:
        """
        获取最新净值
        
        Args:
            fund_code: 基金代码
        
        Returns:
            dict: 最新净值信息
        """
        try:
            df = ak.fund_open_fund_daily_em(fund=fund_code)
            if df.empty:
                return {}
            return df.iloc[0].to_dict()
        except Exception as e:
            print(f"获取最新净值失败: {e}")
            return {}
    
    # ==================== 基金持仓数据 ====================
    
    def get_portfolio(self, fund_code: str) -> pd.DataFrame:
        """
        获取基金持仓
        
        Args:
            fund_code: 基金代码
        
        Returns:
            DataFrame: 持仓数据
        """
        try:
            # 获取股票持仓
            df = ak.fund_portfolio_em(fund=fund_code, indicator="持股")
            return df
        except Exception as e:
            print(f"获取持仓数据失败: {e}")
            return pd.DataFrame()
    
    def get_top_holdings(self, fund_code: str, top_n: int = 10) -> List[Dict]:
        """
        获取前N大重仓股
        
        Args:
            fund_code: 基金代码
            top_n: 前N大
        
        Returns:
            list: 重仓股列表
        """
        try:
            df = self.get_portfolio(fund_code)
            if df.empty:
                return []
            # 假设列名包含 '持股比例' 或类似字段
            if '持股比例' in df.columns:
                df = df.sort_values('持股比例', ascending=False)
            return df.head(top_n).to_dict('records')
        except Exception as e:
            print(f"获取重仓股失败: {e}")
            return []
    
    # ==================== 基金业绩数据 ====================
    
    def get_performance(self, fund_code: str) -> Dict:
        """
        获取基金业绩
        
        Args:
            fund_code: 基金代码
        
        Returns:
            dict: 业绩数据
        """
        try:
            df = ak.fund_open_fund_info_em(fund=fund_code, indicator="单位净值走势")
            return df.to_dict('records')
        except Exception as e:
            print(f"获取业绩数据失败: {e}")
            return {}
    
    def get_rank(self, fund_code: str) -> pd.DataFrame:
        """
        获取基金排名
        
        Args:
            fund_code: 基金代码
        
        Returns:
            DataFrame: 排名数据
        """
        try:
            # 获取同类基金排名
            df = ak.fund_open_fund_rank_em(symbol="全部")
            # 查找指定基金
            result = df[df['基金代码'] == fund_code]
            return result
        except Exception as e:
            print(f"获取排名数据失败: {e}")
            return pd.DataFrame()
    
    # ==================== 基金经理信息 ====================
    
    def get_manager_info(self, manager_name: str = None) -> pd.DataFrame:
        """
        获取基金经理信息
        
        Args:
            manager_name: 基金经理姓名
        
        Returns:
            DataFrame: 基金经理信息
        """
        try:
            df = ak.fund_manager_em()
            if manager_name:
                df = df[df['基金经理姓名'].str.contains(manager_name, na=False)]
            return df
        except Exception as e:
            print(f"获取基金经理信息失败: {e}")
            return pd.DataFrame()
    
    # ==================== ETF 专用数据 ====================
    
    def get_etf_list(self) -> pd.DataFrame:
        """获取 ETF 基金列表"""
        try:
            df = ak.fund_etf_spot_em()
            return df
        except Exception as e:
            print(f"获取 ETF 列表失败: {e}")
            return pd.DataFrame()
    
    def get_etf_realtime(self, fund_code: str) -> Dict:
        """
        获取 ETF 实时行情
        
        Args:
            fund_code: ETF 代码
        
        Returns:
            dict: 实时行情
        """
        try:
            df = ak.fund_etf_spot_em()
            result = df[df['代码'] == fund_code]
            return result.iloc[0].to_dict() if not result.empty else {}
        except Exception as e:
            print(f"获取 ETF 实时行情失败: {e}")
            return {}


# ==================== 使用示例 ====================

if __name__ == "__main__":
    # 初始化客户端 (无需 token)
    client = AkShareFundClient()
    
    # 示例1: 获取基金列表
    print("=== 获取基金列表 ===")
    funds = client.get_fund_list()
    print(funds.head())
    
    # 示例2: 获取基金净值
    print("\n=== 获取基金净值 ===")
    nav = client.get_nav_daily('110011')
    print(nav.head())
    
    # 示例3: 获取 ETF 列表
    print("\n=== 获取 ETF 列表 ===")
    etf_list = client.get_etf_list()
    print(etf_list.head())