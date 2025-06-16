import pymysql

def check_schema():
    """Check the actual database schema"""
    try:
        connection = pymysql.connect(
            host="35.232.151.129",
            user="saas1",
            password="yoshi2003",
            database="saas1",
            connect_timeout=5
        )
        
        with connection.cursor() as cursor:
            # Check if customers table exists
            cursor.execute("SHOW TABLES LIKE 'customers'")
            result = cursor.fetchone()
            
            if result:
                print("✅ 'customers' table exists")
                
                # Get column information
                cursor.execute("DESCRIBE customers")
                columns = cursor.fetchall()
                
                print("\nColumns in customers table:")
                print("-" * 60)
                for col in columns:
                    print(f"Field: {col[0]:<20} Type: {col[1]:<20} Null: {col[2]}")
                print("-" * 60)
                
                # Get sample data
                cursor.execute("SELECT * FROM customers LIMIT 5")
                rows = cursor.fetchall()
                
                if rows:
                    print("\nSample data:")
                    for row in rows:
                        print(row)
                else:
                    print("\nNo data in customers table")
            else:
                print("❌ 'customers' table does not exist")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_schema()