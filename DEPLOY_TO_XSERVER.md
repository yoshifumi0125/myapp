# Xserverへのデプロイ手順書

## 前提条件
- Xserverのアカウントが有効であること
- SSH接続が可能であること
- MySQLデータベースが作成済みであること
- Python 3.xが利用可能であること

## デプロイ手順

### 1. データベースの準備

#### 1.1 Google Cloud SQLからデータをエクスポート
すでに`backups/saas_backup_20250601_205048.sql`にバックアップ済みです。

#### 1.2 Xserverのデータベースにインポート
```bash
# SSH接続後
mysql -h localhost -u your_xserver_db_user -p your_xserver_db_name < saas_backup_20250601_205048.sql
```

### 2. 環境設定ファイルの準備

#### 2.1 .env.xserverを.envにコピーして編集
```bash
cp .env.xserver .env
```

以下の値をXserverの情報に置き換えてください：
- `DB_USER`: Xserverのデータベースユーザー名
- `DB_PASSWORD`: Xserverのデータベースパスワード
- `DB_NAME`: Xserverのデータベース名
- `SECRET_KEY`: 本番用のシークレットキー（ランダムな文字列）
- `API_BASE_URL`: あなたのドメイン（例：https://example.com）
- `CORS_ORIGINS`: あなたのドメイン（例：https://example.com）

### 3. ファイルのアップロード

#### 3.1 ディレクトリ構造
```
public_html/
├── index.html          (dist/index.htmlをコピー)
├── assets/            (dist/assets/の内容をコピー)
│   ├── index-*.js
│   └── index-*.css
├── .htaccess
└── cgi-bin/
    ├── main.py        (main_xserver.pyをmain.pyとしてコピー)
    ├── config.py      (config_xserver.pyをconfig.pyとしてコピー)
    ├── .env
    └── requirements.txt (requirements_xserver.txtをコピー)
```

#### 3.2 FTP/SFTPでアップロード
1. `dist/`の内容を`public_html/`にアップロード
2. `.htaccess`を`public_html/`にアップロード
3. `cgi-bin/`ディレクトリを作成
4. Pythonファイルと設定ファイルを`cgi-bin/`にアップロード

### 4. SSH接続して設定

#### 4.1 実行権限の設定
```bash
chmod 755 ~/public_html/cgi-bin/main.py
chmod 600 ~/public_html/cgi-bin/.env
```

#### 4.2 Pythonパッケージのインストール
```bash
cd ~/public_html/cgi-bin
pip install --user -r requirements.txt
```

#### 4.3 ログディレクトリの作成
```bash
mkdir -p ~/logs
```

### 5. 動作確認

#### 5.1 ヘルスチェック
```bash
curl https://your-domain.com/api/health
```

#### 5.2 ブラウザでアクセス
1. https://your-domain.com にアクセス
2. 顧客データが表示されることを確認
3. 新規顧客の追加が可能か確認

### 6. トラブルシューティング

#### エラーログの確認
```bash
# Apacheエラーログ
tail -f ~/logs/error_log

# アプリケーションログ
tail -f ~/logs/app.log
```

#### よくある問題と対処法

1. **500 Internal Server Error**
   - Pythonスクリプトの実行権限を確認
   - `.htaccess`の記述を確認
   - Pythonパスが正しいか確認

2. **データベース接続エラー**
   - `.env`の設定値を確認
   - データベースのホスト名（通常はlocalhost）を確認
   - ユーザー権限を確認

3. **CORS エラー**
   - `.env`のCORS_ORIGINSを確認
   - HTTPSでアクセスしているか確認

### 7. 本番環境での注意点

1. **セキュリティ**
   - `.env`ファイルの権限は必ず600に設定
   - SECRET_KEYは推測されにくい値に変更
   - HTTPSを必ず使用

2. **パフォーマンス**
   - 静的ファイルのキャッシュが有効か確認
   - データベースのインデックスを確認

3. **バックアップ**
   - データベースの定期バックアップを設定
   - ファイルの定期バックアップを設定

## チェックリスト

- [ ] データベースのバックアップ作成済み
- [ ] .envファイルの設定値を更新済み
- [ ] ファイルのアップロード完了
- [ ] 実行権限の設定完了
- [ ] Pythonパッケージのインストール完了
- [ ] ヘルスチェック成功
- [ ] ブラウザでの動作確認完了
- [ ] エラーログの確認完了

## 連絡先

問題が発生した場合は、以下の情報を準備してサポートに連絡してください：
- エラーログの内容
- 実行したコマンド
- 発生した問題の詳細