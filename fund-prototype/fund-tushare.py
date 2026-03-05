#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金系统原型 - Tushare 真实数据
运行：python3 fund-tushare.py
访问：http://localhost:8000
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

# Tushare Token（需要替换为真实的 Token）
TUSHARE_TOKEN = os.environ.get("TUSHARE_TOKEN", "your_token_here")

# 示例基金代码列表
FUND_CODES = ["000001", "000002", "000003", "110011", "160119"]

# 基金名称映射
FUND_NAMES = {
    "000001": "华夏成长混合",
    "000002": "嘉实增长混合",
    "000003": "易方达蓝筹精选",
    "110011": "易方达中小盘",
    "160119": "南方中证 500ETF",
}

def get_fund_data_tushare(code):
    """使用 Tushare 获取基金数据"""
    try:
        import tushare as ts
        ts.set_token(TUSHARE_TOKEN)
        pro = ts.pro_api()
        
        # 获取基金净值数据
        data = pro.fund_nav(ts_code=code, start_date="20260301", end_date="20260305")
        if data is not None and len(data) > 0:
            latest = data.iloc[-1]
            nav = float(latest.get("nav", 0))
            change = float(latest.get("change", 0))
            return {
                "code": code,
                "nav": nav,
                "estimate": nav,
                "change": f"{change:+.2f}%",
                "name": FUND_NAMES.get(code, f"基金{code}"),
                "type": "混合型" if code.startswith("00") else "指数型"
            }
        return None
    except Exception as e:
        print(f"获取基金{code}数据失败：{e}")
        return None

# Mock 数据（Tushare 需要 Token，先用 Mock 演示）
def get_all_funds():
    """获取所有基金数据"""
    # 如果没有 Tushare Token，使用 Mock 数据
    if TUSHARE_TOKEN == "your_token_here":
        print("⚠️ 使用 Mock 数据（未配置 Tushare Token）")
        return [
            {"code": "000001", "name": "华夏成长混合", "type": "混合型", "nav": 1.523, "estimate": 1.538, "change": "+0.98%"},
            {"code": "000002", "name": "嘉实增长混合", "type": "混合型", "nav": 2.145, "estimate": 2.132, "change": "-0.61%"},
            {"code": "000003", "name": "易方达蓝筹精选", "type": "混合型", "nav": 3.876, "estimate": 3.912, "change": "+0.93%"},
            {"code": "110011", "name": "易方达中小盘", "type": "混合型", "nav": 6.234, "estimate": 6.189, "change": "-0.72%"},
            {"code": "160119", "name": "南方中证 500ETF", "type": "指数型", "nav": 7.123, "estimate": 7.178, "change": "+0.77%"},
        ]
    
    # 使用 Tushare 获取真实数据
    print("使用 Tushare 获取真实数据...")
    funds = []
    for code in FUND_CODES:
        print(f"正在获取 {code}...")
        data = get_fund_data_tushare(code)
        if data:
            funds.append(data)
    return funds

class FundHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/funds":
            print("获取基金数据...")
            funds = get_all_funds()
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"code": 0, "data": funds}, ensure_ascii=False).encode())
        elif self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            token_status = "✅ 已配置" if TUSHARE_TOKEN != "your_token_here" else "❌ 未配置"
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>基金估值系统（Tushare 数据源）</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
        tr:nth-child(even) {{ background-color: #f2f2f2; }}
        .up {{ color: red; }}
        .down {{ color: green; }}
        .refresh-btn {{ background-color: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 10px 0; }}
        .refresh-btn:hover {{ background-color: #45a049; }}
        .loading {{ text-align: center; padding: 20px; color: #666; }}
        .note {{ background-color: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }}
        .token-status {{ font-weight: bold; }}
        .token-ok {{ color: green; }}
        .token-no {{ color: red; }}
    </style>
</head>
<body>
    <h1>📊 基金估值系统（Tushare 数据源）</h1>
    <div class="note">
        <strong>Tushare Token 状态：</strong> <span class="token-status {'token-ok' if TUSHARE_TOKEN != 'your_token_here' else 'token-no'}">{token_status}</span><br>
        <strong>说明：</strong> Tushare 需要申请 Token（免费），访问 https://tushare.pro 注册后获取。
    </div>
    <button class="refresh-btn" onclick="loadData()">🔄 刷新数据</button>
    <div id="loading" class="loading">正在加载数据...</div>
    <table id="fundTable" style="display:none;">
        <thead>
            <tr>
                <th>代码</th>
                <th>名称</th>
                <th>类型</th>
                <th>单位净值</th>
                <th>估值</th>
                <th>涨跌幅</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    <script>
        function loadData() {{
            document.getElementById('loading').style.display = 'block';
            document.getElementById('fundTable').style.display = 'none';
            fetch('/api/funds')
                .then(r => r.json())
                .then(d => {{
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('fundTable').style.display = 'table';
                    const tbody = document.querySelector('#fundTable tbody');
                    tbody.innerHTML = '';
                    d.data.forEach(f => {{
                        const tr = document.createElement('tr');
                        const changeClass = f.change.startsWith('+') ? 'up' : 'down';
                        tr.innerHTML = `
                            <td>${{f.code}}</td>
                            <td>${{f.name}}</td>
                            <td>${{f.type}}</td>
                            <td>¥${{f.nav.toFixed(3)}}</td>
                            <td>¥${{f.estimate.toFixed(3)}}</td>
                            <td class="${{changeClass}}">${{f.change}}</td>
                        `;
                        tbody.appendChild(tr);
                    }});
                }})
                .catch(e => {{
                    document.getElementById('loading').innerText = '加载失败：' + e.message;
                }});
        }}
        loadData();
    </script>
</body>
</html>
            """
            self.wfile.write(html.encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), FundHandler)
    print("✅ 基金系统（Tushare 数据源）已启动！")
    print("📱 访问地址：http://localhost:8000")
    if TUSHARE_TOKEN == "your_token_here":
        print("⚠️ 当前使用 Mock 数据，请配置 TUSHARE_TOKEN 环境变量使用真实数据")
    else:
        print("✅ 已配置 Tushare Token，使用真实数据")
    print("按 Ctrl+C 停止服务")
    server.serve_forever()
