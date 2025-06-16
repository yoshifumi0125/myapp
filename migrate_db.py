import pymysql

def migrate_database():
    """Add missing columns to the customers table"""
    try:
        connection = pymysql.connect(
            host="35.232.151.129",
            user="saas1",
            password="yoshi2003",
            database="saas1",
            connect_timeout=5
        )
        
        with connection.cursor() as cursor:
            # List of columns to add with their types and defaults
            columns_to_add = [
                ("initial_fee", "INT DEFAULT 0"),
                ("operation_fee", "INT DEFAULT 0"),
                ("hours", "INT DEFAULT 0"),
                ("region", "VARCHAR(255)"),
                ("industry", "VARCHAR(255)"),
                ("channel", "VARCHAR(255)"),
                ("status", "VARCHAR(255) DEFAULT 'active'"),
                ("contract_date", "VARCHAR(255)"),
                ("health_score", "INT DEFAULT 70"),
                ("last_login", "VARCHAR(255)"),
                ("support_tickets", "INT DEFAULT 0"),
                ("nps_score", "INT DEFAULT 7"),
                ("usage_rate", "INT DEFAULT 50"),
                ("churn_date", "VARCHAR(255)")
            ]
            
            # Check existing columns
            cursor.execute("DESCRIBE customers")
            existing_columns = [col[0] for col in cursor.fetchall()]
            print(f"Existing columns: {existing_columns}")
            
            # Add missing columns
            for col_name, col_definition in columns_to_add:
                if col_name not in existing_columns:
                    try:
                        sql = f"ALTER TABLE customers ADD COLUMN {col_name} {col_definition}"
                        print(f"Adding column: {col_name}")
                        cursor.execute(sql)
                        connection.commit()
                        print(f"✅ Added column: {col_name}")
                    except Exception as e:
                        print(f"❌ Error adding column {col_name}: {e}")
                        connection.rollback()
                else:
                    print(f"⏭️  Column {col_name} already exists")
            
            print("\n✅ Migration completed!")
            
            # Show updated schema
            cursor.execute("DESCRIBE customers")
            columns = cursor.fetchall()
            print("\nUpdated schema:")
            print("-" * 60)
            for col in columns:
                print(f"Field: {col[0]:<20} Type: {col[1]:<20} Null: {col[2]}")
            print("-" * 60)
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Migration error: {e}")

if __name__ == "__main__":
    print("🔄 Starting database migration...\n")
    migrate_database()