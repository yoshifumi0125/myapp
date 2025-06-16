#!/usr/bin/env python3
"""簡単なDB接続テスト"""
import os
import pymysql

# 環境変数から接続情報を取得
host = os.environ.get('DB_HOST', 'localhost')
user = os.environ.get('DB_USER', 'yoshifumik_1lt67')
password = os.environ.get('DB_PASSWORD', 'yoshi2003')
database = os.environ.get('DB_NAME', 'yoshifumik_sass1')

print(f"接続先: {user}@{host}/{database}")

try:
    # ローカルから接続（失敗することが予想される）
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=3306
    )
    print("✅ 接続成功！")
    conn.close()
except Exception as e:
    print(f"❌ 接続失敗: {e}")
    print("\n💡 XServerのデータベースは外部接続が制限されています。")
    print("   XServerにSSH接続してから実行してください。")