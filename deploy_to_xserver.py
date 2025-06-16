#!/usr/bin/env python3
"""
XServerへのデプロイスクリプト
"""
import os
import sys
import subprocess
from pathlib import Path

# デプロイ設定
XSERVER_HOST = "sv14067.xserver.jp"     # XServerのホスト名
XSERVER_USER = "yoshifumik"              # SSHユーザー名
REMOTE_PATH = "/home/yoshifumik/yoshifumik.xsrv.jp/public_html/saas"  # リモートのアプリケーションパス

# アップロードするファイル
FILES_TO_UPLOAD = [
    "main.py",
    "models.py", 
    "api_extensions.py",
    "requirements.txt",
    "migrate_saas_extensions.py",
    "migrate_xserver.py",
    "run_xserver.py",
    ".env.xserver",
    "migrations/add_saas_tables.sql",
    "xserver_start.sh",
    "xserver_htaccess",
    "dist/",  # フロントエンドファイル
]

def main():
    """デプロイ実行"""
    print("XServerへのデプロイを開始します")
    print(f"接続先: {XSERVER_USER}@{XSERVER_HOST}")
    print(f"デプロイ先: {REMOTE_PATH}")
    
    # ディレクトリ作成
    print("\n1. リモートディレクトリを作成...")
    cmd = f"ssh {XSERVER_USER}@{XSERVER_HOST} 'mkdir -p {REMOTE_PATH}/migrations'"
    subprocess.run(cmd, shell=True)
    
    # ファイルアップロード
    print("\n2. ファイルをアップロード...")
    for file in FILES_TO_UPLOAD:
        if os.path.exists(file):
            print(f"  - {file}")
            if os.path.isdir(file):
                cmd = f"rsync -avz {file} {XSERVER_USER}@{XSERVER_HOST}:{REMOTE_PATH}/"
            else:
                cmd = f"scp {file} {XSERVER_USER}@{XSERVER_HOST}:{REMOTE_PATH}/"
                if "/" in file:  # サブディレクトリのファイル
                    remote_file = f"{REMOTE_PATH}/{file}"
                    cmd = f"scp {file} {XSERVER_USER}@{XSERVER_HOST}:{remote_file}"
            subprocess.run(cmd, shell=True)
    
    # リモートでセットアップコマンドを実行
    print("\n3. リモートセットアップを実行...")
    setup_commands = [
        f"cd {REMOTE_PATH}",
        "pip install --user -r requirements.txt",
        "python migrate_xserver.py",
        "echo 'デプロイ完了！'"
    ]
    
    cmd = f"ssh {XSERVER_USER}@{XSERVER_HOST} '{' && '.join(setup_commands)}'"
    subprocess.run(cmd, shell=True)
    
    print("\n✅ デプロイが完了しました！")
    print(f"\n実行方法:")
    print(f"ssh {XSERVER_USER}@{XSERVER_HOST}")
    print(f"cd {REMOTE_PATH}")
    print(f"python run_xserver.py")

if __name__ == "__main__":
    # 設定確認
    print("デプロイ前に以下の設定を確認してください:")
    print(f"- XSERVER_HOST: {XSERVER_HOST}")
    print(f"- XSERVER_USER: {XSERVER_USER}")
    print(f"- REMOTE_PATH: {REMOTE_PATH}")
    
    response = input("\n続行しますか？ (y/n): ")
    if response.lower() == 'y':
        main()
    else:
        print("デプロイをキャンセルしました")