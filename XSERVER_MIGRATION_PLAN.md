# Google Cloud から Xserver への移行計画

## 現状分析サマリー

### 1. 現在のアーキテクチャ
- **フロントエンド**: React + TypeScript (Viteビルド)
- **バックエンド**: Flask (Python 3.11)
- **データベース**: Google Cloud SQL (MySQL 8.0.40)
- **ホスティング**: Google App Engine Standard
- **接続方式**: Unix Socket (App Engine) / TCP (ローカル)

### 2. Google Cloud 固有の設定

#### A. データベース接続
```python
# App Engine環境での接続
if os.environ.get('GAE_ENV') == 'standard':
    db_socket_dir = "/cloudsql"
    cloud_sql_connection_name = "total-handler-244211:us-central1:saas"
    # Unix socketを使用
```

#### B. 環境変数 (app.yaml)
- `GAE_ENV`: 'standard'
- `CLOUD_SQL_CONNECTION_NAME`: 'total-handler-244211:us-central1:saas'
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`

#### C. App Engine固有の設定
- `runtime: python311`
- 静的ファイルハンドラー
- 接続プール無効化 (NullPool)

#### D. ハードコードされたURL
- `https://total-handler-244211.de.r.appspot.com/save` (index.tsx内)

## 移行が必要なファイル

### 1. 必須変更ファイル
- `main.py` - データベース接続ロジックの変更
- `index.tsx` - API URLの変更
- `app.yaml` - 削除（Xserverでは不要）
- `requirements.txt` - gunicornの削除、必要に応じて追加

### 2. 新規作成ファイル
- `.htaccess` - Apache設定
- `config.py` - 環境設定の外部化
- `.env` - 環境変数管理
- `deploy.sh` - デプロイスクリプト

### 3. オプション変更ファイル
- `vite.config.ts` - ビルド設定の調整
- `package.json` - デプロイスクリプトの追加

## Xserver用推奨設定

### 1. データベース接続設定
```python
# Xserver用の設定例
DATABASE_CONFIG = {
    'host': 'localhost',  # または指定されたMySQLホスト
    'user': 'your_xserver_db_user',
    'password': 'your_xserver_db_password',
    'database': 'your_xserver_db_name',
    'port': 3306,
    'charset': 'utf8mb4'
}

# SQLAlchemy接続文字列
DATABASE_URI = f"mysql+pymysql://{DATABASE_CONFIG['user']}:{DATABASE_CONFIG['password']}@{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}/{DATABASE_CONFIG['database']}?charset={DATABASE_CONFIG['charset']}"
```

### 2. 環境変数管理 (.env)
```
# Xserver環境設定
ENVIRONMENT=production
DEBUG=false

# データベース設定
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306

# アプリケーション設定
SECRET_KEY=your_secret_key
API_BASE_URL=https://your-domain.com
```

### 3. Apache設定 (.htaccess)
```apache
# Python CGI設定
Options +ExecCGI
AddHandler cgi-script .py

# 静的ファイルの処理
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /cgi-bin/main.py/$1 [QSA,L]

# フロントエンドのSPA対応
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(?!api/).*$ /index.html [L]

# セキュリティヘッダー
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
```

## 詳細移行手順

### フェーズ1: 準備作業（ローカル環境）

1. **環境設定の外部化**
   ```bash
   # config.pyの作成
   touch config.py
   # .envファイルの作成
   touch .env
   # .gitignoreに.envを追加
   echo ".env" >> .gitignore
   ```

2. **データベース接続コードの修正**
   - 環境変数からの読み込みに変更
   - Unix Socket接続の削除
   - TCP接続のみに統一

3. **フロントエンドAPIエンドポイントの環境変数化**
   - Viteの環境変数設定
   - ビルド時の環境変数注入

### フェーズ2: Xserver環境準備

1. **データベース作成**
   - MySQLデータベースの作成
   - ユーザー権限の設定
   - 文字コードをutf8mb4に設定

2. **データ移行**
   ```bash
   # Google Cloud SQLからデータをエクスポート
   mysqldump -h 35.232.151.129 -u saas1 -p saas1 > backup.sql
   
   # Xserverのデータベースにインポート
   mysql -h localhost -u xserver_user -p xserver_db < backup.sql
   ```

3. **ディレクトリ構造の準備**
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-*.js
   │   └── index-*.css
   ├── cgi-bin/
   │   ├── main.py (実行権限付与)
   │   └── requirements.txt
   └── .htaccess
   ```

### フェーズ3: アプリケーションのデプロイ

1. **Pythonパッケージのインストール**
   ```bash
   # SSH接続後
   cd ~/public_html/cgi-bin
   pip install --user -r requirements.txt
   ```

2. **ファイルのアップロード**
   - FTP/SFTPでファイルを転送
   - 実行権限の設定: `chmod 755 main.py`

3. **環境変数の設定**
   - .envファイルをcgi-binディレクトリに配置
   - 適切な権限設定: `chmod 600 .env`

### フェーズ4: テストと検証

1. **接続テスト**
   - `/health`エンドポイントの確認
   - データベース接続の検証

2. **機能テスト**
   - 顧客データの取得 (GET /customers)
   - 新規顧客の追加 (POST /save)
   - 顧客の削除 (DELETE /customers/{id})

3. **フロントエンドテスト**
   - ページの表示確認
   - APIとの通信確認
   - データの永続化確認

### フェーズ5: 最終調整

1. **パフォーマンスチューニング**
   - キャッシュヘッダーの設定
   - 静的ファイルの最適化

2. **セキュリティ強化**
   - HTTPS設定
   - CSRFトークンの実装
   - 環境変数の暗号化

3. **監視設定**
   - エラーログの設定
   - アクセスログの確認方法

## テスト方法

### 1. ユニットテスト
```python
# test_xserver_connection.py
import unittest
from main import app, engine

class TestXserverConnection(unittest.TestCase):
    def test_database_connection(self):
        self.assertIsNotNone(engine)
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            self.assertEqual(result.scalar(), 1)
    
    def test_api_endpoints(self):
        with app.test_client() as client:
            response = client.get('/health')
            self.assertEqual(response.status_code, 200)
```

### 2. 統合テスト
- 全APIエンドポイントの動作確認
- データの作成・読取・更新・削除
- フロントエンドとの連携

### 3. 負荷テスト
```bash
# Apache Benchを使用
ab -n 100 -c 10 https://your-domain.com/api/customers
```

## 移行後の注意点

1. **バックアップ**
   - 定期的なデータベースバックアップ
   - ファイルのバージョン管理

2. **監視**
   - エラーログの定期確認
   - パフォーマンスモニタリング

3. **更新手順**
   - Blue-Greenデプロイメントの検討
   - ロールバック手順の確立

## 推定移行スケジュール

| フェーズ | 作業内容 | 推定時間 |
|---------|---------|----------|
| 準備作業 | コード修正、環境設定 | 4-6時間 |
| 環境準備 | Xserver設定、DB作成 | 2-3時間 |
| データ移行 | バックアップ、リストア | 1-2時間 |
| デプロイ | ファイル転送、設定 | 2-3時間 |
| テスト | 動作確認、調整 | 3-4時間 |
| **合計** | | **12-18時間** |

## リスクと対策

1. **データベース接続エラー**
   - 対策: 接続情報の事前確認、テスト環境での検証

2. **Pythonバージョンの互換性**
   - 対策: Xserverのバージョン確認、必要に応じてコード調整

3. **パフォーマンス低下**
   - 対策: キャッシュ実装、クエリ最適化

4. **セキュリティリスク**
   - 対策: 環境変数の適切な管理、HTTPS必須化