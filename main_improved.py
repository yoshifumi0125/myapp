from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
import os
import socket
import logging
import traceback
from datetime import datetime

# ロギング設定（より詳細なフォーマット）
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='dist')
CORS(app)  # Enable CORS for all routes

# Google Cloud SQL設定
def get_database_uri():
    """環境に応じたデータベースURIを取得"""
    # デフォルト値（環境変数から取得）
    db_user = os.environ.get('DB_USER', 'saas1')
    db_pass = os.environ.get('DB_PASSWORD', 'yoshi2003')
    db_name = os.environ.get('DB_NAME', 'saas1')
    
    if os.environ.get('GAE_ENV') == 'standard':
        # App Engine Standard 環境
        db_socket_dir = "/cloudsql"
        cloud_sql_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'total-handler-244211:us-central1:saas')
        
        # Unix socketを使用した接続
        database_uri = f"mysql+pymysql://{db_user}:{db_pass}@/{db_name}?unix_socket={db_socket_dir}/{cloud_sql_connection_name}"
        logger.info(f"Using Unix socket connection: {cloud_sql_connection_name}")
        logger.info(f"Socket path: {db_socket_dir}/{cloud_sql_connection_name}")
    else:
        # ローカル開発環境（TCP接続）
        database_uri = os.environ.get("DATABASE_URI", "mysql+pymysql://saas1:yoshi2003@35.232.151.129/saas1")
        logger.info("Using TCP connection for local development")
    
    # URIの一部をマスクして表示（セキュリティのため）
    masked_uri = database_uri.replace(db_pass, '*' * len(db_pass))
    logger.info(f"Database URI (masked): {masked_uri}")
    
    return database_uri

# データベース接続設定
DATABASE_URI = get_database_uri()
logger.info(f"DATABASE_URI configured for environment: {os.environ.get('GAE_ENV', 'local')}")

# エンジン作成（App Engine用の設定）
engine_config = {
    'pool_pre_ping': True,
    'pool_recycle': 3600,  # 1時間でコネクションをリサイクル
    'echo': False,  # SQLクエリをログに出力（デバッグ用）
}

# App Engine環境では接続プールを無効化
if os.environ.get('GAE_ENV') == 'standard':
    engine_config['poolclass'] = NullPool
    logger.info("Using NullPool for App Engine Standard environment")

try:
    engine = create_engine(DATABASE_URI, **engine_config)
    # 接続テスト
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    logger.info("Database engine created and tested successfully")
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

# テーブル作成
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully")
        # テーブル確認
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES LIKE 'customers'"))
            if result.fetchone():
                logger.info("Customers table exists")
            else:
                logger.warning("Customers table was not created")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        logger.error(f"Stack trace: {traceback.format_exc()}")

# ========== APIエンドポイント ==========

