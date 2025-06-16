#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Xserver用のメインアプリケーション
CGIとして動作するように最適化
"""

import sys
import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import traceback

# パスの設定（CGI環境用）
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 設定をインポート
from config import Config

# ロギング設定
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE) if Config.LOG_FILE else logging.StreamHandler(),
        logging.StreamHandler()  # コンソールにも出力
    ]
)
logger = logging.getLogger(__name__)

# Flaskアプリケーションの初期化
app = Flask(__name__, static_folder='../dist')
CORS(app, origins=Config.CORS_ORIGINS)

# データベース接続設定
try:
    engine = create_engine(
        Config.get_database_uri(),
        **Config.SQLALCHEMY_ENGINE_OPTIONS
    )
    # 接続テスト
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    logger.info("Database connection established successfully")
except Exception as e:
    logger.error(f"Database connection error: {e}")
    logger.error(f"Stack trace: {traceback.format_exc()}")
    engine = None
    SessionLocal = None
    Base = declarative_base()

# テーブル定義
class Customer(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    plan = Column(String(255))
    mrr = Column(Integer)
    initial_fee = Column(Integer, default=0)
    operation_fee = Column(Integer, default=0)
    assignee = Column(String(255))
    hours = Column(Integer, default=0)
    region = Column(String(255))
    industry = Column(String(255))
    channel = Column(String(255))
    status = Column(String(255), default='active')
    contract_date = Column(String(255))
    health_score = Column(Integer, default=70)
    last_login = Column(String(255))
    support_tickets = Column(Integer, default=0)
    nps_score = Column(Integer, default=7)
    usage_rate = Column(Integer, default=50)
    churn_date = Column(String(255))

# テーブル作成（存在しない場合）
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

# データベース接続チェック用デコレータ
def require_database(f):
    def decorated_function(*args, **kwargs):
        if not SessionLocal or not engine:
            return jsonify({
                "error": "Database connection not available",
                "details": "The application could not connect to the database"
            }), 503
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# ========== APIエンドポイント ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """ヘルスチェック"""
    health_info = {
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "environment": Config.ENVIRONMENT,
        "database_config": {
            "host": Config.DB_HOST,
            "port": Config.DB_PORT,
            "database": Config.DB_NAME
        }
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
                
                # データベースバージョン取得
                version_result = conn.execute(text("SELECT VERSION()"))
                db_version = version_result.scalar()
                
                health_info["database"] = "connected"
                health_info["database_status"] = "healthy"
                health_info["database_version"] = db_version
                
        except Exception as e:
            health_info["database"] = "disconnected"
            health_info["database_error"] = str(e)
            logger.error(f"Database health check failed: {e}")
    else:
        health_info["database"] = "not configured"
        health_info["database_error"] = "Engine not initialized"
    
    status_code = 200 if health_info.get("database") == "connected" else 503
    return jsonify(health_info), status_code

@app.route('/api/save', methods=['POST'])
@require_database
def save_data():
    """顧客データ保存"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        session = SessionLocal()
        try:
            # フィールド名の柔軟な対応
            name = data.get("newCustomerName") or data.get("name")
            plan = data.get("newCustomerPlan") or data.get("plan")
            mrr = data.get("newCustomerMrr") or data.get("mrr")
            
            if not all([name, plan, mrr is not None]):
                return jsonify({
                    "error": "Missing required fields",
                    "required": ["name", "plan", "mrr"]
                }), 400
            
            customer = Customer(
                name=name,
                plan=plan,
                mrr=int(mrr or 0),
                initial_fee=int(data.get("newCustomerInitialFee", 0) or data.get("initial_fee", 0)),
                operation_fee=int(data.get("newCustomerOperationFee", 0) or data.get("operation_fee", 0)),
                assignee=data.get("newCustomerAssignee") or data.get("assignee"),
                hours=int(data.get("newCustomerHours", 0) or data.get("hours", 0)),
                region=data.get("newCustomerRegion") or data.get("region"),
                industry=data.get("newCustomerIndustry") or data.get("industry"),
                channel=data.get("newCustomerChannel") or data.get("channel"),
                status=data.get("newCustomerStatus", "active") or data.get("status", "active"),
                contract_date=data.get("newCustomerContractDate") or data.get("contract_date") or datetime.now().strftime('%Y-%m-%d')
            )
            
            session.add(customer)
            session.commit()
            
            logger.info(f"Customer saved: ID={customer.id}, Name={customer.name}")
            
            return jsonify({
                "message": "保存成功",
                "id": customer.id,
                "name": customer.name,
                "created_at": datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error saving customer: {e}")
            return jsonify({
                "error": "Failed to save customer",
                "details": str(e)
            }), 400
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Unexpected error in save_data: {e}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

@app.route('/api/customers', methods=['GET'])
@require_database
def get_customers():
    """顧客データ取得"""
    session = SessionLocal()
    try:
        customers = session.query(Customer).all()
        customer_list = []
        
        for customer in customers:
            customer_list.append({
                "id": customer.id,
                "name": customer.name,
                "plan": customer.plan,
                "mrr": customer.mrr,
                "initial_fee": customer.initial_fee or 0,
                "operation_fee": customer.operation_fee or 0,
                "assignee": customer.assignee,
                "hours": customer.hours or 0,
                "region": customer.region,
                "industry": customer.industry,
                "channel": customer.channel,
                "status": customer.status or 'active',
                "contract_date": customer.contract_date,
                "health_score": customer.health_score or 70,
                "last_login": customer.last_login,
                "support_tickets": customer.support_tickets or 0,
                "nps_score": customer.nps_score or 7,
                "usage_rate": customer.usage_rate or 50,
                "churn_date": customer.churn_date
            })
        
        logger.info(f"Retrieved {len(customer_list)} customers")
        return jsonify(customer_list), 200
        
    except Exception as e:
        logger.error(f"Error retrieving customers: {e}")
        return jsonify({
            "error": "Failed to retrieve customers",
            "details": str(e)
        }), 500
    finally:
        session.close()

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
@require_database
def delete_customer(customer_id):
    """顧客データ削除"""
    session = SessionLocal()
    try:
        customer = session.query(Customer).filter_by(id=customer_id).first()
        if customer:
            customer_name = customer.name
            session.delete(customer)
            session.commit()
            logger.info(f"Customer deleted: ID={customer_id}, Name={customer_name}")
            return jsonify({
                "message": "削除成功",
                "id": customer_id,
                "name": customer_name
            }), 200
        else:
            return jsonify({"error": "Customer not found"}), 404
            
    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting customer {customer_id}: {e}")
        return jsonify({
            "error": "Failed to delete customer",
            "details": str(e)
        }), 500
    finally:
        session.close()

# デバッグ用エンドポイント（本番環境では無効化推奨）
@app.route('/api/debug/config', methods=['GET'])
def debug_config():
    """設定情報の確認（開発環境のみ）"""
    if not Config.DEBUG:
        return jsonify({"error": "Not available in production"}), 403
    
    return jsonify({
        "config": Config.get_config_dict(),
        "database_uri_masked": Config.get_database_uri().replace(Config.DB_PASSWORD, '***'),
        "timestamp": datetime.now().isoformat()
    })

# ========== 静的ファイルハンドラー ==========

@app.route('/')
def serve():
    """メインページ"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    """静的ファイルまたはSPAフォールバック"""
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
    
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # SPAのフォールバック
    return send_from_directory(app.static_folder, 'index.html')

# ========== CGI用の起動処理 ==========

if __name__ == '__main__':
    # CGI環境かローカル開発かを判定
    if 'REQUEST_METHOD' in os.environ:
        # CGIとして実行
        from wsgiref.handlers import CGIHandler
        CGIHandler().run(app)
    else:
        # ローカル開発サーバーとして実行
        port = int(os.environ.get('PORT', 8080))
        app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)