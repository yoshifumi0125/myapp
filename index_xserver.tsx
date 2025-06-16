// Xserver用に修正されたindex.tsx
// APIエンドポイントを環境変数から取得するように変更

// 環境変数からAPIベースURLを取得（ビルド時に注入）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

// 既存のコードは省略...

// saveToDatabase関数の修正例（422行目付近）
async function saveToDatabase(customerData: any) {
    try {
        // ハードコードされたURLを環境変数ベースに変更
        const response = await fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'サーバーエラーが発生しました');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Database save error:', error);
        throw error;
    }
}

// loadCustomersFromDatabase関数も同様に修正
async function loadCustomersFromDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customers`);
        if (!response.ok) {
            throw new Error('Failed to fetch customers');
        }
        const customers = await response.json();
        return customers;
    } catch (error) {
        console.error('Error loading customers:', error);
        return [];
    }
}

// deleteCustomerFromDatabase関数も同様に修正
async function deleteCustomerFromDatabase(customerId: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete customer');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
}

// その他のAPI呼び出しも同様にAPI_BASE_URLを使用するように修正