#!/usr/bin/env python3
"""
XServerへの自動デプロイスクリプト
"""
import os
import sys
import subprocess
from pathlib import Path

# デプロイ設定
XSERVER_HOST = "sv14067.xserver.jp"
XSERVER_USER = "yoshifumik"
REMOTE_PATH = "/home/yoshifumik/gta-test1.com/public_html/saas"

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
    "dist/",
]

def run_command(cmd):
    """コマンドを実行して結果を表示"""
    print(f"実行: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(f"エラー: {result.stderr}")
    return result.returncode == 0

def main():
    """デプロイ実行"""
    print("=" * 60)
    print("XServerへの自動デプロイを開始します")
    print(f"接続先: {XSERVER_USER}@{XSERVER_HOST}")
    print(f"デプロイ先: {REMOTE_PATH}")
    print("=" * 60)
    
    # ディレクトリ作成
    print("\n1. リモートディレクトリを作成...")
    cmd = f"ssh {XSERVER_USER}@{XSERVER_HOST} 'mkdir -p {REMOTE_PATH}/migrations'"
    if not run_command(cmd):
        print("⚠️  ディレクトリ作成に失敗しました（既に存在する可能性があります）")
    
    # ファイルアップロード
    print("\n2. ファイルをアップロード...")
    success_count = 0
    fail_count = 0
    
    for file in FILES_TO_UPLOAD:
        if os.path.exists(file):
            print(f"\n  アップロード: {file}")
            if os.path.isdir(file):
                cmd = f"rsync -avz {file} {XSERVER_USER}@{XSERVER_HOST}:{REMOTE_PATH}/"
            else:
                if "/" in file:  # サブディレクトリのファイル
                    remote_file = f"{REMOTE_PATH}/{file}"
                    cmd = f"scp {file} {XSERVER_USER}@{XSERVER_HOST}:{remote_file}"
                else:
                    cmd = f"scp {file} {XSERVER_USER}@{XSERVER_HOST}:{REMOTE_PATH}/"
            
            if run_command(cmd):
                success_count += 1
                print(f"  ✅ 成功: {file}")
            else:
                fail_count += 1
                print(f"  ❌ 失敗: {file}")
        else:
            print(f"  ⚠️  ファイルが見つかりません: {file}")
            fail_count += 1
    
    print(f"\n📊 アップロード結果: 成功 {success_count}, 失敗 {fail_count}")
    
    # .htaccessファイルをコピー
    print("\n3. .htaccessファイルを設定...")
    cmd = f"ssh {XSERVER_USER}@{XSERVER_HOST} 'cd {REMOTE_PATH} && cp xserver_htaccess .htaccess'"
    run_command(cmd)
    
    # 実行権限を設定
    print("\n4. スクリプトに実行権限を設定...")
    scripts = ["migrate_xserver.py", "run_xserver.py", "xserver_start.sh"]
    for script in scripts:
        cmd = f"ssh {XSERVER_USER}@{XSERVER_HOST} 'chmod +x {REMOTE_PATH}/{script}'"
        run_command(cmd)
    
    print("\n" + "=" * 60)
    print("✅ デプロイが完了しました！")
    print("\n次のステップ:")
    print(f"1. SSH接続: ssh {XSERVER_USER}@{XSERVER_HOST}")
    print(f"2. ディレクトリ移動: cd {REMOTE_PATH}")
    print("3. 依存パッケージインストール: pip3 install --user -r requirements.txt")
    print("4. マイグレーション実行: python3 migrate_xserver.py")
    print("5. アプリケーション起動: bash xserver_start.sh")
    print("\nブラウザでアクセス: https://gta-test1.com/saas/")
    print("=" * 60)

if __name__ == "__main__":
    # SSH接続テスト
    print("SSH接続をテストしています...")
    test_cmd = f"ssh -o ConnectTimeout=5 {XSERVER_USER}@{XSERVER_HOST} 'echo SSH接続成功'"
    if run_command(test_cmd):
        main()
    else:
        print("\n❌ SSH接続に失敗しました。")
        print("以下を確認してください:")
        print("1. SSHキーが設定されているか")
        print("2. XServerのSSH接続が有効になっているか")
        print("3. サーバー名とユーザー名が正しいか")
        sys.exit(1)