#!/bin/bash
# XServer環境チェックスクリプト

echo "=== XServer環境チェック ==="
echo ""

echo "1. Pythonバージョン確認:"
python --version 2>/dev/null || echo "python not found"
python3 --version 2>/dev/null || echo "python3 not found"

echo ""
echo "2. Pythonパス確認:"
which python 2>/dev/null || echo "python not in PATH"
which python3 2>/dev/null || echo "python3 not in PATH"

echo ""
echo "3. インストール済みパッケージ:"
pip list --user 2>/dev/null | grep -E "flask|pymysql|sqlalchemy" || echo "pip not found"

echo ""
echo "4. 現在のディレクトリ:"
pwd

echo ""
echo "5. ファイル確認:"
ls -la

echo ""
echo "6. .htaccess確認:"
if [ -f .htaccess ]; then
    echo ".htaccess exists"
    cat .htaccess
else
    echo ".htaccess not found"
fi

echo ""
echo "7. ログファイル確認:"
if [ -f /home/yoshifumik/logs/app.log ]; then
    echo "最後の10行:"
    tail -10 /home/yoshifumik/logs/app.log
else
    echo "ログファイルが見つかりません"
fi