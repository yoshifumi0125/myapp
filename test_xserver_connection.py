#!/usr/bin/env python3
"""
Xserver環境での接続テストスクリプト
データベース接続とAPIエンドポイントの動作を確認
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
import pymysql
import requests
import json
from datetime import datetime

def test_database_connection():
    """データベース接続のテスト"""
    print("=== データベース接続テスト ===")
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT,
            charset=Config.DB_CHARSET
        )
        
        with connection.cursor() as cursor:
            # 接続確認
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ データベース接続成功: {result}")
            
            # バージョン確認
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ MySQLバージョン: {version[0]}")
            
            # テーブル確認
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"✅ テーブル数: {len(tables)}")
            for table in tables:
                print(f"   - {table[0]}")
            
            # customersテーブルの確認
            cursor.execute("SELECT COUNT(*) FROM customers")
            count = cursor.fetchone()
            print(f"✅ 顧客レコード数: {count[0]}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ データベース接続エラー: {e}")
        return False

def test_api_endpoints():
    """APIエンドポイントのテスト"""
    print("\n=== APIエンドポイントテスト ===")
    base_url = Config.API_BASE_URL
    
    # ヘルスチェック
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ /api/health: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   - Status: {data.get('status')}")
            print(f"   - Database: {data.get('database')}")
    except Exception as e:
        print(f"❌ ヘルスチェックエラー: {e}")
    
    # 顧客一覧取得
    try:
        response = requests.get(f"{base_url}/api/customers")
        print(f"✅ /api/customers: {response.status_code}")
        if response.status_code == 200:
            customers = response.json()
            print(f"   - 取得件数: {len(customers)}")
    except Exception as e:
        print(f"❌ 顧客一覧取得エラー: {e}")
    
    # 顧客追加テスト
    try:
        test_customer = {
            "name": f"テスト顧客_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "plan": "starter",
            "mrr": 10000,
            "assignee": "テスト担当者"
        }
        response = requests.post(
            f"{base_url}/api/save",
            json=test_customer,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ /api/save: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   - 作成ID: {result.get('id')}")
            print(f"   - メッセージ: {result.get('message')}")
            
            # 作成した顧客を削除
            if result.get('id'):
                del_response = requests.delete(f"{base_url}/api/customers/{result['id']}")
                print(f"✅ DELETE /api/customers/{result['id']}: {del_response.status_code}")
    except Exception as e:
        print(f"❌ 顧客追加テストエラー: {e}")

def test_static_files():
    """静的ファイルの配信テスト"""
    print("\n=== 静的ファイルテスト ===")
    base_url = Config.API_BASE_URL
    
    # メインページ
    try:
        response = requests.get(base_url)
        print(f"✅ / (index.html): {response.status_code}")
        print(f"   - Content-Type: {response.headers.get('content-type')}")
        print(f"   - サイズ: {len(response.content)} bytes")
    except Exception as e:
        print(f"❌ メインページエラー: {e}")

def main():
    """メインテスト実行"""
    print("Xserver環境テストを開始します")
    print(f"環境: {Config.ENVIRONMENT}")
    print(f"APIベースURL: {Config.API_BASE_URL}")
    print(f"データベース: {Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}")
    print("-" * 50)
    
    # 各テストの実行
    db_ok = test_database_connection()
    
    if db_ok:
        test_api_endpoints()
        test_static_files()
    else:
        print("\n⚠️  データベース接続に失敗したため、APIテストをスキップします")
    
    print("\n" + "-" * 50)
    print("テスト完了")

if __name__ == "__main__":
    main()