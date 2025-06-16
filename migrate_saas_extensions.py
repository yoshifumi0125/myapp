#!/usr/bin/env python3
"""
SaaS販売管理システムの拡張テーブルをマイグレーションするスクリプト
"""
import os
import sys
import logging
from sqlalchemy import create_engine, text
from datetime import datetime

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_database_uri():
    """データベースURIを取得"""
    # 環境変数から接続情報を取得
    db_user = os.environ.get('DB_USER', 'saas1')
    db_pass = os.environ.get('DB_PASSWORD', 'yoshi2003')
    db_name = os.environ.get('DB_NAME', 'saas1')
    db_host = os.environ.get('DB_HOST', '35.232.151.129')
    db_port = os.environ.get('DB_PORT', '3306')
    db_charset = os.environ.get('DB_CHARSET', 'utf8mb4')
    
    if os.environ.get('ENVIRONMENT') == 'xserver':
        # XServer環境
        database_uri = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}?charset={db_charset}"
        logger.info(f"Using XServer connection: {db_host}:{db_port}")
    else:
        # その他の環境
        database_uri = os.environ.get("DATABASE_URI", f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}")
    
    # パスワードをマスクして表示
    masked_uri = database_uri.replace(db_pass, '*' * len(db_pass) if db_pass else '*')
    logger.info(f"Database URI (masked): {masked_uri}")
    
    return database_uri

def run_migration():
    """マイグレーションを実行"""
    try:
        # データベースエンジンを作成
        engine = create_engine(get_database_uri())
        
        # SQLファイルを読み込む
        migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'add_saas_tables.sql')
        
        if not os.path.exists(migration_file):
            logger.error(f"Migration file not found: {migration_file}")
            return False
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # SQLステートメントを分割（セミコロンで区切る）
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        # 各ステートメントを実行
        with engine.connect() as conn:
            for i, statement in enumerate(statements):
                if statement:
                    try:
                        logger.info(f"Executing statement {i+1}/{len(statements)}...")
                        # コメントを含む行を除外
                        if not statement.startswith('--'):
                            conn.execute(text(statement))
                            conn.commit()
                    except Exception as e:
                        logger.error(f"Error executing statement {i+1}: {e}")
                        logger.error(f"Statement: {statement[:100]}...")
                        raise
        
        logger.info("Migration completed successfully!")
        
        # 作成されたテーブルを確認
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            logger.info(f"Current tables: {', '.join(tables)}")
            
            # 新しいテーブルの存在確認
            new_tables = ['contracts', 'invoices', 'invoice_items', 'payments', 'recurring_billing', 'contract_history']
            for table in new_tables:
                if table in tables:
                    logger.info(f"✓ Table '{table}' created successfully")
                else:
                    logger.warning(f"✗ Table '{table}' not found")
        
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting SaaS extensions migration...")
    logger.info(f"Migration started at: {datetime.now()}")
    
    success = run_migration()
    
    if success:
        logger.info("Migration completed successfully!")
        sys.exit(0)
    else:
        logger.error("Migration failed!")
        sys.exit(1)