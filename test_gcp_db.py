#!/usr/bin/env python3
"""Google Cloud SQL接続テスト"""
import pymysql

# Google Cloud SQL接続情報
host = '35.232.151.129'
user = 'saas1'
password = 'yoshi2003'
database = 'saas1'

print(f"Google Cloud SQL接続テスト")
print(f"接続先: {user}@{host}/{database}")

try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=3306
    )
    print("✅ 接続成功！")
    
    with conn.cursor() as cursor:
        # テーブル確認
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"\nテーブル数: {len(tables)}")
        for table in tables:
            print(f"  - {table[0]}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ 接続失敗: {e}")