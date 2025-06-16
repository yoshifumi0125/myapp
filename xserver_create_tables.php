<?php
/**
 * Xserver MySQL テーブル作成スクリプト
 */
require_once 'xserver_db_connection.php';

try {
    $pdo = getXserverConnection();
    echo "データベース接続成功\n\n";
    
    // 既存のテーブルを確認
    echo "📋 既存のテーブル一覧:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($existingTables) > 0) {
        foreach ($existingTables as $table) {
            echo "  - $table\n";
        }
    } else {
        echo "  テーブルがありません\n";
    }
    echo "\n";
    
    // customersテーブル作成
    $createCustomersTable = "
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($createCustomersTable);
    echo "✅ customersテーブルを作成しました\n";
    
    // messagesテーブル作成
    $createMessagesTable = "
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($createMessagesTable);
    echo "✅ messagesテーブルを作成しました\n";
    
    // ordersテーブル作成（オプション）
    $createOrdersTable = "
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        INDEX idx_order_number (order_number),
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($createOrdersTable);
    echo "✅ ordersテーブルを作成しました\n";
    
    // サンプルデータ挿入
    echo "\n📝 サンプルデータを挿入中...\n";
    
    // 顧客データ
    $customers = [
        ['name' => '山田太郎', 'email' => 'yamada@example.com', 'phone' => '090-1234-5678', 'company' => '山田商事'],
        ['name' => '佐藤花子', 'email' => 'sato@example.com', 'phone' => '080-2345-6789', 'company' => '佐藤工業'],
        ['name' => '鈴木一郎', 'email' => 'suzuki@example.com', 'phone' => '070-3456-7890', 'company' => '鈴木システム'],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, company) VALUES (:name, :email, :phone, :company)");
    
    foreach ($customers as $customer) {
        try {
            $stmt->execute($customer);
            echo "  ✅ 顧客追加: {$customer['name']}\n";
        } catch (PDOException $e) {
            if ($e->getCode() == '23000') {
                echo "  ⚠️  顧客スキップ（既存）: {$customer['email']}\n";
            } else {
                throw $e;
            }
        }
    }
    
    // メッセージデータ
    $messages = [
        ['customer_id' => 1, 'subject' => 'お問い合わせ', 'message' => '製品について質問があります。'],
        ['customer_id' => 2, 'subject' => '見積もり依頼', 'message' => '新規プロジェクトの見積もりをお願いします。'],
        ['customer_id' => 3, 'subject' => 'サポート依頼', 'message' => 'システムエラーが発生しています。'],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO messages (customer_id, subject, message) VALUES (:customer_id, :subject, :message)");
    
    foreach ($messages as $message) {
        try {
            $stmt->execute($message);
            echo "  ✅ メッセージ追加: {$message['subject']}\n";
        } catch (PDOException $e) {
            echo "  ⚠️  メッセージ追加エラー: " . $e->getMessage() . "\n";
        }
    }
    
    // テーブル情報表示
    echo "\n📊 テーブル構造:\n";
    $tables = ['customers', 'messages', 'orders'];
    
    foreach ($tables as $table) {
        echo "\n【{$table}テーブル】\n";
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll();
        
        foreach ($columns as $column) {
            echo sprintf("  %-20s %-20s %s %s\n", 
                $column['Field'], 
                $column['Type'], 
                $column['Null'] === 'NO' ? 'NOT NULL' : 'NULL',
                $column['Key'] === 'PRI' ? '(PRIMARY KEY)' : ''
            );
        }
        
        // レコード数確認
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch();
        echo "  レコード数: {$count['count']}\n";
    }
    
    echo "\n✨ セットアップ完了！\n";
    
} catch (PDOException $e) {
    echo "❌ エラー: " . $e->getMessage() . "\n";
    exit(1);
}
?>