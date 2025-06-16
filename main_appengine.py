from flask import Flask, request, jsonify, send_from_directory
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import socket

app = Flask(__name__, static_folder='dist')

# App Engine環境では Cloud SQL Unix Socket を使用
if os.environ.get('GAE_ENV') == 'standard':
    # App Engine Standard 環境
    db_socket_dir = "/cloudsql"
    cloud_sql_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'total-handler-244211:us-central1:saas')
    db_name = os.environ.get('DB_NAME', 'saas1')
    db_user = os.environ.get('DB_USER', 'saas1')
    db_password = os.environ.get('DB_PASSWORD', 'yoshi2003')
    DATABASE_URI = f"mysql+pymysql://{db_user}:{db_password}@/{db_name}?unix_socket={db_socket_dir}/{cloud_sql_connection_name}"
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
    assignee = Column(String(255))

# テーブル作成を試みる（エラー処理付き）
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# フォームデータ保存APIエンドポイント
@app.route('/save', methods=['POST'])
def save_data():
    if not SessionLocal:
        return jsonify({"error": "Database connection not available"}), 503
        
    data = request.get_json()
    print("Received data:", data)

    session = SessionLocal()
    try:
        customer = Customer(
            name=data.get("newCustomerName"),
            plan=data.get("newCustomerPlan"),
            mrr=int(data.get("newCustomerMrr", 0)),
            assignee=data.get("newCustomerAssignee")
        )
        session.add(customer)
        session.commit()
        return jsonify({"message": "保存成功"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 400
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
                from sqlalchemy import text
                conn.execute(text("SELECT 1"))
            health_info["database"] = "connected"
        except Exception as e:
            health_info["database"] = "disconnected"
            health_info["db_error"] = str(e)
    else:
        health_info["database"] = "not configured"
    
    status_code = 200 if health_info.get("database") == "connected" else 503
    return jsonify(health_info), status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)