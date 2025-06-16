from flask import Flask, request, jsonify
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker
import os

app = Flask(__name__)

# 直接接続を使用
DATABASE_URI = "mysql+pymysql://saas1:yoshi2003@35.232.151.129/saas1"

print(f"DATABASE_URI: {DATABASE_URI}")

try:
    engine = create_engine(DATABASE_URI, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    print("Database engine created successfully")
except Exception as e:
    print(f"Database connection error: {e}")
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
    assignee = Column(String(255))

# テーブル作成
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

@app.route('/')
def home():
    return {"message": "API is running"}

@app.route('/health', methods=['GET'])
def health_check():
    health_info = {
        "status": "running",
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

# データ保存APIエンドポイント
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
        return jsonify({"message": "保存成功", "id": customer.id}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        session.close()

# データ取得APIエンドポイント
@app.route('/customers', methods=['GET'])
def get_customers():
    if not SessionLocal:
        return jsonify({"error": "Database connection not available"}), 503
    
    session = SessionLocal()
    try:
        customers = session.query(Customer).all()
        result = []
        for customer in customers:
            result.append({
                "id": customer.id,
                "name": customer.name,
                "plan": customer.plan,
                "mrr": customer.mrr,
                "assignee": customer.assignee
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        session.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)