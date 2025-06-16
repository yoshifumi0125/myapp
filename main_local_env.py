from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from datetime import datetime
import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

app = Flask(__name__, static_folder='dist')
CORS(app, origins=[os.getenv('FRONTEND_URL', 'http://localhost:5173')])

# データベース接続設定
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'saas1')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'yoshi2003')
DB_NAME = os.getenv('DB_NAME', 'saas1')
DB_PORT = os.getenv('DB_PORT', '3306')

# データベースURI構築
DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# データベース接続テスト
try:
    engine = create_engine(DATABASE_URI)
    # 接続テスト
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print(f"✅ データベース接続成功: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    SessionLocal = sessionmaker(bind=engine)
    Base = declarative_base()
    db_connected = True
except OperationalError as e:
    print(f"⚠️  データベース接続エラー: {e}")
    print("データベースなしでアプリケーションを起動します（APIは利用できません）")
    engine = None
    SessionLocal = None
    Base = declarative_base()
    db_connected = False

# テーブル定義
class Customer(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    plan = Column(String(255))
    mrr = Column(Integer)
    initial_fee = Column(Integer)
    operation_fee = Column(Integer)
    assignee = Column(String(255))
    hours = Column(Integer)
    region = Column(String(255))
    industry = Column(String(255))
    channel = Column(String(255))
    status = Column(String(50))
    start_date = Column(String(20))
    health_score = Column(Integer)
    last_login = Column(String(20))
    support_tickets = Column(Integer)
    nps_score = Column(Integer)
    usage_rate = Column(Integer)
    churn_date = Column(String(20), nullable=True)

# テーブル作成（データベース接続がある場合のみ）
if db_connected:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ テーブルが確認/作成されました")
    except Exception as e:
        print(f"テーブル作成エラー: {e}")

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# ヘルスチェックエンドポイント
@app.route('/health', methods=['GET'])
def health_check():
    if not db_connected:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': 'Database connection not available'
        }), 500
    
    try:
        session = SessionLocal()
        session.execute(text("SELECT 1"))
        session.close()
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500

# 顧客データ保存APIエンドポイント
@app.route('/save', methods=['POST'])
def save_data():
    if not db_connected:
        return jsonify({
            'status': 'error',
            'message': 'Database connection not available'
        }), 503
    
    data = request.get_json()
    print("Received data:", data)

    session = SessionLocal()
    try:
        # 新しい顧客データを作成
        customer = Customer(
            name=data.get('name'),
            plan=data.get('plan'),
            mrr=data.get('mrr', 0),
            initial_fee=data.get('initialFee', 0),
            operation_fee=data.get('operationFee', 0),
            assignee=data.get('assignee'),
            hours=data.get('hours', 0),
            region=data.get('region'),
            industry=data.get('industry'),
            channel=data.get('channel'),
            status=data.get('status', 'active'),
            start_date=data.get('startDate'),
            health_score=data.get('healthScore', 50),
            last_login=data.get('lastLogin', datetime.now().strftime('%Y/%m/%d')),
            support_tickets=data.get('supportTickets', 0),
            nps_score=data.get('npsScore', 7),
            usage_rate=data.get('usageRate', 50),
            churn_date=data.get('churnDate')
        )
        
        session.add(customer)
        session.commit()
        
        print(f"✅ 顧客データ保存成功: {customer.name}")
        return jsonify({
            'status': 'success',
            'message': 'Customer data saved successfully',
            'customer_id': customer.id
        })
    except Exception as e:
        session.rollback()
        print(f"エラー: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        session.close()

# 顧客データ取得APIエンドポイント
@app.route('/customers', methods=['GET'])
def get_customers():
    if not db_connected:
        return jsonify({
            'status': 'error',
            'message': 'Database connection not available',
            'customers': []
        }), 503
    
    session = SessionLocal()
    try:
        customers = session.query(Customer).all()
        customer_list = []
        for customer in customers:
            customer_list.append({
                'id': customer.id,
                'name': customer.name,
                'plan': customer.plan,
                'mrr': customer.mrr,
                'initialFee': customer.initial_fee,
                'operationFee': customer.operation_fee,
                'assignee': customer.assignee,
                'hours': customer.hours,
                'region': customer.region,
                'industry': customer.industry,
                'channel': customer.channel,
                'status': customer.status,
                'startDate': customer.start_date,
                'healthScore': customer.health_score,
                'lastLogin': customer.last_login,
                'supportTickets': customer.support_tickets,
                'npsScore': customer.nps_score,
                'usageRate': customer.usage_rate,
                'churnDate': customer.churn_date
            })
        
        return jsonify({
            'status': 'success',
            'customers': customer_list
        })
    except Exception as e:
        print(f"エラー: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'customers': []
        }), 500
    finally:
        session.close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"✅ Flask server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)