#!/bin/bash
# XServerテスト接続スクリプト

echo "====================================="
echo "XServer接続テスト"
echo "====================================="
echo ""

# 1. ローカルからのデータベース接続テスト
echo "1. ローカルからのDB接続テスト..."
python3 test_xserver_db.py

echo ""
echo "====================================="
echo ""

# 2. SSH接続テスト
echo "2. SSH接続テスト..."
ssh -o ConnectTimeout=5 yoshifumik@sv14067.xserver.jp 'echo "✅ SSH接続成功！" && hostname && pwd'

echo ""
echo "====================================="
echo ""

# 3. ファイル存在確認
echo "3. リモートファイル確認..."
ssh yoshifumik@sv14067.xserver.jp 'cd /home/yoshifumik/gta-test1.com/public_html/saas && ls -la | head -10'

echo ""
echo "====================================="
echo ""

# 4. Pythonバージョン確認
echo "4. XServerのPython環境確認..."
ssh yoshifumik@sv14067.xserver.jp 'which python3 && python3 --version'

echo ""
echo "====================================="
echo "テスト完了"