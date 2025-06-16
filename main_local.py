from flask import Flask, request, jsonify, send_from_directory
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
import os

app = Flask(__name__, static_folder='dist')

# ローカル開発用: Cloud SQL Proxy 経由の接続
# Cloud SQL Proxy を使用する場合は localhost を使用
DATABASE_URI = os.environ.get("DATABASE_URI", "mysql+pymysql://saas1:yoshi2003@localhost:3306/saas1")

# 直接接続する場合（IPアドレスが許可されている場合）
# DATABASE_URI = os.environ.get("DATABASE_URI", "mysql+pymysql://saas1:yoshi2003@35.232.151.129/saas1")

engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(bind=engine)
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
try:
    Base.metadata.create_all(bind=engine)
    print("データベース接続成功！テーブルが作成されました。")
except Exception as e:
    print(f"データベース接続エラー: {e}")
    print("Cloud SQL Proxy が起動していることを確認してください。")

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# フォームデータ保存APIエンドポイント
@app.route('/save', methods=['POST'])
def save_data():
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
        print(f"保存エラー: {e}")
        return jsonify({"error": str(e)}), 400
    finally:
        session.close()

# ヘルスチェックエンドポイント
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # DB接続確認
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "database": "disconnected", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)