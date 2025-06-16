from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import socket

app = Flask(__name__, static_folder='dist')
CORS(app)  # Enable CORS for all routes

# App Engine環境では Cloud SQL Unix Socket を使用
if os.environ.get('GAE_ENV') == 'standard':
    # App Engine Standard 環境
    db_socket_dir = "/cloudsql"
    # Cloud SQL インスタンスの接続名を正しく設定
    # 形式: PROJECT_ID:REGION:INSTANCE_NAME
    # Cloud SQL インスタンスがus-central1にある場合は以下のようになります
    cloud_sql_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'total-handler-244211:us-central1:saas')
    DATABASE_URI = f"mysql+pymysql://saas1:yoshi2003@/{os.environ.get('DB_NAME', 'saas1')}?unix_socket={db_socket_dir}/{cloud_sql_connection_name}"
else:
    # ローカル開発環境
    DATABASE_URI = os.environ.get("DATABASE_URI", "mysql+pymysql://saas1:yoshi2003@35.232.151.129/saas1")

print(f"DATABASE_URI: {DATABASE_URI}")
print(f"GAE_ENV: {os.environ.get('GAE_ENV')}")

try:
    engine = create_engine(DATABASE_URI, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
except Exception as e:
    print(f"Database connection error: {e}")
    # エラーでも起動は続行
    engine = None
    SessionLocal = None
    Base = declarative_base()

# テーブル定義（サンプル：customers）
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

# テーブル作成を試みる（エラー処理付き）
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

# ========== APIエンドポイントを先に定義 ==========

# フォームデータ保存APIエンドポイント
@app.route('/save', methods=['POST'])
def save_data():
    if not SessionLocal:
        return jsonify({"error": "Database connection not available"}), 503
        
    data = request.get_json()
    print("Received data:", data)

    session = SessionLocal()
    try:
        # Support both old field names (with "newCustomer" prefix) and new field names
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
        # Return the new customer ID
        return jsonify({"message": "保存成功", "id": customer.id}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        session.close()

# 顧客データ取得APIエンドポイント
@app.route('/customers', methods=['GET'])
def get_customers():
    if not SessionLocal:
        return jsonify({"error": "Database connection not available"}), 503
        
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
        return jsonify(customer_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

# 顧客データ削除APIエンドポイント
@app.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    if not SessionLocal:
        return jsonify({"error": "Database connection not available"}), 503
        
    session = SessionLocal()
    try:
        customer = session.query(Customer).filter_by(id=customer_id).first()
        if customer:
            session.delete(customer)
            session.commit()
            return jsonify({"message": "削除成功"}), 200
        else:
            return jsonify({"error": "Customer not found"}), 404
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

# ヘルスチェックエンドポイント
@app.route('/health', methods=['GET'])
def health_check():
    health_info = {
        "status": "running",
        "environment": os.environ.get('GAE_ENV', 'local'),
        "hostname": socket.gethostname()
    }
    
    if engine:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            health_info["database"] = "connected"
        except Exception as e:
            health_info["database"] = "disconnected"
            health_info["db_error"] = str(e)
    else:
        health_info["database"] = "not configured"
    
    status_code = 200 if health_info.get("database") == "connected" else 503
    return jsonify(health_info), status_code

# ========== 静的ファイルハンドラーは最後に定義 ==========

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
    app.run(host='0.0.0.0', port=8080)