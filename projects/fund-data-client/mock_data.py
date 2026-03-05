#!/usr/bin/env python3
"""
基金 Mock 数据
==============

当 Tushare/AkShare API 不可用时使用的模拟数据。
包含完整的基金列表、净值、持仓等数据。
"""

from datetime import datetime, timedelta
import random
import pandas as pd
from typing import List, Dict, Optional


class MockFundData:
    """Mock 基金数据生成器"""
    
    def __init__(self):
        self.fund_list = self._generate_fund_list()
        self.nav_data = self._generate_nav_data()
        self.portfolio_data = self._generate_portfolio()
    
    # ==================== Mock 基金列表 ====================
    
    def _generate_fund_list(self) -> List[Dict]:
        """生成 Mock 基金列表"""
        funds = [
            {"ts_code": "110011.OF", "code": "110011", "name": "易方达中小盘混合", 
             "type": "混合型", "management": "易方达基金", 
             "found_date": "20080619", "scale": 32.5},
            {"ts_code": "000001.OF", "code": "000001", "name": "华夏成长混合", 
             "type": "混合型", "management": "华夏基金", 
             "found_date": "20011218", "scale": 18.7},
            {"ts_code": "110022.OF", "code": "110022", "name": "易方达消费行业股票", 
             "type": "股票型", "management": "易方达基金", 
             "found_date": "20100820", "scale": 45.3},
            {"ts_code": "510300.SH", "code": "510300", "name": "沪深300ETF", 
             "type": "ETF", "management": "华泰柏瑞基金", 
             "found_date": "20120528", "scale": 156.8},
            {"ts_code": "159915.SZ", "code": "159915", "name": "创业板ETF", 
             "type": "ETF", "management": "易方达基金", 
             "found_date": "20110920", "scale": 89.2},
            {"ts_code": "161725.SZ", "code": "161725", "name": "招商中证白酒指数", 
             "type": "指数型", "management": "招商基金", 
             "found_date": "20150527", "scale": 67.4},
            {"ts_code": "000961.OF", "code": "000961", "name": "天弘沪深300指数", 
             "type": "指数型", "management": "天弘基金", 
             "found_date": "20130218", "scale": 112.6},
            {"ts_code": "050022.OF", "code": "050022", "name": "博时转债增强债券A", 
             "type": "债券型", "management": "博时基金", 
             "found_date": "20100602", "scale": 23.5},
            {"ts_code": "511880.SH", "code": "511880", "name": "银华日利货币ETF", 
             "type": "货币型", "management": "银华基金", 
             "found_date": "20130805", "scale": 892.3},
            {"ts_code": "000011.OF", "code": "000011", "name": "华夏大盘精选混合A", 
             "type": "混合型", "management": "华夏基金", 
             "found_date": "20040811", "scale": 28.9},
        ]
        return funds
    
    def get_fund_list(self, fund_type: str = None) -> pd.DataFrame:
        """获取 Mock 基金列表"""
        funds = self.fund_list
        if fund_type:
            funds = [f for f in funds if f['type'] == fund_type]
        return pd.DataFrame(funds)
    
    def get_fund_info(self, fund_code: str) -> Dict:
        """获取单个基金信息"""
        for fund in self.fund_list:
            if fund['code'] == fund_code or fund['ts_code'] == fund_code:
                return fund
        return {}
    
    # ==================== Mock 净值数据 ====================
    
    def _generate_nav_data(self) -> Dict[str, List[Dict]]:
        """生成 Mock 净值数据"""
        nav_data = {}
        base_nav = 1.0
        base_accum = 1.0
        
        for fund in self.fund_list:
            navs = []
            nav = base_nav + random.uniform(0.5, 3.0)
            accum = base_accum + random.uniform(1.0, 4.0)
            
            # 生成最近30天的净值数据
            for i in range(30):
                date = (datetime.now() - timedelta(days=29-i)).strftime('%Y%m%d')
                # 模拟净值波动
                change = random.uniform(-0.02, 0.03)
                nav = round(nav * (1 + change), 4)
                accum = round(accum * (1 + change), 4)
                
                navs.append({
                    'ts_code': fund['ts_code'],
                    'nav_date': date,
                    'nav': nav,
                    'accum_nav': accum,
                    'daily_return': round(change * 100, 2)
                })
            
            nav_data[fund['code']] = navs
        
        return nav_data
    
    def get_nav_daily(self, fund_code: str, start_date: str = None,
                      end_date: str = None) -> pd.DataFrame:
        """获取 Mock 净值数据"""
        navs = self.nav_data.get(fund_code, [])
        
        if start_date:
            navs = [n for n in navs if n['nav_date'] >= start_date]
        if end_date:
            navs = [n for n in navs if n['nav_date'] <= end_date]
        
        return pd.DataFrame(navs)
    
    def get_nav_latest(self, fund_code: str) -> Dict:
        """获取最新净值"""
        navs = self.nav_data.get(fund_code, [])
        return navs[-1] if navs else {}
    
    # ==================== Mock 持仓数据 ====================
    
    def _generate_portfolio(self) -> Dict[str, List[Dict]]:
        """生成 Mock 持仓数据"""
        stocks = [
            {"code": "600519.SH", "name": "贵州茅台", "industry": "白酒"},
            {"code": "000858.SZ", "name": "五粮液", "industry": "白酒"},
            {"code": "601318.SH", "name": "中国平安", "industry": "保险"},
            {"code": "000333.SZ", "name": "美的集团", "industry": "家电"},
            {"code": "600036.SH", "name": "招商银行", "industry": "银行"},
            {"code": "601012.SH", "name": "隆基绿能", "industry": "光伏"},
            {"code": "002594.SZ", "name": "比亚迪", "industry": "新能源"},
            {"code": "300750.SZ", "name": "宁德时代", "industry": "新能源"},
            {"code": "600900.SH", "name": "长江电力", "industry": "电力"},
            {"code": "601398.SH", "name": "工商银行", "industry": "银行"},
        ]
        
        portfolio_data = {}
        for fund in self.fund_list:
            # 随机选择5-10只股票作为持仓
            num_stocks = random.randint(5, 10)
            selected = random.sample(stocks, min(num_stocks, len(stocks)))
            
            total_ratio = 0
            holdings = []
            for i, stock in enumerate(selected):
                # 最后一只股票的比例 = 剩余比例
                if i == len(selected) - 1:
                    ratio = round(100 - total_ratio, 2)
                else:
                    ratio = round(random.uniform(3, 15), 2)
                    total_ratio += ratio
                
                holdings.append({
                    'stock_code': stock['code'],
                    'stock_name': stock['name'],
                    'industry': stock['industry'],
                    'hold_ratio': ratio,
                    'hold_amount': round(ratio * fund['scale'] * 1000000 / 100, 0),
                    'period': '20241231'
                })
            
            portfolio_data[fund['code']] = holdings
        
        return portfolio_data
    
    def get_portfolio(self, fund_code: str) -> pd.DataFrame:
        """获取 Mock 持仓数据"""
        holdings = self.portfolio_data.get(fund_code, [])
        return pd.DataFrame(holdings)
    
    def get_top_holdings(self, fund_code: str, top_n: int = 10) -> List[Dict]:
        """获取前N大重仓股"""
        holdings = self.portfolio_data.get(fund_code, [])
        holdings = sorted(holdings, key=lambda x: x['hold_ratio'], reverse=True)
        return holdings[:top_n]
    
    # ==================== Mock 业绩数据 ====================
    
    def get_performance(self, fund_code: str) -> Dict:
        """获取 Mock 业绩数据"""
        fund_info = self.get_fund_info(fund_code)
        if not fund_info:
            return {}
        
        # 生成随机业绩数据
        return {
            'fund_code': fund_code,
            'fund_name': fund_info['name'],
            'return_1m': round(random.uniform(-5, 10), 2),
            'return_3m': round(random.uniform(-10, 20), 2),
            'return_6m': round(random.uniform(-15, 30), 2),
            'return_1y': round(random.uniform(-20, 50), 2),
            'return_3y': round(random.uniform(-30, 100), 2),
            'return_ytd': round(random.uniform(-10, 15), 2),
            'max_drawdown': round(random.uniform(5, 25), 2),
            'sharpe_ratio': round(random.uniform(0.5, 2.5), 2),
            'volatility': round(random.uniform(10, 25), 2),
        }
    
    def get_manager_info(self, fund_code: str) -> Dict:
        """获取 Mock 基金经理信息"""
        managers = [
            {'name': '张坤', 'experience': '15年', 'fund_count': 5, 
             'total_scale': '856亿', 'return_3y': '28.5%'},
            {'name': '刘彦春', 'experience': '12年', 'fund_count': 4, 
             'total_scale': '532亿', 'return_3y': '22.3%'},
            {'name': '葛兰', 'experience': '8年', 'fund_count': 3, 
             'total_scale': '425亿', 'return_3y': '18.7%'},
            {'name': '朱少醒', 'experience': '18年', 'fund_count': 2, 
             'total_scale': '312亿', 'return_3y': '25.1%'},
        ]
        return random.choice(managers)


# ==================== 使用示例 ====================

if __name__ == "__main__":
    # 初始化 Mock 数据
    mock = MockFundData()
    
    # 示例1: 获取基金列表
    print("=== Mock 基金列表 ===")
    funds = mock.get_fund_list()
    print(funds)
    
    # 示例2: 获取净值数据
    print("\n=== Mock 净值数据 (110011) ===")
    nav = mock.get_nav_daily('110011')
    print(nav.head())
    
    # 示例3: 获取持仓数据
    print("\n=== Mock 持仓数据 (110011) ===")
    portfolio = mock.get_top_holdings('110011', top_n=5)
    print(portfolio)
    
    # 示例4: 获取业绩数据
    print("\n=== Mock 业绩数据 (110011) ===")
    perf = mock.get_performance('110011')
    print(perf)