#!/bin/bash
echo "XServerでデータベース接続を確認中..."
echo "================================"
ssh yoshifumik@sv14067.xserver.jp 'cd ~/public_html && php db_test_correct.php'