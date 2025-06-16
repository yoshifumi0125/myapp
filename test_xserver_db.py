#!/usr/bin/env python3
"""
XServerデータベース接続テストスクリプト
"""
import os
import sys
import pymysql
from pathlib import Path

# プロジェクトのルートディレクトリを取得
project_root = Path(__file__).parent

# .env.xserverファイルを読み込む
env_file = project_root / '.env.xserver'
if env_file.exists():
    print(f"Loading environment from: {env_file}")
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key] = value
                if key == 'DB_PASSWORD':
                    print(f"Set {key}=***")
                else:
                    print(f"Set {key}={value}")

print("\n" + "=" * 50)
print("XServerデータベース接続テスト")
print("=" * 50)

# 接続情報を表示
print(f"Host: {os.environ.get('DB_HOST')}")
print(f"User: {os.environ.get('DB_USER')}")
print(f"Database: {os.environ.get('DB_NAME')}")
print(f"Port: {os.environ.get('DB_PORT')}")
print("-" * 50)

try:
    # データベースに接続
    connection = pymysql.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        database=os.environ.get('DB_NAME'),
        port=int(os.environ.get('DB_PORT', 3306)),
        charset=os.environ.get('DB_CHARSET', 'utf8mb4')
    )
    
    print("✅ データベース接続成功！")
    
    with connection.cursor() as cursor:
        # MySQLバージョン確認
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"MySQLバージョン: {version[0]}")
        
        # テーブル一覧取得
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"\n既存のテーブル数: {len(tables)}")
        
        if tables:
            print("テーブル一覧:")
            for table in tables:
                print(f"  - {table[0]}")
        else:
            print("  （テーブルがありません）")
        
        # customersテーブルの確認
        if any('customers' in table for table in tables):
            cursor.execute("SELECT COUNT(*) FROM customers")
            count = cursor.fetchone()
            print(f"\ncustomersテーブルのレコード数: {count[0]}")
            
            # カラム情報
            cursor.execute("SHOW COLUMNS FROM customers")
            columns = cursor.fetchall()
            print("\ncustomersテーブルのカラム:")
            for col in columns[:5]:  # 最初の5カラムのみ表示
                print(f"  - {col[0]} ({col[1]})")
            if len(columns) > 5:
                print(f"  ... 他 {len(columns) - 5} カラム")
    
    connection.close()
    print("\n✅ 接続テスト完了")
    
except pymysql.OperationalError as e:
    print(f"\n❌ 接続エラー: {e}")
    print("\n考えられる原因:")
    print("1. XServerの外部からの接続が許可されていない")
    print("2. ホスト名が'localhost'の場合、XServerサーバー内からのみ接続可能")
    print("3. ファイアウォールやネットワーク設定による制限")
    print("\n解決方法:")
    print("- XServerのコントロールパネルで外部接続を許可する")
    print("- またはXServerにSSH接続してサーバー内から実行する")
    
except Exception as e:
    print(f"\n❌ エラー: {e}")
    print(f"エラータイプ: {type(e).__name__}")