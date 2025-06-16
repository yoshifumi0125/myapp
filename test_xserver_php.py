#!/usr/bin/env python3
"""
XserverのPHPコードをテストするPythonスクリプト
"""
import subprocess
import os
import sys

def find_php():
    """利用可能なPHPコマンドを探す"""
    php_commands = ['php', 'php7', 'php7.4', 'php8', 'php8.0', 'php8.1', 'php8.2']
    
    for cmd in php_commands:
        try:
            result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                return cmd
        except FileNotFoundError:
            continue
    
    # Homebrewでインストールされている場合
    homebrew_paths = ['/usr/local/bin/php', '/opt/homebrew/bin/php']
    for path in homebrew_paths:
        if os.path.exists(path):
            return path
    
    return None

def main():
    php_cmd = find_php()
    
    if not php_cmd:
        print("❌ PHPが見つかりません")
        print("\nPHPをインストールしてください:")
        print("  macOS: brew install php")
        print("  Ubuntu: sudo apt-get install php")
        print("  CentOS: sudo yum install php")
        sys.exit(1)
    
    print(f"✅ PHPが見つかりました: {php_cmd}")
    
    # テストするPHPファイル
    test_files = [
        'xserver_check_tables.php',
        'xserver_create_tables.php',
        'xserver_db_connection.php'
    ]
    
    for file in test_files:
        if os.path.exists(file):
            print(f"\n📋 {file} を実行中...")
            print("=" * 60)
            
            result = subprocess.run([php_cmd, file], capture_output=True, text=True)
            
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(f"エラー出力:\n{result.stderr}")
            
            print("=" * 60)
        else:
            print(f"⚠️  {file} が見つかりません")

if __name__ == "__main__":
    main()