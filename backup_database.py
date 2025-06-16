#!/usr/bin/env python3
"""
Google Cloud SQLデータベースのバックアップ（Python版）
"""
import pymysql
import json
from datetime import datetime
import os

# データベース設定
DB_CONFIG = {
    'host': '35.232.151.129',
    'user': 'saas1',
    'password': 'yoshi2003',
    'database': 'saas1',
    'charset': 'utf8mb4'
}

def backup_database():
    """データベースをJSONとSQLファイルにバックアップ"""
    backup_dir = './backups'
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    try:
        # データベース接続
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("データベースバックアップを開始します...")
        print(f"接続先: {DB_CONFIG['host']}")
        print(f"データベース: {DB_CONFIG['database']}")
        
        # テーブル一覧取得
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        print(f"\nテーブル数: {len(tables)}")
        
        # 全データを取得
        backup_data = {}
        total_records = 0
        
        for table in tables:
            cursor.execute(f"SELECT * FROM {table}")
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            backup_data[table] = {
                'columns': columns,
                'data': []
            }
            
            for row in rows:
                record = dict(zip(columns, row))
                backup_data[table]['data'].append(record)
            
            print(f"  - {table}: {len(rows)}件")
            total_records += len(rows)
        
        # JSONファイルとして保存
        json_file = f"{backup_dir}/saas_backup_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"\n✅ JSONバックアップ完了: {json_file}")
        print(f"総レコード数: {total_records}")
        
        # SQLファイルも作成
        sql_file = f"{backup_dir}/saas_backup_{timestamp}.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            # データベース作成
            f.write(f"-- Backup created at {datetime.now()}\n")
            f.write(f"-- Source: {DB_CONFIG['host']}/{DB_CONFIG['database']}\n\n")
            f.write(f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}`;\n")
            f.write(f"USE `{DB_CONFIG['database']}`;\n\n")
            
            # 各テーブルのCREATE文とINSERT文を生成
            for table in tables:
                # CREATE TABLE文を取得
                cursor.execute(f"SHOW CREATE TABLE {table}")
                create_statement = cursor.fetchone()[1]
                f.write(f"-- Table: {table}\n")
                f.write(f"DROP TABLE IF EXISTS `{table}`;\n")
                f.write(f"{create_statement};\n\n")
                
                # INSERT文を生成
                if backup_data[table]['data']:
                    columns = backup_data[table]['columns']
                    f.write(f"-- Data for {table}\n")
                    
                    for record in backup_data[table]['data']:
                        values = []
                        for col in columns:
                            val = record[col]
                            if val is None:
                                values.append('NULL')
                            elif isinstance(val, (int, float)):
                                values.append(str(val))
                            else:
                                # エスケープ処理
                                val_escaped = str(val).replace("'", "''")
                                values.append(f"'{val_escaped}'")
                        
                        values_str = ', '.join(values)
                        f.write(f"INSERT INTO `{table}` (`{'`, `'.join(columns)}`) VALUES ({values_str});\n")
                    
                    f.write("\n")
        
        print(f"✅ SQLバックアップ完了: {sql_file}")
        
        # 接続を閉じる
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"\n❌ バックアップエラー: {e}")
        return False

if __name__ == "__main__":
    # backupsディレクトリがなければ作成
    os.makedirs('./backups', exist_ok=True)
    
    # バックアップ実行
    success = backup_database()
    
    if success:
        print("\n✅ バックアップが正常に完了しました")
    else:
        print("\n❌ バックアップに失敗しました")
        exit(1)