# データベース接続チェック用デコレータ
def require_database(f):
    def decorated_function(*args, **kwargs):
        if not SessionLocal or not engine:
            error_details = {
                "error": "Database connection not available",
                "details": "The application could not connect to the database",
                "environment": os.environ.get('GAE_ENV', 'local'),
                "cloud_sql_connection": os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'not set')
            }
            logger.error(f"Database required but not available: {error_details}")
            return jsonify(error_details), 503
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# ヘルスチェックエンドポイント
@app.route('/health', methods=['GET'])
def health_check():
    """アプリケーションとデータベースの健全性をチェック"""
    health_info = {
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "environment": os.environ.get('GAE_ENV', 'local'),
        "hostname": socket.gethostname(),
        "cloud_sql_connection": os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'not set'),
        "database_config": {
            "db_user": os.environ.get('DB_USER', 'not set'),
            "db_name": os.environ.get('DB_NAME', 'not set'),
            "socket_dir": "/cloudsql" if os.environ.get('GAE_ENV') == 'standard' else "N/A"
        }
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                # 基本的な接続テスト
                result = conn.execute(text("SELECT 1 as test"))
                test_result = result.fetchone()
                
                # データベースバージョン取得
                version_result = conn.execute(text("SELECT VERSION()"))
                db_version = version_result.scalar()
                
                # テーブル数取得
                tables_result = conn.execute(text("SHOW TABLES"))
                table_count = len(tables_result.fetchall())
                
                health_info["database"] = "connected"
                health_info["database_status"] = "healthy"
                health_info["database_version"] = db_version
                health_info["table_count"] = table_count
                
        except Exception as e:
            health_info["database"] = "disconnected"
            health_info["database_error"] = str(e)
            health_info["error_type"] = type(e).__name__
            logger.error(f"Database health check failed: {e}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
    else:
        health_info["database"] = "not configured"
        health_info["database_error"] = "Engine not initialized"
    
    status_code = 200 if health_info.get("database") == "connected" else 503
    return jsonify(health_info), status_code

# 顧客データ保存エンドポイント
@app.route('/save', methods=['POST'])
@require_database
def save_data():
    """新規顧客データを保存"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        logger.info(f"Received save request with data keys: {list(data.keys())}")
        
        session = SessionLocal()
        try:
            # 必須フィールドのチェック
            required_fields = ['name', 'plan', 'mrr']
            missing_fields = []
            
            # フィールド名の柔軟な対応
            name = data.get("newCustomerName") or data.get("name")
            plan = data.get("newCustomerPlan") or data.get("plan")
            mrr = data.get("newCustomerMrr") or data.get("mrr")
            
            if not name:
                missing_fields.append('name')
            if not plan:
                missing_fields.append('plan')
            if mrr is None:
                missing_fields.append('mrr')
                
            if missing_fields:
                return jsonify({
                    "error": "Missing required fields",
                    "missing_fields": missing_fields
                }), 400
            
            # 顧客データ作成
            customer = Customer(
                name=name,
                plan=plan,
                mrr=int(mrr or 0),
                initial_fee=int(data.get("newCustomerInitialFee", 0) or data.get("initialFee", 0) or data.get("initial_fee", 0)),
                operation_fee=int(data.get("newCustomerOperationFee", 0) or data.get("operationFee", 0) or data.get("operation_fee", 0)),
                assignee=data.get("newCustomerAssignee") or data.get("assignee"),
                hours=int(data.get("newCustomerHours", 0) or data.get("hours", 0)),
                region=data.get("newCustomerRegion") or data.get("region"),
                industry=data.get("newCustomerIndustry") or data.get("industry"),
                channel=data.get("newCustomerChannel") or data.get("channel"),
                status=data.get("newCustomerStatus", "active") or data.get("status", "active"),
                contract_date=data.get("newCustomerContractDate") or data.get("contract_date") or data.get("startDate") or datetime.now().strftime('%Y-%m-%d')
            )
            
            session.add(customer)
            session.commit()
            
            logger.info(f"Customer saved successfully: ID={customer.id}, Name={customer.name}, Plan={customer.plan}, MRR={customer.mrr}")
            
            return jsonify({
                "message": "保存成功",
                "id": customer.id,
                "name": customer.name,
                "created_at": datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error saving customer: {e}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            return jsonify({
                "error": "Failed to save customer",
                "details": str(e),
                "type": type(e).__name__
            }), 400
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"Unexpected error in save_data: {e}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "type": type(e).__name__
        }), 500

# 顧客データ取得エンドポイント
@app.route('/customers', methods=['GET'])
@require_database
def get_customers():
    """全顧客データを取得"""
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
        
        logger.info(f"Retrieved {len(customer_list)} customers successfully")
        return jsonify(customer_list), 200
        
    except Exception as e:
        logger.error(f"Error retrieving customers: {e}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        return jsonify({
            "error": "Failed to retrieve customers",
            "details": str(e),
            "type": type(e).__name__
        }), 500
    finally:
        session.close()

# 顧客データ削除エンドポイント
@app.route('/customers/<int:customer_id>', methods=['DELETE'])
@require_database
def delete_customer(customer_id):
    """指定された顧客を削除"""
    session = SessionLocal()
    try:
        customer = session.query(Customer).filter_by(id=customer_id).first()
        if customer:
            customer_name = customer.name
            session.delete(customer)
            session.commit()
            logger.info(f"Customer deleted successfully: ID={customer_id}, Name={customer_name}")
            return jsonify({
                "message": "削除成功",
                "id": customer_id,
                "name": customer_name,
                "deleted_at": datetime.now().isoformat()
            }), 200
        else:
            logger.warning(f"Customer not found for deletion: ID={customer_id}")
            return jsonify({"error": "Customer not found"}), 404
            
    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting customer {customer_id}: {e}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        return jsonify({
            "error": "Failed to delete customer",
            "details": str(e),
            "type": type(e).__name__
        }), 500
    finally:
        session.close()

# デバッグ用：データベース情報エンドポイント
@app.route('/debug/db-info', methods=['GET'])
def debug_db_info():
    """デバッグ用：データベース接続情報を表示"""
    info = {
        "timestamp": datetime.now().isoformat(),
        "environment": os.environ.get('GAE_ENV', 'local'),
        "environment_variables": {
            "GAE_ENV": os.environ.get('GAE_ENV', 'not set'),
            "CLOUD_SQL_CONNECTION_NAME": os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'not set'),
            "DB_NAME": os.environ.get('DB_NAME', 'not set'),
            "DB_USER": os.environ.get('DB_USER', 'not set'),
            "DB_PASSWORD": "***" if os.environ.get('DB_PASSWORD') else 'not set'
        },
        "connection_info": {
            "engine_initialized": engine is not None,
            "session_factory_initialized": SessionLocal is not None,
            "socket_path": f"/cloudsql/{os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'N/A')}" if os.environ.get('GAE_ENV') == 'standard' else "N/A"
        }
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                # テーブル存在確認
                result = conn.execute(text("SHOW TABLES"))
                tables = [row[0] for row in result]
                info["database"] = {
                    "status": "connected",
                    "tables": tables,
                    "table_count": len(tables)
                }
                
                # カスタマーテーブルの情報
                if 'customers' in tables:
                    # 行数
                    count_result = conn.execute(text("SELECT COUNT(*) FROM customers"))
                    customer_count = count_result.scalar()
                    
                    # カラム情報
                    columns_result = conn.execute(text("SHOW COLUMNS FROM customers"))
                    columns = [{"field": row[0], "type": row[1], "null": row[2]} for row in columns_result]
                    
                    info["customers_table"] = {
                        "row_count": customer_count,
                        "columns": columns
                    }
                    
                    # 最新5件のデータ
                    if customer_count > 0:
                        recent_result = conn.execute(text("SELECT id, name, plan, mrr, status, contract_date FROM customers ORDER BY id DESC LIMIT 5"))
                        recent_customers = []
                        for row in recent_result:
                            recent_customers.append({
                                "id": row[0],
                                "name": row[1],
                                "plan": row[2],
                                "mrr": row[3],
                                "status": row[4],
                                "contract_date": row[5]
                            })
                        info["recent_customers"] = recent_customers
                        
        except Exception as e:
            info["database"] = {
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }
            logger.error(f"Debug endpoint database error: {e}")
    else:
        info["database"] = {
            "status": "not initialized",
            "error": "Engine is None"
        }
    
    return jsonify(info), 200

# ========== 静的ファイルハンドラー ==========

@app.route('/')
def serve():
    """ルートパスへのアクセスでindex.htmlを返す"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    """静的ファイルまたはSPAのフォールバック処理"""
    # APIエンドポイントは除外
    if path.startswith('api/') or path in ['health', 'save', 'customers', 'debug/db-info']:
        return jsonify({"error": "Not found"}), 404
        
    # 静的ファイルを返す
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # SPAのため、存在しないパスはindex.htmlを返す
    return send_from_directory(app.static_folder, 'index.html')

# エラーハンドラー
@app.errorhandler(404)
def not_found(e):
    """404エラーのカスタムハンドラー"""
    return jsonify({"error": "Not found", "path": request.path}), 404

@app.errorhandler(500)
def internal_error(e):
    """500エラーのカスタムハンドラー"""
    logger.error(f"Internal server error: {e}")
    return jsonify({
        "error": "Internal server error",
        "details": str(e) if app.debug else "An error occurred"
    }), 500

if __name__ == '__main__':
    # ローカル開発用の設定
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    logger.info(f"Starting Flask app on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)