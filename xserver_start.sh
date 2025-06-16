#!/bin/bash
# XServer用アプリケーション起動スクリプト

# アプリケーションディレクトリ
APP_DIR="/home/yoshifumik/gta-test1.com/public_html/saas"
LOG_DIR="/home/yoshifumik/logs"
PID_FILE="$APP_DIR/app.pid"

# ログディレクトリ作成
mkdir -p $LOG_DIR

# 既存のプロセスを停止
if [ -f $PID_FILE ]; then
    OLD_PID=$(cat $PID_FILE)
    if ps -p $OLD_PID > /dev/null; then
        echo "Stopping existing process (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
fi

# アプリケーションディレクトリに移動
cd $APP_DIR

# Python環境の確認
echo "Python version:"
python3 --version

# アプリケーション起動（バックグラウンド）
echo "Starting SaaS application..."
nohup python3 run_xserver.py > $LOG_DIR/app.log 2>&1 &

# PIDを保存
echo $! > $PID_FILE
echo "Application started with PID: $(cat $PID_FILE)"
echo "Log file: $LOG_DIR/app.log"