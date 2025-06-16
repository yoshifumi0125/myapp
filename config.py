"""
Xserver用の設定ファイル
環境に応じた設定を管理
"""
import os
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

class Config:
    """アプリケーション設定"""
    
    # 環境設定
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    DEBUG = os.getenv('DEBUG', 'true').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # データベース設定
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'saas')
    DB_CHARSET = os.getenv('DB_CHARSET', 'utf8mb4')
    
    # SQLAlchemy設定
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?charset={DB_CHARSET}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 3600,
        'pool_size': 10,
        'max_overflow': 20,
        'echo': DEBUG
    }
    
    # アプリケーション設定
    API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8080')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # ログ設定
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    
    @classmethod
    def get_database_uri(cls):
        """データベースURIを取得"""
        return cls.SQLALCHEMY_DATABASE_URI
    
    @classmethod
    def get_config_dict(cls):
        """設定を辞書形式で取得（デバッグ用）"""
        return {
            'ENVIRONMENT': cls.ENVIRONMENT,
            'DEBUG': cls.DEBUG,
            'DB_HOST': cls.DB_HOST,
            'DB_PORT': cls.DB_PORT,
            'DB_USER': cls.DB_USER,
            'DB_NAME': cls.DB_NAME,
            'API_BASE_URL': cls.API_BASE_URL
        }