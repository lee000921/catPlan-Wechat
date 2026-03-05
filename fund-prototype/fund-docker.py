#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金系统 - AkShare 真实数据（Docker 版）
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import akshare as ak

FUND_CODES = ["000001", "000002", "000003", "110011", "160119"]
FUND_NAMES = {
    "000001": "华夏成长混合",
    "000002": "嘉实增长混合",
    "000003": "易方达蓝筹精选",
    "110011": "易方达中小盘",
    "160119": "南方中证 500ETF",
}

def get_fund_data(code):
    """获取基金净值数据"""
    try:
        data = ak.fund_open_fund_info_em(fund=code, indicator="单位净值走势")
        if data is not None and len(data) > 0:
            latest = data.iloc[-1]
            nav = float(latest.get("单位净值", 0))
            if len(data) > 1:
                prev_nav = float(data.iloc[-2].get("单位净值", nav))
                change = ((nav - prev_nav) / prev_nav) * 100
            else:
                change = 0
            return {
                "code": code,
                "nav": nav,
                "estimate": nav,
                "change": f"{change:+.2f}%",
                "name": FUND_NAMES.get(code, f"基金{code}"),
                "type": "混合型" if code.startswith("00") else "指数型"
            }
    except Exception as e:
        print(f"获取基金{code}数据失败：{e}")
    return None

def get_all_funds():
    """获取所有基金数据"""
    funds = []
    for code in FUND_CODES:
        print(f"正在获取 {code}...")
        data = get_fund_data(code)
        if data:
            funds.append(data)
    return funds

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/funds":
            funds = get_all_funds()
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"code": 0, "data": funds}, ensure_ascii=False).encode())
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, format, *args): pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), Handler)
    print("✅ 基金系统（AkShare Docker 版）已启动！")
    print("📱 访问地址：http://localhost:8000")
    server.serve_forever()
