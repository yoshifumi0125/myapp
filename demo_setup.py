#!/usr/bin/env python3
"""
Demo環境セットアップスクリプト
SaaS管理システムのデモ用データを作成します
"""

import requests
import json
from datetime import datetime, timedelta
import random

# デモ環境のURL
DEMO_URL = "https://total-handler-244211.de.r.appspot.com"
# ローカル環境の場合は以下に変更
# DEMO_URL = "http://localhost:8080"

# デモ用顧客データ
DEMO_CUSTOMERS = [
    {
        "name": "株式会社サンプルテック",
        "plan": "enterprise",
        "mrr": 300000,
        "initial_fee": 500000,
        "operation_fee": 150000,
        "assignee": "田中太郎",
        "hours": 40,
        "region": "関東",
        "industry": "IT",
        "channel": "紹介",
        "status": "active",
        "contract_date": (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
    },
    {
        "name": "デモ商事株式会社",
        "plan": "professional",
        "mrr": 150000,
        "initial_fee": 200000,
        "operation_fee": 80000,
        "assignee": "佐藤花子",
        "hours": 20,
        "region": "関西",
        "industry": "小売業",
        "channel": "Web検索",
        "status": "active",
        "contract_date": (datetime.now() - timedelta(days=120)).strftime("%Y-%m-%d")
    },
    {
        "name": "テスト製造株式会社",
        "plan": "starter",
        "mrr": 50000,
        "initial_fee": 100000,
        "operation_fee": 0,
        "assignee": "山田次郎",
        "hours": 10,
        "region": "中部",
        "industry": "製造業",
        "channel": "イベント",
        "status": "trial",
        "contract_date": (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")
    },
    {
        "name": "サンプル金融サービス",
        "plan": "enterprise",
        "mrr": 400000,
        "initial_fee": 800000,
        "operation_fee": 200000,
        "assignee": "田中太郎",
        "hours": 60,
        "region": "関東",
        "industry": "金融",
        "channel": "パートナー",
        "status": "active",
        "contract_date": (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    },
    {
        "name": "デモヘルスケア株式会社",
        "plan": "professional",
        "mrr": 120000,
        "initial_fee": 150000,
        "operation_fee": 60000,
        "assignee": "佐藤花子",
        "hours": 15,
        "region": "九州",
        "industry": "医療",
        "channel": "広告",
        "status": "active",
        "contract_date": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    }
]

# デモ用経費データ
DEMO_EXPENSES = [
    {
        "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
        "name": f"Google Ads キャンペーン{i//7 + 1}",
        "category": "広告宣伝費",
        "subcategory": "Web広告",
        "amount": random.randint(100000, 300000)
    }
    for i in range(0, 30, 7)
] + [
    {
        "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
        "name": f"開発外注費 - {['フロントエンド', 'バックエンド', 'インフラ'][i % 3]}",
        "category": "業務委託費",
        "subcategory": "開発外注",
        "amount": random.randint(200000, 500000)
    }
    for i in range(5, 25, 10)
] + [
    {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "name": "役員報酬",
        "category": "人件費",
        "subcategory": "役員報酬",
        "amount": 1500000
    }
]

def setup_demo_data():
    """デモデータをセットアップ"""
    print("=== SaaS管理システム デモ環境セットアップ ===")
    print(f"URL: {DEMO_URL}")
    print("")
    
    # 顧客データの投入
    print("顧客データを作成中...")
    for i, customer in enumerate(DEMO_CUSTOMERS, 1):
        try:
            response = requests.post(
                f"{DEMO_URL}/save",
                json=customer,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"  ✓ {customer['name']} を追加しました")
            else:
                print(f"  ✗ {customer['name']} の追加に失敗: {response.text}")
        except Exception as e:
            print(f"  ✗ エラー: {e}")
    
    print("")
    print("経費データを作成中...")
    # 経費データの投入
    for i, expense in enumerate(DEMO_EXPENSES, 1):
        try:
            response = requests.post(
                f"{DEMO_URL}/save_expense",
                json=expense,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                print(f"  ✓ {expense['name']} を追加しました")
            else:
                print(f"  ✗ {expense['name']} の追加に失敗: {response.text}")
        except Exception as e:
            print(f"  ✗ エラー: {e}")
    
    print("")
    print("=== デモ環境のセットアップが完了しました ===")
    print(f"以下のURLでアクセスできます: {DEMO_URL}")
    print("")
    print("【デモ環境の主な機能】")
    print("1. ダッシュボード: MRR、契約者数、年間経常収益などの主要指標")
    print("2. 営業管理: 顧客一覧、新規追加、インポート/エクスポート")
    print("3. 財務管理: 収支状況、経費管理、月次推移")
    print("4. 分析: CAC/LTV分析、プラン別パフォーマンス")
    print("5. サブスクリプション分析: チャーン率、リテンション、MRR予測")

if __name__ == "__main__":
    setup_demo_data()