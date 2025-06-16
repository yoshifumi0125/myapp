"""
Xserver用設定ファイル
"""
import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# 環境設定
ENVIRONMENT = os.getenv('ENVIRONMENT', 'production')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

# データベース設定
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'charset': 'utf8mb4'
}

# SQLAlchemy接続文字列
DATABASE_URI = f"mysql+pymysql://{DATABASE_CONFIG['user']}:{DATABASE_CONFIG['password']}@{DATABASE_CONFIG['host']}:{DATABASE_CONFIG['port']}/{DATABASE_CONFIG['database']}?charset={DATABASE_CONFIG['charset']}"

# アプリケーション設定
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
API_BASE_URL = os.getenv('API_BASE_URL', 'https://your-domain.com')

# CORS設定
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# ログ設定
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'app.log')