import requests
import json

# テストデータ
test_customer = {
    "newCustomerName": "テスト会社",
    "newCustomerPlan": "starter",
    "newCustomerMrr": "30000",
    "newCustomerAssignee": "田中太郎",
    "newCustomerInitialFee": "100000",
    "newCustomerOperationFee": "50000",
    "newCustomerHours": "10",
    "newCustomerRegion": "関東",
    "newCustomerIndustry": "IT",
    "newCustomerChannel": "Web検索"
}

# ローカルサーバーへのPOSTリクエスト
try:
    response = requests.post(
        'http://localhost:8080/save',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(test_customer)
    )
    
    print(f"ステータスコード: {response.status_code}")
    print(f"レスポンス: {response.text}")
    
    if response.status_code == 200:
        print("✅ データ保存成功！")
    else:
        print("❌ データ保存失敗")
        
except requests.exceptions.ConnectionError:
    print("❌ サーバーに接続できません。Flaskアプリが起動していることを確認してください。")
except Exception as e:
    print(f"❌ エラー: {e}")