#!/usr/bin/env python3
"""
XServer環境でアプリケーションを起動するスクリプト
"""
import os
import sys
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
else:
    print(f"Warning: {env_file} not found. Using default environment variables.")

# メインアプリケーションを起動
from main import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    print(f"\nStarting Flask app for XServer environment")
    print(f"Environment: {os.environ.get('ENVIRONMENT', 'production')}")
    print(f"Database Host: {os.environ.get('DB_HOST', 'not set')}")
    print(f"Port: {port}, Debug: {debug}")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=debug)