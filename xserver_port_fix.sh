#!/bin/bash
# XServerのポート変更スクリプト

# .env.xserverにポート設定を追加
echo "" >> .env.xserver
echo "# ポート設定" >> .env.xserver
echo "PORT=5000" >> .env.xserver

echo "ポートを5000に変更しました"