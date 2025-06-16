<?php
/**
 * Xserver データベース状態確認スクリプト
 */
require_once 'xserver_db_connection.php';

try {
    $pdo = getXserverConnection();
    echo "✅ データベース接続成功\n";
    echo "データベース: yoshifumik_sass1\n\n";
    
    // テーブル一覧取得
    echo "📋 現在のテーブル一覧:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) === 0) {
        echo "  ⚠️  テーブルが存在しません\n";
        echo "\n以下のコマンドでテーブルを作成してください:\n";
        echo "  php xserver_create_tables.php\n";
    } else {
        foreach ($tables as $table) {
            // テーブル情報取得
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $stmt->fetch();
            
            echo "  ▸ $table (レコード数: {$count['count']})\n";
            
            // カラム情報取得
            $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
            $columns = $stmt->fetchAll();
            
            foreach ($columns as $column) {
                $key = '';
                if ($column['Key'] === 'PRI') $key = ' [PRIMARY KEY]';
                if ($column['Key'] === 'UNI') $key = ' [UNIQUE]';
                if ($column['Key'] === 'MUL') $key = ' [INDEX]';
                
                echo "    - {$column['Field']} ({$column['Type']})$key\n";
            }
            echo "\n";
        }
    }
    
    // データベースサイズ確認
    $stmt = $pdo->prepare("
        SELECT 
            table_schema AS 'Database',
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
        FROM information_schema.tables 
        WHERE table_schema = :database
        GROUP BY table_schema
    ");
    $stmt->execute(['database' => 'yoshifumik_sass1']);
    $dbSize = $stmt->fetch();
    
    if ($dbSize) {
        echo "💾 データベースサイズ: {$dbSize['Size (MB)']} MB\n";
    }
    
    // 文字セット確認
    $stmt = $pdo->query("SHOW VARIABLES LIKE 'character_set%'");
    $charsets = $stmt->fetchAll();
    
    echo "\n🔤 文字セット設定:\n";
    foreach ($charsets as $charset) {
        if (in_array($charset['Variable_name'], ['character_set_client', 'character_set_connection', 'character_set_database'])) {
            echo "  {$charset['Variable_name']}: {$charset['Value']}\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ エラー: " . $e->getMessage() . "\n";
    
    // エラーコードによる詳細メッセージ
    if ($e->getCode() == '42S02') {
        echo "\nテーブルが存在しません。以下のコマンドでテーブルを作成してください:\n";
        echo "  php xserver_create_tables.php\n";
    } elseif ($e->getCode() == '42000') {
        echo "\nSQL構文エラーです。クエリを確認してください。\n";
    } elseif ($e->getCode() == '28000') {
        echo "\n認証エラーです。ユーザー名とパスワードを確認してください。\n";
    } elseif ($e->getCode() == 'HY000') {
        echo "\nデータベース接続エラーです。ホスト名とデータベース名を確認してください。\n";
    }
    
    exit(1);
}
?>