# XServerでのSaaS販売管理システムセットアップガイド

## 1. 環境設定

### 1.1 環境変数ファイルの作成

```bash
# .env.xserver.exampleをコピーして設定ファイルを作成
cp .env.xserver.example .env.xserver

# .env.xserverを編集して、XServerの情報を設定
nano .env.xserver
```

### 1.2 必要な設定項目

```env
# XServerデータベース設定
DB_HOST=mysqlXXXX.xserver.jp    # XServerから提供されるMySQLホスト名
DB_USER=your_username            # MySQLユーザー名
DB_PASSWORD=your_password        # MySQLパスワード
DB_NAME=your_database_name       # データベース名
DB_PORT=3306
DB_CHARSET=utf8mb4

# 環境識別子（変更不要）
ENVIRONMENT=xserver
```

## 2. データベースセットアップ

### 2.1 データベースマイグレーション実行

```bash
# XServer用マイグレーションスクリプトを実行
python migrate_xserver.py
```

このスクリプトは以下のテーブルを作成します：
- `contracts` - 契約管理
- `invoices` - 請求書管理
- `invoice_items` - 請求明細
- `payments` - 支払い履歴
- `recurring_billing` - 定期請求設定
- `contract_history` - 契約変更履歴

### 2.2 マイグレーション確認

マイグレーションが成功すると、以下のようなメッセージが表示されます：

```
✓ Table 'contracts' created successfully
✓ Table 'invoices' created successfully
✓ Table 'invoice_items' created successfully
✓ Table 'payments' created successfully
✓ Table 'recurring_billing' created successfully
✓ Table 'contract_history' created successfully
Migration completed successfully!
```

## 3. アプリケーション起動

### 3.1 ローカルでのテスト起動

```bash
# XServer環境設定でアプリケーションを起動
python run_xserver.py
```

### 3.2 本番環境での起動（XServer上）

XServerにファイルをアップロード後：

```bash
# 依存パッケージのインストール
pip install -r requirements.txt

# アプリケーション起動
python run_xserver.py
```

## 4. 新しいAPI機能

### 4.1 契約管理
- `GET /api/contracts` - 契約一覧取得
- `POST /api/contracts` - 新規契約作成
- `PUT /api/contracts/{id}` - 契約更新

### 4.2 請求書管理
- `GET /api/invoices` - 請求書一覧取得
- `POST /api/invoices` - 請求書作成
- `POST /api/invoices/{id}/send` - 請求書送信

### 4.3 支払い管理
- `GET /api/payments` - 支払い履歴取得
- `POST /api/payments` - 支払い記録

### 4.4 統計情報
- `GET /api/stats/billing` - 請求関連の統計情報
- `POST /api/billing/process-recurring` - 定期請求処理

## 5. トラブルシューティング

### 5.1 データベース接続エラー

エラー: `Access denied for user`
- MySQLユーザー名とパスワードを確認
- XServerコントロールパネルでデータベースアクセス権限を確認

エラー: `Unknown MySQL server host`
- DB_HOSTの値を確認（例: mysql1234.xserver.jp）

### 5.2 文字化け問題

- DB_CHARSETがutf8mb4に設定されていることを確認
- データベースの文字コードがutf8mb4であることを確認

### 5.3 ポート関連

XServerでは通常、ポート8080は使用できません。
適切なポート番号を設定してください。

## 6. セキュリティ注意事項

1. **本番環境では必ずDEBUG=falseに設定**
2. **SECRET_KEYは推測困難な値に変更**
3. **.env.xserverファイルは絶対にGitにコミットしない**
4. **定期的にデータベースのバックアップを取る**

## 7. パフォーマンス最適化

XServer環境では以下の設定を推奨：

```python
# SQLAlchemyの接続プール設定
SQLALCHEMY_POOL_SIZE = 5
SQLALCHEMY_MAX_OVERFLOW = 10
SQLALCHEMY_POOL_TIMEOUT = 30
```

これらの設定により、データベース接続の効率的な管理が可能になります。