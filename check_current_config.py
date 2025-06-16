#!/usr/bin/env python3
"""
現在のデータベース設定を確認するスクリプト
"""
import os
import sys
from dotenv import load_dotenv

print("=" * 60)
print("現在のデータベース設定確認")
print("=" * 60)
print()

# 環境変数ファイルの確認
env_files = ['.env', '.env.xserver', '.env.local_xserver']

for env_file in env_files:
    if os.path.exists(env_file):
        print(f"📋 {env_file} の内容:")
        load_dotenv(env_file, override=True)
        
        # 重要な設定を表示
        configs = {
            'ENVIRONMENT': os.getenv('ENVIRONMENT', 'Not set'),
            'DB_HOST': os.getenv('DB_HOST', 'Not set'),
            'DB_USER': os.getenv('DB_USER', 'Not set'),
            'DB_NAME': os.getenv('DB_NAME', 'Not set'),
            'API_BASE_URL': os.getenv('API_BASE_URL', 'Not set')
        }
        
        for key, value in configs.items():
            print(f"  {key}: {value}")
        print()

# 現在の環境変数
print("🔍 現在の環境変数:")
print(f"  ENVIRONMENT: {os.getenv('ENVIRONMENT', 'Not set')}")
print(f"  GAE_ENV: {os.getenv('GAE_ENV', 'Not set')}")
print()

# 推奨事項
print("=" * 60)
print("📌 Xserverでデータを保存するための設定")
print("=" * 60)
print()
print("1. アプリケーションの起動方法:")
print("   python3 run_xserver.py")
print()
print("2. または環境変数を設定して起動:")
print("   export ENVIRONMENT=xserver")
print("   python3 main_xserver.py")
print()
print("3. Xserverにデプロイする場合:")
print("   - main_xserver.py をアップロード")
print("   - .env.xserver を .env にリネーム")
print("   - 静的ファイルも一緒にアップロード")