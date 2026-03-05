#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金系统原型 - 最简化版本（纯 Mock 数据）
直接运行：python3 simple-app.py
访问：http://localhost:8000
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json

# Mock 基金数据
FUNDS = [
    {"code": "000001", "name": "华夏成长混合", "type": "混合型", "nav": 1.523, "estimate": 1.538, "change": "+0.98%"},
    {"code": "000002", "name": "嘉实增长混合", "type": "混合型", "nav": 2.145, "estimate": 2.132, "change": "-0.61%"},
    {"code": "000003", "name": "易方达蓝筹精选", "type": "混合型", "nav": 3.876, "estimate": 3.912, "change": "+0.93%"},
    {"code": "000004", "name": "富国天惠成长", "type": "混合型", "nav": 4.234, "estimate": 4.198, "change": "-0.85%"},
    {"code": "000005", "name": "汇添富消费行业", "type": "混合型", "nav": 5.678, "estimate": 5.723, "change": "+0.79%"},
    {"code": "110011", "name": "易方达中小盘", "type": "混合型", "nav": 6.234, "estimate": 6.189, "change": "-0.72%"},
    {"code": "160119", "name": "南方中证 500ETF", "type": "指数型", "nav": 7.123, "estimate": 7.178, "change": "+0.77%"},
    {"code": "160211", "name": "国泰中小盘成长", "type": "混合型", "nav": 3.456, "estimate": 3.489, "change": "+0.95%"},
    {"code": "162605", "name": "景顺长城鼎益", "type": "混合型", "nav": 2.789, "estimate": 2.756, "change": "-1.18%"},
    {"code": "519300", "name": "大成沪深 300", "type": "指数型", "nav": 1.234, "estimate": 1.245, "change": "+0.89%"},
]

class FundHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/funds":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"code": 0, "data": FUNDS}, ensure_ascii=False).encode())
        elif self.path.startswith("/api/funds/") and self.path.endswith("/estimate"):
            code = self.path.split("/")[2]
            fund = next((f for f in FUNDS if f["code"] == code), None)
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            result = {"code": 0, "data": fund} if fund else {"code": 404, "msg": "基金不存在"}
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode())
        elif self.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>基金估值系统</title>
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
    </style>
</head>
<body>
    <h1>📊 基金估值系统（原型版）</h1>
    <button class="refresh-btn" onclick="loadData()">🔄 刷新数据</button>
    <table id="fundTable">
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
        function loadData() {
            fetch('/api/funds')
                .then(r => r.json())
                .then(d => {
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
                        `;
                        tbody.appendChild(tr);
                    });
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
        pass  # 不打印日志

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), FundHandler)
    print("✅ 基金系统原型已启动！")
    print("📱 访问地址：http://localhost:8000")
    print("📊 API 文档：http://localhost:8000/api/funds")
    print("按 Ctrl+C 停止服务")
    server.serve_forever()
