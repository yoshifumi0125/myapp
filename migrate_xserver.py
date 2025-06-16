#!/usr/bin/env python3
"""
XServer環境でマイグレーションを実行するスクリプト
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
    print(f"Warning: {env_file} not found. Please create it from .env.xserver.example")
    sys.exit(1)

# マイグレーションスクリプトを実行
print("\n" + "=" * 50)
print("Starting XServer database migration")
print("=" * 50)

from migrate_saas_extensions import run_migration

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)