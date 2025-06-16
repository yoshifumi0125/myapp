#!/usr/bin/env python
# -*- coding: utf-8 -*-

print("Content-Type: text/html; charset=utf-8")
print()
print("""
<!DOCTYPE html>
<html>
<head>
    <title>SaaS販売管理システム</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>SaaS販売管理システム</h1>
    <div class="status">
        <p class="success">✅ Python CGIが動作しています</p>
""")

import sys
print(f"<p>Python Version: {sys.version}</p>")

try:
    import flask
    print("<p class='success'>✅ Flask is installed</p>")
except:
    print("<p class='error'>❌ Flask is not installed</p>")

try:
    import pymysql
    print("<p class='success'>✅ PyMySQL is installed</p>")
except:
    print("<p class='error'>❌ PyMySQL is not installed</p>")

print("""
    </div>
    <p><a href="/">トップページに戻る</a></p>
</body>
</html>
""")