#!/bin/bash
# Google Cloud SQLデータベースのバックアップスクリプト

# 設定
DB_HOST="35.232.151.129"
DB_USER="saas1"
DB_PASS="yoshi2003"
DB_NAME="saas1"
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/saas_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "データベースバックアップを開始します..."
echo "接続先: $DB_HOST"
echo "データベース: $DB_NAME"

# バックアップ実行
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ バックアップ完了: $BACKUP_FILE"
    echo "ファイルサイズ: $(ls -lh $BACKUP_FILE | awk '{print $5}')"
    
    # データの確認
    echo ""
    echo "バックアップ内容の確認:"
    grep -c "INSERT INTO" $BACKUP_FILE | xargs echo "INSERT文の数:"
    grep "CREATE TABLE" $BACKUP_FILE | wc -l | xargs echo "テーブル数:"
else
    echo "❌ バックアップ失敗"
    exit 1
fi