# App Engine デプロイ手順

## 前提条件
1. Cloud SQL Admin API を有効化
   ```
   gcloud services enable sqladmin.googleapis.com
   ```

2. Cloud SQL インスタンスの接続名を確認
   ```
   gcloud sql instances list
   ```

## デプロイ手順

### 1. ビルド（フロントエンド）
```bash
npm run build
```

### 2. App Engine にデプロイ
```bash
gcloud app deploy
```

### 3. 環境変数の設定（必要な場合）
```bash
gcloud app update --env-vars CLOUD_SQL_CONNECTION_NAME=PROJECT_ID:REGION:INSTANCE_NAME
```

## トラブルシューティング

### データベース接続エラーの場合

1. **Cloud SQL インスタンスの場所を確認**
   - IPアドレス: 35.232.151.129
   - リージョンを確認して、接続名を正しく設定

2. **App Engine のデフォルトサービスアカウントに権限を付与**
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/cloudsql.client"
   ```

3. **ログを確認**
   ```bash
   gcloud app logs read --service=default
   ```

### ヘルスチェック
```bash
curl https://total-handler-244211.de.r.appspot.com/health
```