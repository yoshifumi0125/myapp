from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
import os
import socket
import logging

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='dist')
CORS(app)  # Enable CORS for all routes

# Google Cloud SQL設定
def get_database_uri():
    """環境に応じたデータベースURIを取得"""
    if os.environ.get('GAE_ENV') == 'standard':
        # App Engine Standard 環境
        db_socket_dir = "/cloudsql"
        cloud_sql_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'total-handler-244211:us-central1:saas')
        db_user = os.environ.get('DB_USER', 'saas1')
        db_pass = os.environ.get('DB_PASSWORD', 'yoshi2003')
        db_name = os.environ.get('DB_NAME', 'saas1')
        
        # Unix socketを使用した接続
        database_uri = f"mysql+pymysql://{db_user}:{db_pass}@/{db_name}?unix_socket={db_socket_dir}/{cloud_sql_connection_name}"
        logger.info(f"Using Unix socket connection: {cloud_sql_connection_name}")
    else:
        # ローカル開発環境（TCP接続）
        database_uri = os.environ.get("DATABASE_URI", "mysql+pymysql://saas1:yoshi2003@35.232.151.129/saas1")
        logger.info("Using TCP connection for local development")
    
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

try:
    engine = create_engine(DATABASE_URI, **engine_config)
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Database connection error: {e}")
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
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

# ========== APIエンドポイント ==========

# データベース接続チェック用デコレータ
def require_database(f):
    def decorated_function(*args, **kwargs):
        if not SessionLocal:
            return jsonify({
                "error": "Database connection not available",
                "details": "The application could not connect to the database"
            }), 503
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# ヘルスチェックエンドポイント
@app.route('/health', methods=['GET'])
def health_check():
    health_info = {
        "status": "running",
        "environment": os.environ.get('GAE_ENV', 'local'),
        "hostname": socket.gethostname(),
        "cloud_sql_connection": os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'not set')
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            health_info["database"] = "connected"
            health_info["database_status"] = "healthy"
        except Exception as e:
            health_info["database"] = "disconnected"
            health_info["database_error"] = str(e)
            logger.error(f"Database health check failed: {e}")
    else:
        health_info["database"] = "not configured"
        health_info["database_error"] = "Engine not initialized"
    
    status_code = 200 if health_info.get("database") == "connected" else 503
    return jsonify(health_info), status_code

# 顧客データ保存エンドポイント
@app.route('/save', methods=['POST'])
@require_database
def save_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        logger.info(f"Received save request with data: {data}")
        
        session = SessionLocal()
        try:
            # フィールド名の柔軟な対応
            customer = Customer(
                name=data.get("newCustomerName") or data.get("name"),
                plan=data.get("newCustomerPlan") or data.get("plan"),
                mrr=int(data.get("newCustomerMrr", 0) or data.get("mrr", 0)),
                initial_fee=int(data.get("newCustomerInitialFee", 0) or data.get("initialFee", 0) or data.get("initial_fee", 0)),
                operation_fee=int(data.get("newCustomerOperationFee", 0) or data.get("operationFee", 0) or data.get("operation_fee", 0)),
                assignee=data.get("newCustomerAssignee") or data.get("assignee"),
                hours=int(data.get("newCustomerHours", 0) or data.get("hours", 0)),
                region=data.get("newCustomerRegion") or data.get("region"),
                industry=data.get("newCustomerIndustry") or data.get("industry"),
                channel=data.get("newCustomerChannel") or data.get("channel"),
                status=data.get("newCustomerStatus", "active") or data.get("status", "active"),
                contract_date=data.get("newCustomerContractDate") or data.get("contract_date") or data.get("startDate")
            )
            
            session.add(customer)
            session.commit()
            
            logger.info(f"Customer saved successfully with ID: {customer.id}")
            return jsonify({
                "message": "保存成功",
                "id": customer.id,
                "name": customer.name
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

# 顧客データ取得エンドポイント
@app.route('/customers', methods=['GET'])
@require_database
def get_customers():
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
                "initial_fee": customer.initial_fee,
                "operation_fee": customer.operation_fee,
                "assignee": customer.assignee,
                "hours": customer.hours,
                "region": customer.region,
                "industry": customer.industry,
                "channel": customer.channel,
                "status": customer.status,
                "contract_date": customer.contract_date,
                "health_score": customer.health_score,
                "last_login": customer.last_login,
                "support_tickets": customer.support_tickets,
                "nps_score": customer.nps_score,
                "usage_rate": customer.usage_rate,
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

# 顧客データ削除エンドポイント
@app.route('/customers/<int:customer_id>', methods=['DELETE'])
@require_database
def delete_customer(customer_id):
    session = SessionLocal()
    try:
        customer = session.query(Customer).filter_by(id=customer_id).first()
        if customer:
            customer_name = customer.name
            session.delete(customer)
            session.commit()
            logger.info(f"Customer {customer_id} ({customer_name}) deleted successfully")
            return jsonify({
                "message": "削除成功",
                "id": customer_id
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

# デバッグ用：データベース情報エンドポイント
@app.route('/debug/db-info', methods=['GET'])
def debug_db_info():
    """デバッグ用：データベース接続情報を表示"""
    info = {
        "environment": os.environ.get('GAE_ENV', 'local'),
        "cloud_sql_connection_name": os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'not set'),
        "db_name": os.environ.get('DB_NAME', 'not set'),
        "db_user": os.environ.get('DB_USER', 'not set'),
        "engine_initialized": engine is not None,
        "session_factory_initialized": SessionLocal is not None
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                # テーブル存在確認
                result = conn.execute(text("SHOW TABLES"))
                tables = [row[0] for row in result]
                info["tables"] = tables
                
                # カスタマーテーブルの行数
                if 'customers' in tables:
                    count_result = conn.execute(text("SELECT COUNT(*) FROM customers"))
                    info["customer_count"] = count_result.scalar()
                    
        except Exception as e:
            info["database_error"] = str(e)
    
    return jsonify(info), 200

# ========== 静的ファイルハンドラー ==========

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # 静的ファイルを返す
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    # SPAのため、存在しないパスはindex.htmlを返す
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)