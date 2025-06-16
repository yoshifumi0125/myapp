#!/bin/bash
# XServer DBへのSSHトンネルを作成

echo "XServer DBへのSSHトンネルを作成します..."
echo "パスワードを求められたらXServerのSSHパスワードを入力してください"
echo ""
echo "トンネル作成中..."
echo "ローカルポート 3307 → XServer MySQL 3306"
echo ""
echo "接続を終了するには Ctrl+C を押してください"

# SSHトンネルを作成（ローカルの3307ポートをXServerのMySQLに転送）
ssh -N -L 3307:localhost:3306 yoshifumik@sv14067.xserver.jp