#!/bin/bash

# Cloud SQL Proxy のインストールと設定

echo "Cloud SQL Proxy をセットアップします..."

# 1. Cloud SQL Proxy のダウンロード
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.darwin.amd64
else
    # Linux
    curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.linux.amd64
fi

# 実行権限を付与
chmod +x cloud-sql-proxy

# 2. 認証設定
echo "Google Cloud の認証を行ってください："
gcloud auth application-default login

# 3. Cloud SQL インスタンス接続名を設定
# 形式: PROJECT_ID:REGION:INSTANCE_NAME
read -p "Cloud SQL インスタンス接続名を入力してください (例: my-project:asia-northeast1:my-instance): " INSTANCE_CONNECTION_NAME

# 4. Proxy を起動
echo "Cloud SQL Proxy を起動します..."
./cloud-sql-proxy --port 3306 $INSTANCE_CONNECTION_NAME &

echo "Cloud SQL Proxy が起動しました。"
echo "ローカルの localhost:3306 経由で Cloud SQL に接続できます。"