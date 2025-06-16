# XServerデプロイチェックリスト

## 事前準備 ✅
- [x] サーバー番号: sv14067.xserver.jp
- [x] ドメイン: gta-test1.com
- [x] データベース情報設定済み
- [x] フロントエンドビルド完了
- [x] SECRET_KEY生成済み

## デプロイ手順

### 1. デプロイスクリプトの実行
```bash
python3 deploy_to_xserver.py
```

### 2. SSH接続してセットアップ
```bash
# SSH接続
ssh yoshifumik@sv14067.xserver.jp

# アプリケーションディレクトリに移動
cd /home/yoshifumik/gta-test1.com/public_html/saas

# 依存パッケージインストール
pip3 install --user -r requirements.txt

# ログディレクトリ作成
mkdir -p /home/yoshifumik/logs

# データベースマイグレーション
python3 migrate_xserver.py

# アプリケーション起動
bash xserver_start.sh
```

### 3. 動作確認

#### A. ログ確認
```bash
tail -f /home/yoshifumik/logs/app.log
```

#### B. プロセス確認
```bash
ps aux | grep python
```

#### C. ブラウザでアクセス
- https://gta-test1.com/saas/

### 4. トラブルシューティング

#### Python3が見つからない場合
```bash
# Pythonのパスを確認
which python
which python3

# パスを指定して実行
/usr/local/bin/python3 run_xserver.py
```

#### ポート8080が使えない場合
`.env.xserver`を編集してポート変更：
```env
PORT=8888  # 使用可能なポート番号に変更
```

#### モジュールエラーの場合
```bash
# --userオプションでローカルインストール
pip install --user flask flask-cors flask-sqlalchemy pymysql
```

### 5. 本番運用設定

#### A. .htaccessの配置
`public_html/saas/.htaccess`にコピー：
```bash
cp xserver_htaccess /home/yoshifumik/gta-test1.com/public_html/saas/.htaccess
```

#### B. 自動起動設定（cronジョブ）
```bash
# crontab編集
crontab -e

# 追加する行（サーバー再起動時に自動起動）
@reboot /home/yoshifumik/gta-test1.com/public_html/saas/xserver_start.sh
```

## 確認項目

- [ ] データベース接続OK
- [ ] マイグレーション完了
- [ ] アプリケーション起動
- [ ] HTTPSアクセス可能
- [ ] APIエンドポイント動作確認
- [ ] フロントエンド表示確認

## APIエンドポイント確認

```bash
# ヘルスチェック
curl https://gta-test1.com/saas/health

# 顧客一覧
curl https://gta-test1.com/saas/api/customers

# 契約一覧
curl https://gta-test1.com/saas/api/contracts
```