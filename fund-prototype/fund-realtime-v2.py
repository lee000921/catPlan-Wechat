#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金系统 - 实时数据（天天基金接口）
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import requests
import re

# 基金代码列表
FUND_CODES = ["000001", "000002", "000003", "110011", "160119"]

def get_fund_realtime(code):
    """获取基金实时数据（天天基金接口）"""
    try:
        url = "https://fundgz.1234567.com.cn/js/" + code + ".js"
        headers = {
            "Referer": "https://fund.eastmoney.com/" + code + ".html",
            "User-Agent": "Mozilla/5.0"
        }
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            # 解析 jsonpgz 格式
            text = response.text
            match = re.search(r'jsonpgz\((.+)\)', text)
            if match:
                data = json.loads(match.group(1))
                return {
                    "code": data.get("fundcode", code),
                    "name": data.get("name", ""),
                    "nav": float(data.get("dwjz", 0)),
                    "estimate": float(data.get("gsz", 0)),
                    "change": "+" + data.get("gszzl", "0") + "%" if float(data.get("gszzl", 0)) > 0 else data.get("gszzl", "0") + "%",
                    "nav_date": data.get("jzrq", ""),
                    "update_time": data.get("gztime", "")
                }
    except Exception as e:
        print("获取基金" + code + "数据失败：" + str(e))
    return None

def get_all_funds():
    """获取所有基金数据"""
    funds = []
    for code in FUND_CODES:
        print("正在获取 " + code + "...")
        data = get_fund_realtime(code)
        if data:
            # 判断基金类型
            data["type"] = "混合型" if code.startswith("00") else "指数型"
            funds.append(data)
    return funds

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/funds":
            print("获取基金实时数据...")
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
    <title>基金估值系统（实时数据）</title>
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
        .note { background-color: #e3f2fd; padding: 10px; margin: 10px 0; border-left: 4px solid #2196f3; }
        .time { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <h1>📊 基金估值系统（实时数据）</h1>
    <div class="note">
        <strong>数据源：</strong> 天天基金网 - 实时估值数据<br>
        <strong>更新频率：</strong> 交易时间内每 15 秒更新<br>
        <strong>交易时间：</strong> 工作日 9:30-11:30, 13:00-15:00
    </div>
    <button class="refresh-btn" onclick="loadData()">🔄 刷新数据</button>
    <div id="loading" class="loading">正在加载实时数据...</div>
    <table id="fundTable" style="display:none;">
        <thead>
            <tr>
                <th>代码</th>
                <th>名称</th>
                <th>类型</th>
                <th>单位净值</th>
                <th>实时估值</th>
                <th>涨跌幅</th>
                <th>更新时间</th>
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
                            <td>¥${f.nav.toFixed(4)}</td>
                            <td>¥${f.estimate.toFixed(4)}</td>
                            <td class="${changeClass}">${f.change}</td>
                            <td class="time">${f.update_time || '-'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                })
                .catch(e => {
                    document.getElementById('loading').innerText = '加载失败：' + e.message;
                });
        }
        loadData();
        // 交易时间内自动刷新
        setInterval(loadData, 30000);
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
    print("✅ 基金系统（实时数据）已启动！")
    print("📱 访问地址：http://localhost:8000")
    print("📊 数据源：天天基金网实时估值")
    print("⏰ 交易时间：工作日 9:30-11:30, 13:00-15:00")
    print("按 Ctrl+C 停止服务")
    server.serve_forever()
