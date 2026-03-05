"""
基金系统原型 - FastAPI 后端
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import random

app = FastAPI(
    title="基金系统原型",
    description="简单的基金数据查询 API",
    version="1.0.0"
)

# 跨域支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 数据模型 ============

class Fund(BaseModel):
    code: str
    name: str
    type: str
    manager: str
    company: str
    establish_date: str
    size: float  # 亿元

class FundEstimate(BaseModel):
    code: str
    name: str
    estimate_value: float
    estimate_change: float  # 涨跌幅 %
    update_time: str

class FundNav(BaseModel):
    code: str
    name: str
    nav: float  # 单位净值
    acc_nav: float  # 累计净值
    nav_date: str
    day_change: float  # 日涨跌幅 %


# ============ Mock 数据 ============

MOCK_FUNDS = [
    {"code": "110022", "name": "易方达消费行业股票", "type": "股票型", "manager": "萧楠", "company": "易方达基金", "establish_date": "2010-08-20", "size": 286.54},
    {"code": "000001", "name": "华夏成长混合", "type": "混合型", "manager": "代瑞亮", "company": "华夏基金", "establish_date": "2001-12-18", "size": 45.23},
    {"code": "040008", "name": "华安策略优选混合", "type": "混合型", "manager": "杨明", "company": "华安基金", "establish_date": "2008-05-21", "size": 82.15},
    {"code": "161725", "name": "招商中证白酒指数", "type": "指数型", "manager": "侯昊", "company": "招商基金", "establish_date": "2015-05-27", "size": 432.67},
    {"code": "519772", "name": "交银新成长混合", "type": "混合型", "manager": "王崇", "company": "交银施罗德基金", "establish_date": "2014-05-09", "size": 67.89},
    {"code": "260108", "name": "景顺长城新兴成长混合", "type": "混合型", "manager": "刘彦春", "company": "景顺长城基金", "establish_date": "2006-06-28", "size": 198.32},
    {"code": "005827", "name": "易方达蓝筹精选混合", "type": "混合型", "manager": "张坤", "company": "易方达基金", "establish_date": "2018-09-05", "size": 567.89},
    {"code": "000961", "name": "沪深300指数", "type": "指数型", "manager": "赵栩", "company": "建信基金", "establish_date": "2012-01-12", "size": 156.78},
    {"code": "481001", "name": "工银核心价值混合", "type": "混合型", "manager": "何肖颉", "company": "工银瑞信基金", "establish_date": "2005-08-31", "size": 34.56},
    {"code": "090010", "name": "大成策略回报混合", "type": "混合型", "manager": "徐彦", "company": "大成基金", "establish_date": "2009-03-25", "size": 28.91},
]

# 基金净值历史数据 (模拟)
MOCK_NAV_DATA = {
    "110022": {"nav": 4.5623, "acc_nav": 5.8234, "day_change": 2.35},
    "000001": {"nav": 1.2345, "acc_nav": 3.4567, "day_change": -0.52},
    "040008": {"nav": 2.3456, "acc_nav": 4.5678, "day_change": 1.28},
    "161725": {"nav": 1.8765, "acc_nav": 2.3456, "day_change": 3.45},
    "519772": {"nav": 3.2109, "acc_nav": 4.3210, "day_change": 0.89},
    "260108": {"nav": 2.8765, "acc_nav": 5.4321, "day_change": 1.67},
    "005827": {"nav": 2.1234, "acc_nav": 3.2109, "day_change": 0.45},
    "000961": {"nav": 1.5678, "acc_nav": 2.3456, "day_change": -0.23},
    "481001": {"nav": 0.9876, "acc_nav": 4.5678, "day_change": 0.78},
    "090010": {"nav": 1.8765, "acc_nav": 3.4567, "day_change": 1.12},
}


# ============ Tushare 接入 (可选) ============

def get_tushare_data(code: str, api_type: str):
    """
    接入 Tushare 获取真实数据
    需要设置 TUSHARE_TOKEN 环境变量
    """
    import os
    token = os.getenv("TUSHARE_TOKEN")
    if not token:
        return None
    
    try:
        import tushare as ts
        ts.set_token(token)
        pro = ts.pro_api()
        
        if api_type == "nav":
            # 获取基金净值
            df = pro.fund_nav(ts_code=code, limit=1)
            if not df.empty:
                return {
                    "nav": float(df.iloc[0]['unit_nav']),
                    "acc_nav": float(df.iloc[0]['accum_nav']),
                    "nav_date": str(df.iloc[0]['end_date'])
                }
        elif api_type == "funds":
            # 获取基金列表
            df = pro.fund_basic(market='E')
            return df.head(10).to_dict('records')
    except Exception as e:
        print(f"Tushare API error: {e}")
    
    return None


# ============ API 接口 ============

@app.get("/")
async def root():
    """API 根路径"""
    return {
        "message": "基金系统原型 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/funds", response_model=list[Fund])
async def get_funds():
    """
    获取基金列表
    返回示例 10 只基金的基本信息
    """
    # 尝试从 Tushare 获取真实数据
    real_data = get_tushare_data("", "funds")
    if real_data:
        return real_data
    
    # 使用 Mock 数据
    return [Fund(**fund) for fund in MOCK_FUNDS]


@app.get("/api/funds/{code}/estimate", response_model=FundEstimate)
async def get_fund_estimate(code: str):
    """
    获取基金估值
    基金代码: 6位数字
    """
    # 查找基金
    fund = next((f for f in MOCK_FUNDS if f["code"] == code), None)
    if not fund:
        raise HTTPException(status_code=404, detail=f"基金 {code} 不存在")
    
    # 模拟估值 (实际应从天天基金等接口获取)
    base_nav = MOCK_NAV_DATA.get(code, {"nav": 1.0})["nav"]
    estimate_change = round(random.uniform(-3.0, 3.0), 2)
    estimate_value = round(base_nav * (1 + estimate_change / 100), 4)
    
    return FundEstimate(
        code=code,
        name=fund["name"],
        estimate_value=estimate_value,
        estimate_change=estimate_change,
        update_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


@app.get("/api/funds/{code}/nav", response_model=FundNav)
async def get_fund_nav(code: str):
    """
    获取基金净值
    基金代码: 6位数字
    """
    # 尝试从 Tushare 获取真实数据
    real_data = get_tushare_data(code, "nav")
    
    # 查找基金
    fund = next((f for f in MOCK_FUNDS if f["code"] == code), None)
    if not fund:
        raise HTTPException(status_code=404, detail=f"基金 {code} 不存在")
    
    # 使用 Mock 数据或 Tushare 数据
    nav_data = real_data if real_data else MOCK_NAV_DATA.get(code, {
        "nav": 1.0, 
        "acc_nav": 1.0, 
        "day_change": 0.0
    })
    
    return FundNav(
        code=code,
        name=fund["name"],
        nav=nav_data["nav"],
        acc_nav=nav_data["acc_nav"],
        nav_date=nav_data.get("nav_date", str(date.today())),
        day_change=nav_data.get("day_change", 0.0)
    )


# ============ 启动入口 ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)