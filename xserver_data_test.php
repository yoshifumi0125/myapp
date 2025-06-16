<?php
/**
 * Xserver データ保存テストページ
 */
header('Content-Type: text/html; charset=utf-8');

$config = [
    'host' => 'localhost',
    'username' => 'yoshifumik_1lt67',
    'password' => 'yoshi2003',
    'database' => 'yoshifumik_sass1',
    'charset' => 'utf8mb4'
];

$message = '';
$customers = [];

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // データ追加処理
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, company) VALUES (:name, :email, :phone, :company)");
            $stmt->execute([
                'name' => $_POST['name'],
                'email' => $_POST['email'],
                'phone' => $_POST['phone'],
                'company' => $_POST['company']
            ]);
            $message = '<div class="success">✅ データを保存しました！</div>';
        } elseif ($_POST['action'] === 'delete' && isset($_POST['id'])) {
            $stmt = $pdo->prepare("DELETE FROM customers WHERE id = :id");
            $stmt->execute(['id' => $_POST['id']]);
            $message = '<div class="success">✅ データを削除しました！</div>';
        }
    }
    
    // 顧客一覧取得
    $customers = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC")->fetchAll();
    
} catch (PDOException $e) {
    $message = '<div class="error">❌ エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xserver データ保存テスト</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], input[type="email"], input[type="tel"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
        }
        .button:hover {
            background-color: #45a049;
        }
        .button-delete {
            background-color: #f44336;
            padding: 5px 10px;
            font-size: 14px;
        }
        .button-delete:hover {
            background-color: #da190b;
        }
        .success {
            color: #4CAF50;
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            color: #f44336;
            background: #ffebee;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .info-box {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Xserver データ保存テスト</h1>
        
        <div class="info-box">
            📍 データベース: <strong>yoshifumik_sass1</strong><br>
            📋 テーブル: <strong>customers</strong><br>
            🔢 現在のレコード数: <strong><?php echo count($customers); ?></strong>件
        </div>
        
        <?php echo $message; ?>
        
        <h2>新規顧客追加</h2>
        <form method="post">
            <input type="hidden" name="action" value="add">
            
            <div class="form-group">
                <label for="name">名前 *</label>
                <input type="text" id="name" name="name" required placeholder="山田太郎">
            </div>
            
            <div class="form-group">
                <label for="email">メールアドレス *</label>
                <input type="email" id="email" name="email" required placeholder="yamada@example.com">
            </div>
            
            <div class="form-group">
                <label for="phone">電話番号</label>
                <input type="tel" id="phone" name="phone" placeholder="090-1234-5678">
            </div>
            
            <div class="form-group">
                <label for="company">会社名</label>
                <input type="text" id="company" name="company" placeholder="株式会社山田">
            </div>
            
            <button type="submit" class="button">保存する</button>
        </form>
        
        <h2>顧客一覧</h2>
        <?php if (count($customers) > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>名前</th>
                        <th>メール</th>
                        <th>電話</th>
                        <th>会社</th>
                        <th>登録日</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($customers as $customer): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($customer['id']); ?></td>
                            <td><?php echo htmlspecialchars($customer['name']); ?></td>
                            <td><?php echo htmlspecialchars($customer['email']); ?></td>
                            <td><?php echo htmlspecialchars($customer['phone'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($customer['company'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($customer['created_at']); ?></td>
                            <td>
                                <form method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $customer['id']; ?>">
                                    <button type="submit" class="button button-delete" 
                                            onclick="return confirm('削除してもよろしいですか？')">削除</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p>データがありません。上のフォームから追加してください。</p>
        <?php endif; ?>
    </div>
</body>
</html>