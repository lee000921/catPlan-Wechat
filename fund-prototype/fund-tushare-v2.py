#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金系统 - Tushare 真实数据 v2
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import tushare as ts
from datetime import datetime, timedelta

# 配置 Token
TUSHARE_TOKEN = "e2c7f8f454f154d8e95c4c0a1c5155b10a8f3ffaa1a0e55feabdd805"
ts.set_token(TUSHARE_TOKEN)
pro = ts.pro_api()

# 基金代码列表（OF 格式）
FUND_CODES = ["000001.OF", "000002.OF", "000003.OF", "110011.OF", "160119.OF"]

# 基金名称映射
FUND_NAMES = {
    "000001.OF": "华夏成长混合",
    "000002.OF": "嘉实增长混合",
    "000003.OF": "易方达蓝筹精选",
    "110011.OF": "易方达中小盘",
    "160119.OF": "南方中证 500ETF",
}

def get_fund_nav(code):
    """获取基金净值数据"""
    try:
        # 获取最近 5 天的净值数据
        end_date = datetime.now().strftime("%Y%m%d")
        start_date = (datetime.now() - timedelta(days=10)).strftime("%Y%m%d")
        
        data = pro.fund_nav(ts_code=code, start_date=start_date, end_date=end_date)
        
        if data is not None and len(data) > 0:
            latest = data.iloc[0]  # 取最新一条
            nav = float(latest.get("adj_nav", 0))  # 复权净值
            
            # 计算涨跌幅
            if len(data) > 1:
                prev_nav = float(data.iloc[1].get("adj_nav", nav))
                change = ((nav - prev_nav) / prev_nav) * 100
            else:
                change = 0
            
            # 去掉.OF 后缀获取原始代码
            short_code = code.replace(".OF", "")
            
            return {
                "code": short_code,
                "nav": round(nav, 3),
                "estimate": round(nav, 3),  # 估值暂时用净值代替
                "change": f"{change:+.2f}%",
                "name": FUND_NAMES.get(code, f"基金{short_code}"),
                "type": "混合型" if short_code.startswith("00") else "指数型",
                "nav_date": latest.get("nav_date", "")
            }
    except Exception as e:
        print(f"获取基金{code}数据失败：{e}")
    return None

def get_all_funds():
    """获取所有基金数据"""
    funds = []
    for code in FUND_CODES:
        print(f"正在获取 {code}...")
        data = get_fund_nav(code)
        if data:
            funds.append(data)
    return funds

class Handler(BaseHTTPRequestHandler):
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
            html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>基金估值系统（Tushare 真实数据）</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .up { color: red; }
        .down { color: green; }
        .refresh-btn { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 10px 0; }
        .refresh-btn:hover { background-color: #45a049; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .note { background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <h1>📊 基金估值系统（Tushare 真实数据）</h1>
    <div class="note">
        <strong>数据源：</strong> Tushare Pro - 每日更新基金净值数据<br>
        <strong>更新时间：</strong> 每个交易日晚上更新
    </div>
    <button class="refresh-btn" onclick="loadData()">🔄 刷新数据</button>
    <div id="loading" class="loading">正在加载真实数据...（首次加载可能需要 10-30 秒）</div>
    <table id="fundTable" style="display:none;">
        <thead>
            <tr>
                <th>代码</th>
                <th>名称</th>
                <th>类型</th>
                <th>单位净值</th>
                <th>估值</th>
                <th>涨跌幅</th>
                <th>净值日期</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    <script>
        function loadData() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('fundTable').style.display = 'none';
            fetch('/api/funds')
                .then(r => r.json())
                .then(d => {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('fundTable').style.display = 'table';
                    const tbody = document.querySelector('#fundTable tbody');
                    tbody.innerHTML = '';
                    d.data.forEach(f => {
                        const tr = document.createElement('tr');
                        const changeClass = f.change.startsWith('+') ? 'up' : 'down';
                        tr.innerHTML = `
                            <td>${f.code}</td>
                            <td>${f.name}</td>
                            <td>${f.type}</td>
                            <td>¥${f.nav.toFixed(3)}</td>
                            <td>¥${f.estimate.toFixed(3)}</td>
                            <td class="${changeClass}">${f.change}</td>
                            <td>${f.nav_date || '-'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                })
                .catch(e => {
                    document.getElementById('loading').innerText = '加载失败：' + e.message;
                });
        }
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
    server = HTTPServer(("0.0.0.0", 8000), Handler)
    print("✅ 基金系统（Tushare 真实数据 v2）已启动！")
    print("📱 访问地址：http://localhost:8000")
    print("📊 数据源：Tushare Pro")
    print("按 Ctrl+C 停止服务")
    server.serve_forever()
