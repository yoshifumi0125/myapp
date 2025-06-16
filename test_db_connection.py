import pymysql
import sys

def test_connection(host, user, password, database):
    """データベース接続をテスト"""
    try:
        print(f"接続テスト中: {user}@{host}/{database}")
        
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            connect_timeout=5
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ 接続成功！ Result: {result}")
            
            # テーブル一覧を表示
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"テーブル一覧: {tables}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 接続失敗: {e}")
        return False

if __name__ == "__main__":
    print("=== Cloud SQL 接続テスト ===\n")
    
    # 1. Cloud SQL Proxy 経由
    print("1. Cloud SQL Proxy 経由での接続:")
    test_connection(
        host="localhost",
        user="saas1",
        password="yoshi2003",
        database="saas1"
    )
    
    print("\n" + "="*40 + "\n")
    
    # 2. 直接接続
    print("2. 直接接続:")
    test_connection(
        host="35.232.151.129",
        user="saas1",
        password="yoshi2003",
        database="saas1"
    )