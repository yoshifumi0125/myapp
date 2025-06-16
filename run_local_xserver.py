#!/usr/bin/env python3
"""
ローカル環境でXServer DBを使用してアプリケーションを起動
"""
import os
import sys
from pathlib import Path

# プロジェクトのルートディレクトリを取得
project_root = Path(__file__).parent

# .env.local_xserverファイルを読み込む
env_file = project_root / '.env.local_xserver'
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
print("XServer DBを使用したローカル開発環境")
print("=" * 50)
print("\n⚠️  注意: ssh_tunnel.sh を別ターミナルで実行してください")
print("実行コマンド: ./ssh_tunnel.sh")
print("\n" + "=" * 50)

# メインアプリケーションを起動
from main import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    print(f"\nStarting Flask app with XServer DB")
    print(f"Database: {os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}")
    print(f"App URL: http://localhost:{port}")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=debug)