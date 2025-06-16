#!/usr/bin/env python3
"""SSHトンネル経由のDB接続テスト"""
import pymysql

print("SSHトンネル経由でXServer DBに接続テスト")
print("=" * 50)

# トンネル経由の接続情報
config = {
    'host': '127.0.0.1',  # localhost
    'port': 3307,         # トンネルのローカルポート
    'user': 'yoshifumik_1lt67',
    'password': 'yoshi2003',
    'database': 'yoshifumik_sass1',
    'charset': 'utf8mb4'
}

print(f"接続先: {config['host']}:{config['port']}")
print(f"データベース: {config['database']}")

try:
    conn = pymysql.connect(**config)
    print("\n✅ 接続成功！")
    
    with conn.cursor() as cursor:
        # テーブル確認
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"\nテーブル数: {len(tables)}")
        for table in tables:
            print(f"  - {table[0]}")
            
        # customersテーブルの確認
        if any('customers' in t for t in tables):
            cursor.execute("SELECT COUNT(*) FROM customers")
            count = cursor.fetchone()
            print(f"\ncustomersレコード数: {count[0]}")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ 接続失敗: {e}")
    print("\n対処法:")
    print("1. ssh_tunnel.sh が実行中か確認")
    print("2. XServerのSSHパスワードが正しいか確認")
    print("3. ポート3307が使用されていないか確認")