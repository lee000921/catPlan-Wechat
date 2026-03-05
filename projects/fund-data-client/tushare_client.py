#!/usr/bin/env python3
"""
Tushare 基金数据客户端
======================

安装: pip install tushare
注册: https://tushare.pro/register
"""

import tushare as ts
from typing import List, Dict, Optional
import pandas as pd
from datetime import datetime, timedelta


class TushareFundClient:
    """Tushare 基金数据客户端"""
    
    def __init__(self, token: str):
        """
        初始化客户端
        
        Args:
            token: Tushare API Token (从 https://tushare.pro/user/token 获取)
        """
        self.token = token
        self.pro = ts.pro_api(token)
        self._cache = {}
    
    # ==================== 基金基础信息 ====================
    
    def get_fund_list(self, fund_type: str = None) -> pd.DataFrame:
        """
        获取基金列表
        
        Args:
            fund_type: 基金类型 (None=全部, 'equity'=股票型, 'mix'=混合型, 
                       'bond'=债券型, 'monetary'=货币型, 'qdii'=QDII, 'etf'=ETF)
        
        Returns:
            DataFrame: ts_code, name, management, fund_type, found_date
        """
        try:
            df = self.pro.fund_basic(market='E')
            if fund_type:
                df = df[df['fund_type'] == fund_type]
            return df[['ts_code', 'name', 'management', 'fund_type', 'found_date']]
        except Exception as e:
            print(f"获取基金列表失败: {e}")
            return pd.DataFrame()
    
    def get_fund_info(self, ts_code: str) -> Dict:
        """
        获取单个基金详细信息
        
        Args:
            ts_code: 基金代码 (如 '110011.OF')
        
        Returns:
            dict: 基金详细信息
        """
        try:
            df = self.pro.fund_basic(ts_code=ts_code)
            if df.empty:
                return {}
            return df.iloc[0].to_dict()
        except Exception as e:
            print(f"获取基金信息失败: {e}")
            return {}
    
    # ==================== 基金净值数据 ====================
    
    def get_nav_daily(self, ts_code: str, start_date: str = None, 
                      end_date: str = None) -> pd.DataFrame:
        """
        获取基金每日净值
        
        Args:
            ts_code: 基金代码 (如 '110011.OF')
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
        
        Returns:
            DataFrame: ts_code, nav_date, nav, accum_nav
        """
        try:
            df = self.pro.fund_nav(ts_code=ts_code, start_date=start_date, 
                                   end_date=end_date)
            return df[['ts_code', 'nav_date', 'nav', 'accum_nav']]
        except Exception as e:
            print(f"获取净值数据失败: {e}")
            return pd.DataFrame()
    
    def get_nav_latest(self, ts_code: str) -> Dict:
        """
        获取最新净值
        
        Args:
            ts_code: 基金代码
        
        Returns:
            dict: 最新净值信息
        """
        try:
            end_date = datetime.now().strftime('%Y%m%d')
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y%m%d')
            df = self.pro.fund_nav(ts_code=ts_code, start_date=start_date, 
                                   end_date=end_date)
            if df.empty:
                return {}
            df = df.sort_values('nav_date', ascending=False)
            return df.iloc[0].to_dict()
        except Exception as e:
            print(f"获取最新净值失败: {e}")
            return {}
    
    # ==================== 基金持仓数据 ====================
    
    def get_portfolio(self, ts_code: str, period: str = None) -> pd.DataFrame:
        """
        获取基金持仓
        
        Args:
            ts_code: 基金代码
            period: 报告期 (如 '20241231')
        
        Returns:
            DataFrame: 持仓明细
        """
        try:
            df = self.pro.fund_portfolio(ts_code=ts_code, period=period)
            return df
        except Exception as e:
            print(f"获取持仓数据失败: {e}")
            return pd.DataFrame()
    
    def get_top_holdings(self, ts_code: str, top_n: int = 10) -> List[Dict]:
        """
        获取前N大重仓股
        
        Args:
            ts_code: 基金代码
            top_n: 前N大
        
        Returns:
            list: 重仓股列表
        """
        try:
            df = self.pro.fund_portfolio(ts_code=ts_code)
            if df.empty:
                return []
            df = df.sort_values('hold_amount', ascending=False).head(top_n)
            return df.to_dict('records')
        except Exception as e:
            print(f"获取重仓股失败: {e}")
            return []
    
    # ==================== 基金经理信息 ====================
    
    def get_manager_info(self, manager_name: str = None, 
                         ts_code: str = None) -> pd.DataFrame:
        """
        获取基金经理信息
        
        Args:
            manager_name: 基金经理姓名
            ts_code: 基金代码
        
        Returns:
            DataFrame: 基金经理信息
        """
        try:
            df = self.pro.fund_manager(manager_name=manager_name, ts_code=ts_code)
            return df
        except Exception as e:
            print(f"获取基金经理信息失败: {e}")
            return pd.DataFrame()
    
    # ==================== 基金业绩数据 ====================
    
    def get_dividend(self, ts_code: str) -> pd.DataFrame:
        """
        获取基金分红记录
        
        Args:
            ts_code: 基金代码
        
        Returns:
            DataFrame: 分红记录
        """
        try:
            df = self.pro.fund_div(ts_code=ts_code)
            return df
        except Exception as e:
            print(f"获取分红记录失败: {e}")
            return pd.DataFrame()
    
    def get_adj_factor(self, ts_code: str, start_date: str = None,
                       end_date: str = None) -> pd.DataFrame:
        """
        获取复权因子
        
        Args:
            ts_code: 基金代码
            start_date: 开始日期
            end_date: 结束日期
        
        Returns:
            DataFrame: 复权因子
        """
        try:
            df = self.pro.adj_factor(ts_code=ts_code, start_date=start_date,
                                     end_date=end_date)
            return df
        except Exception as e:
            print(f"获取复权因子失败: {e}")
            return pd.DataFrame()


# ==================== 使用示例 ====================

if __name__ == "__main__":
    # 示例配置 - 请替换为你的实际 token
    TOKEN = "YOUR_TUSHARE_TOKEN"
    
    # 初始化客户端
    client = TushareFundClient(TOKEN)
    
    # 示例1: 获取基金列表
    print("=== 获取基金列表 ===")
    funds = client.get_fund_list(fund_type='equity')
    print(funds.head())
    
    # 示例2: 获取基金净值
    print("\n=== 获取基金净值 ===")
    nav = client.get_nav_daily('110011.OF')
    print(nav.head())
    
    # 示例3: 获取基金持仓
    print("\n=== 获取基金持仓 ===")
    portfolio = client.get_top_holdings('110011.OF')
    print(portfolio)