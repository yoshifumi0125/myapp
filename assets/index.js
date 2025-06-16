// Global data store
const dataStore = {
    customers: [],
    expenses: [],
    campaigns: [],
    leads: []
};
// Global charts object
const charts = {};
// --- Data Loading Functions ---
async function loadCustomersFromAPI() {
    try {
        const response = await fetch('/customers');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const customers = await response.json();
        // Transform database format to match our interface if needed
        dataStore.customers = customers.map((customer) => ({
            id: customer.id,
            name: customer.name || '',
            plan: customer.plan || 'starter',
            mrr: customer.mrr || 0,
            initialFee: customer.initial_fee || 0,
            operationFee: customer.operation_fee || 0,
            assignee: customer.assignee || '',
            hours: customer.hours || 0,
            region: customer.region || '',
            industry: customer.industry || '',
            channel: customer.channel || '',
            status: customer.status || 'active',
            startDate: customer.contract_date || new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
            healthScore: customer.health_score || 70,
            lastLogin: customer.last_login || new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
            supportTickets: customer.support_tickets || 0,
            npsScore: customer.nps_score || 7,
            usageRate: customer.usage_rate || 50,
            churnDate: customer.churn_date
        }));
        // Update UI after loading
        const activeTab = document.querySelector('.nav-tab.active')?.getAttribute('data-tab-target');
        if (activeTab === 'home')
            updateDashboard();
        else if (activeTab === 'sales')
            renderCustomersTable();
        else if (activeTab === 'finance')
            updateFinanceMetrics();
        return true;
    }
    catch (error) {
        console.error('Error loading customers:', error);
        showNotification('顧客データの読み込みに失敗しました', 'error');
        // Fall back to empty data
        dataStore.customers = [];
        return false;
    }
}
// --- Sample Data Initialization ---
function initializeSampleData() {
    // Initialize empty data store - actual data will be loaded from API
    dataStore.customers = [];
    dataStore.expenses = [
        { id: 1, date: '2025/05/28', name: 'LinkedIn広告費', category: '広告宣伝費', subcategory: 'SNS広告', amount: 200000, status: 'approved' },
        { id: 2, date: '2025/05/25', name: 'Google Ads広告費', category: '広告宣伝費', subcategory: 'Web広告', amount: 150000, status: 'approved' },
        { id: 3, date: '2025/05/24', name: 'AWS開発環境構築', category: '研究開発費', subcategory: '開発ツール', amount: 85000, status: 'approved' },
        { id: 4, date: '2025/05/23', name: 'マーケティング支援業務', category: '業務委託費', subcategory: 'マーケティング委託', amount: 120000, status: 'approved' },
        { id: 5, date: '2025/05/20', name: '役員報酬', category: '人件費', subcategory: '役員報酬', amount: 800000, status: 'approved' },
        { id: 6, date: '2025/05/20', name: '正社員給与', category: '人件費', subcategory: '正社員給与', amount: 1500000, status: 'approved' },
        { id: 7, date: '2025/05/15', name: '新規事業調査費', category: '予備投資費', subcategory: '新規事業開発', amount: 250000, status: 'approved' },
        { id: 8, date: '2025/05/10', name: '製品開発費', category: '研究開発費', subcategory: '製品開発', amount: 300000, status: 'approved' },
        { id: 9, date: '2025/05/05', name: 'エンジニア業務委託', category: '業務委託費', subcategory: '開発委託', amount: 450000, status: 'approved' },
        { id: 10, date: '2025/04/25', name: 'Facebook広告費', category: '広告宣伝費', subcategory: 'SNS広告', amount: 120000, status: 'approved' },
        { id: 11, date: '2025/04/20', name: '役員報酬', category: '人件費', subcategory: '役員報酬', amount: 800000, status: 'approved' },
        { id: 12, date: '2025/04/20', name: '正社員給与', category: '人件費', subcategory: '正社員給与', amount: 1400000, status: 'approved' },
        { id: 13, date: '2025/04/15', name: 'デザイン制作委託', category: '業務委託費', subcategory: 'デザイン委託', amount: 180000, status: 'approved' },
        { id: 14, date: '2025/04/10', name: 'コンテンツ制作費', category: '広告宣伝費', subcategory: 'コンテンツマーケティング', amount: 250000, status: 'approved' },
        { id: 15, date: '2025/03/25', name: 'リスティング広告費', category: '広告宣伝費', subcategory: 'Web広告', amount: 180000, status: 'approved' },
        { id: 16, date: '2025/03/20', name: '役員報酬', category: '人件費', subcategory: '役員報酬', amount: 800000, status: 'approved' },
        { id: 17, date: '2025/03/20', name: '正社員給与', category: '人件費', subcategory: '正社員給与', amount: 1300000, status: 'approved' },
        { id: 18, date: '2025/03/15', name: 'イベント出展費', category: '広告宣伝費', subcategory: 'イベント・展示会', amount: 350000, status: 'approved' },
        { id: 19, date: '2025/03/10', name: 'サーバー費用', category: '研究開発費', subcategory: '開発ツール', amount: 120000, status: 'approved' }
    ];
    dataStore.campaigns = [
        { id: 1, name: '春の新規獲得キャンペーン', channel: 'Google Ads', budget: 500000, spent: 320000, leads: 45, conversions: 8, startDate: '2025/04/01', endDate: '2025/05/31', status: 'active' },
        { id: 2, name: 'LinkedInターゲティング広告', channel: 'LinkedIn', budget: 300000, spent: 280000, leads: 23, conversions: 5, startDate: '2025/05/01', endDate: '2025/06/30', status: 'active' },
        { id: 3, name: 'メールナーチャリング', channel: 'Email', budget: 50000, spent: 30000, leads: 120, conversions: 12, startDate: '2025/03/01', endDate: '2025/05/31', status: 'active' }
    ];
    dataStore.leads = [
        { id: 1, company: 'XYZ株式会社', contact: '鈴木一郎', email: 'suzuki@xyz.co.jp', source: 'Google Ads', score: 85, status: 'hot', createdDate: '2025/05/25' },
        { id: 2, company: '123商事', contact: '高橋花子', email: 'takahashi@123.co.jp', source: 'LinkedIn', score: 70, status: 'warm', createdDate: '2025/05/24' },
        { id: 3, company: 'テクノロジー研究所', contact: '山本太郎', email: 'yamamoto@tech.co.jp', source: 'Webフォーム', score: 60, status: 'warm', createdDate: '2025/05/23' },
        { id: 4, company: 'グローバル商社', contact: '佐藤次郎', email: 'sato@global.co.jp', source: 'イベント', score: 90, status: 'hot', createdDate: '2025/05/22' },
        { id: 5, company: 'イノベーション株式会社', contact: '田中美穂', email: 'tanaka@innovation.co.jp', source: '紹介', score: 40, status: 'cold', createdDate: '2025/05/20' }
    ];
}
// --- Tab Switching ---
function switchTab(targetTabName, triggerElement) {
    const headerTabs = document.querySelectorAll('.nav-tab');
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    const contents = document.querySelectorAll('.tab-content');
    headerTabs.forEach(tab => tab.classList.remove('active'));
    sidebarIcons.forEach(icon => icon.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    const targetContent = document.getElementById(targetTabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    // Activate corresponding header tab
    const targetHeaderTab = document.querySelector(`.nav-tab[data-tab-target="${targetTabName}"]`);
    if (targetHeaderTab) {
        targetHeaderTab.classList.add('active');
    }
    // Activate corresponding sidebar icon
    const targetSidebarIcon = document.querySelector(`.sidebar-icon[data-tab-target="${targetTabName}"]`);
    if (targetSidebarIcon) {
        targetSidebarIcon.classList.add('active');
    }
    // If triggered by sidebar, also activate its header tab
    if (triggerElement && triggerElement.classList.contains('sidebar-icon')) {
        const headerTabForSidebar = document.querySelector(`.nav-tab[data-tab-target="${targetTabName}"]`);
        if (headerTabForSidebar)
            headerTabForSidebar.classList.add('active');
    }
    // Update data based on tab
    if (targetTabName === 'home')
        updateDashboard();
    else if (targetTabName === 'sales') {
        renderCustomersTable();
        updateBulkDeleteButtonState(); // Ensure button state is correct on tab switch
    }
    else if (targetTabName === 'marketing')
        updateMarketing();
    else if (targetTabName === 'customer-success')
        updateCustomerSuccess();
    else if (targetTabName === 'finance') {
        const now = new Date();
        document.getElementById('balanceViewYear').value = String(now.getFullYear());
        document.getElementById('balanceViewMonth').value = String(now.getMonth() + 1);
        updateFinanceMetrics();
        renderExpensesTable();
        if (!charts.monthlyBalance)
            initializeFinanceCharts();
        setTimeout(() => updateMonthlyBalanceChart(), 100);
    }
    else if (targetTabName === 'analytics')
        updateAnalytics();
    else if (targetTabName === 'subscription') {
        updateSubscription();
        if (!charts.cohortChart)
            initializeSubscriptionCharts(); // Check for specific chart
    }
    // 'integrations' tab currently has static content in HTML
}
// --- Dashboard Updates ---
function updateDashboard() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const totalMRR = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const totalARR = totalMRR * 12;
    const subscriberCount = activeCustomers.length;
    document.getElementById('totalMRR').textContent = `¥${totalMRR.toLocaleString()}`;
    document.getElementById('annualRunRate').textContent = `¥${totalARR.toLocaleString()}`;
    document.getElementById('subscriberCount').textContent = String(subscriberCount);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    let newBusinessMRR = 0;
    dataStore.customers.forEach(customer => {
        const startDate = new Date(customer.startDate.replace(/\//g, '-'));
        if (startDate.getMonth() === thisMonth && startDate.getFullYear() === thisYear && customer.status === 'active') {
            newBusinessMRR += customer.mrr;
        }
    });
    // Simplified expansion/contraction/churn for demo
    const expansionMRR = Math.round(totalMRR * 0.05); // 5% of MRR as expansion
    const contractionMRR = -Math.round(totalMRR * 0.01); // 1% as contraction
    const churnMRR = -Math.round(totalMRR * 0.02); // 2% as churn
    const netMRRChange = newBusinessMRR + expansionMRR + contractionMRR + churnMRR;
    document.getElementById('newBusinessMRR').textContent = `¥${newBusinessMRR.toLocaleString()}`;
    document.getElementById('expansionMRR').textContent = `¥${expansionMRR.toLocaleString()}`;
    document.getElementById('contractionMRR').textContent = `¥${Math.abs(contractionMRR).toLocaleString()}`;
    document.getElementById('churnMRR').textContent = `¥${Math.abs(churnMRR).toLocaleString()}`;
    document.getElementById('reactivationMRR').textContent = '¥0'; // Placeholder
    document.getElementById('netMRRChange').textContent = `¥${netMRRChange.toLocaleString()}`;
    document.getElementById('netMRRChange').style.color = netMRRChange >= 0 ? '#00c853' : '#ff3b30';
    document.getElementById('scheduledMRRChange').textContent = '¥50,000'; // Placeholder
    const lastMonthMRR = totalMRR - netMRRChange;
    const mrrGrowth = lastMonthMRR > 0 ? ((netMRRChange / lastMonthMRR) * 100) : (newBusinessMRR > 0 ? 100 : 0);
    const mrrChangeEl = document.getElementById('mrrChangePercent');
    mrrChangeEl.textContent = `${netMRRChange >= 0 ? '↑' : '↓'} ${Math.abs(mrrGrowth).toFixed(1)}% 前月比`;
    mrrChangeEl.className = `metric-change ${netMRRChange >= 0 ? 'positive' : 'negative'}`;
    const arrChangeEl = document.getElementById('arrChange');
    arrChangeEl.textContent = `${netMRRChange >= 0 ? '↑' : '↓'} ${Math.abs(mrrGrowth).toFixed(1)}% 過去30日間`;
    arrChangeEl.className = `metric-change ${netMRRChange >= 0 ? 'positive' : 'negative'}`;
    const newSubs = dataStore.customers.filter(c => {
        const sDate = new Date(c.startDate.replace(/\//g, '-'));
        return sDate.getMonth() === thisMonth && sDate.getFullYear() === thisYear;
    }).length;
    const subChangeEl = document.getElementById('subscriberChange');
    subChangeEl.textContent = `↑ ${newSubs} 新規`;
    subChangeEl.className = `metric-change positive`;
    updateTopWins();
    updateDashboardCharts();
}
function updateTopWins() {
    const topWinsContent = document.getElementById('topWinsContent');
    const recentCustomers = dataStore.customers
        .filter(c => c.status === 'active')
        .sort((a, b) => new Date(b.startDate.replace(/\//g, '-')).getTime() - new Date(a.startDate.replace(/\//g, '-')).getTime())
        .slice(0, 3);
    if (recentCustomers.length > 0) {
        topWinsContent.innerHTML = recentCustomers.map(customer => `
            <div style="padding: 12px 0; border-bottom: 1px solid #f5f5f5;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${customer.name}</strong>
                        <div style="font-size: 12px; color: #6f767e; margin-top: 4px;">
                            ${getPlanName(customer.plan)} - ¥${customer.mrr.toLocaleString()}/月
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #6f767e;">
                        ${customer.startDate}
                    </div>
                </div>
            </div>
        `).join('');
        if (recentCustomers.length < 3) {
            topWinsContent.innerHTML += `<div class="no-data" style="padding: 10px 0;">${3 - recentCustomers.length}件以上のデータを追加すると充実します</div>`;
        }
    }
    else {
        topWinsContent.innerHTML = '<div class="no-data">今週の成果はありません</div>';
    }
}
// --- Sales Tab Functions ---
function renderCustomersTable() {
    const tbody = document.getElementById('customerTableBody');
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const planFilter = document.getElementById('planFilterSales').value;
    const filteredCustomers = dataStore.customers.filter(customer => {
        const nameMatch = customer.name.toLowerCase().includes(searchTerm);
        const statusMatch = !statusFilter || customer.status === statusFilter;
        const planMatch = !planFilter || customer.plan === planFilter;
        return nameMatch && statusMatch && planMatch;
    });
    // Uncheck select all checkbox before rendering
    const selectAllCheckbox = document.getElementById('selectAllCustomersCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    if (filteredCustomers.length === 0) {
        if (dataStore.customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="14" class="no-data">顧客データがありません。</td></tr>`;
        }
        else {
            tbody.innerHTML = `<tr><td colspan="14" class="no-data">フィルター条件に一致する顧客がいません。</td></tr>`;
        }
        updateBulkDeleteButtonState(); // Ensure button is disabled if no data
        return;
    }
    tbody.innerHTML = filteredCustomers.map(customer => `
        <tr data-customer-id="${customer.id}">
            <td><input type="checkbox" class="customer-select-checkbox" data-customer-id="${customer.id}"></td>
            <td>${customer.name}</td>
            <td>${getPlanName(customer.plan)}</td>
            <td>¥${customer.mrr.toLocaleString()}</td>
            <td>¥${customer.initialFee.toLocaleString()}</td>
            <td>¥${customer.operationFee.toLocaleString()}</td>
            <td>${customer.assignee}</td>
            <td>${customer.hours}</td>
            <td>${customer.region}</td>
            <td>${customer.industry}</td>
            <td>${customer.channel}</td>
            <td>${getStatusBadge(customer.status)}</td>
            <td>${customer.startDate}</td>
            <td>
                <button class="btn btn-secondary btn-show-detail" data-customer-id="${customer.id}">詳細</button>
                <button class="btn btn-secondary btn-delete-customer" data-customer-id="${customer.id}" style="color: #ff3b30;">削除</button>
            </td>
        </tr>
    `).join('');
    updateBulkDeleteButtonState();
}
function showAddCustomerModal() {
    document.getElementById('addCustomerForm').reset();
    document.getElementById('addCustomerModal').classList.add('active');
}
// (window as any).showAddCustomerModal = showAddCustomerModal; // Assigned via event listener
function getNextCustomerId() {
    if (dataStore.customers.length === 0) {
        return 1;
    }
    return Math.max(...dataStore.customers.map(c => c.id)) + 1;
}
async function addCustomer() {
    const newCustomer = {
        name: document.getElementById('newCustomerName').value,
        plan: document.getElementById('newCustomerPlan').value,
        mrr: parseInt(document.getElementById('newCustomerMrr').value) || 0,
        initialFee: parseInt(document.getElementById('newCustomerInitialFee').value) || 0,
        operationFee: parseInt(document.getElementById('newCustomerOperationFee').value) || 0,
        assignee: document.getElementById('newCustomerAssignee').value,
        hours: parseInt(document.getElementById('newCustomerHours').value) || 0,
        region: document.getElementById('newCustomerRegion').value,
        industry: document.getElementById('newCustomerIndustry').value,
        channel: document.getElementById('newCustomerChannel').value,
        status: 'trial',
        startDate: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
        healthScore: 70,
        lastLogin: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
        supportTickets: 0,
        npsScore: 7,
        usageRate: 50
    };
    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCustomer)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // Add the new customer with the ID from the server
        const customerWithId = {
            ...newCustomer,
            id: result.id
        };
        dataStore.customers.push(customerWithId);
        closeModal('addCustomerModal');
        renderCustomersTable();
        updateDashboard();
        updateFinanceMetrics();
        showNotification('顧客を追加しました', 'success');
    }
    catch (error) {
        console.error('Error adding customer:', error);
        showNotification('顧客の追加に失敗しました', 'error');
    }
}
// (window as any).addCustomer = addCustomer; // Assigned via event listener
async function deleteCustomer(customerId) {
    if (confirm('この顧客を削除してもよろしいですか？')) {
        try {
            const response = await fetch(`/customers/${customerId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Remove from local data store
            dataStore.customers = dataStore.customers.filter(c => c.id !== customerId);
            renderCustomersTable(); // This will also call updateBulkDeleteButtonState
            updateDashboard();
            updateFinanceMetrics();
            showNotification('顧客を削除しました', 'success');
        }
        catch (error) {
            console.error('Error deleting customer:', error);
            showNotification('顧客の削除に失敗しました', 'error');
        }
    }
}
async function bulkDeleteCustomers(customerIds) {
    if (customerIds.length === 0) {
        showNotification('削除する顧客が選択されていません。', 'error');
        return;
    }
    if (confirm(`選択した ${customerIds.length} 件の顧客を削除してもよろしいですか？`)) {
        try {
            // Delete each customer via API
            const deletePromises = customerIds.map(id => fetch(`/customers/${id}`, { method: 'DELETE' }));
            const results = await Promise.allSettled(deletePromises);
            // Count successful deletions
            let successCount = 0;
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.ok) {
                    successCount++;
                    // Remove from local data store
                    dataStore.customers = dataStore.customers.filter(c => c.id !== customerIds[index]);
                }
            });
            renderCustomersTable(); // This will also call updateBulkDeleteButtonState
            updateDashboard();
            updateFinanceMetrics();
            if (successCount === customerIds.length) {
                showNotification(`${successCount} 件の顧客を削除しました`, 'success');
            }
            else {
                showNotification(`${successCount} 件の顧客を削除しました。${customerIds.length - successCount} 件は削除に失敗しました。`, 'warning');
            }
            // Ensure selectAll checkbox is unchecked
            const selectAllCheckbox = document.getElementById('selectAllCustomersCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
        }
        catch (error) {
            console.error('Error deleting customers:', error);
            showNotification('顧客の削除に失敗しました', 'error');
        }
    }
}
function showCustomerDetail(customerId) {
    const customer = dataStore.customers.find(c => c.id === customerId);
    if (customer) {
        const details = `顧客ID: ${customer.id}\n` +
            `会社名: ${customer.name}\n` +
            `プラン: ${getPlanName(customer.plan)}\n` +
            `MRR: ¥${customer.mrr.toLocaleString()}\n` +
            `初期費用: ¥${customer.initialFee.toLocaleString()}\n` +
            `運用代行費: ¥${customer.operationFee.toLocaleString()}\n` +
            `担当者: ${customer.assignee}\n` +
            `工数: ${customer.hours}h/月\n` +
            `地域: ${customer.region}\n` +
            `業界: ${customer.industry}\n` +
            `獲得チャネル: ${customer.channel}\n` +
            `ステータス: ${customer.status}\n` +
            `契約開始日: ${customer.startDate}\n` +
            `ヘルススコア: ${customer.healthScore}%\n` +
            `最終ログイン: ${customer.lastLogin}\n` +
            `サポートチケット: ${customer.supportTickets}\n` +
            `NPS: ${customer.npsScore}\n` +
            `利用率: ${customer.usageRate}%`;
        alert(details);
        showNotification(`${customer.name}の詳細情報を表示しました (コンソールに詳細)`, 'success');
        console.log("Customer Details:", customer);
    }
    else {
        showNotification(`顧客ID ${customerId} が見つかりません。`, 'error');
    }
}
function exportCustomers() {
    const headers = ['会社名', 'プラン', '月額料金', '初期費用', '運用代行費', '担当者', '工数', '地域', '業界', '獲得チャネル', 'ステータス', '契約開始日'];
    const rows = [headers.join(',')];
    dataStore.customers.forEach(customer => {
        const row = [
            customer.name, getPlanName(customer.plan), customer.mrr, customer.initialFee, customer.operationFee,
            customer.assignee, customer.hours, customer.region, customer.industry, customer.channel,
            customer.status, customer.startDate
        ];
        rows.push(row.join(','));
    });
    const csvContent = rows.join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // Added BOM for Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `顧客データ_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('顧客データをエクスポートしました', 'success');
}
// (window as any).exportCustomers = exportCustomers; // Assigned via event listener
function showImportModal() {
    document.getElementById('importModal').classList.add('active');
    // Reset file input
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}
// (window as any).showImportModal = showImportModal; // Assigned via event listener
function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            const lines = text.split('\n').map(line => line.trim()).filter(line => line); // Trim and remove empty lines
            if (lines.length <= 1) { // Only header or empty file
                showNotification('CSVファイルにデータがありません。', 'error');
                return;
            }
            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length < 12) {
                    console.warn(`Skipping row ${i + 1} due to insufficient columns: ${lines[i]}`);
                    continue;
                }
                const newCustomer = {
                    id: getNextCustomerId(),
                    name: values[0]?.trim() || '',
                    plan: values[1]?.trim() || 'starter',
                    mrr: parseInt(values[2]?.trim()) || 0,
                    initialFee: parseInt(values[3]?.trim()) || 0,
                    operationFee: parseInt(values[4]?.trim()) || 0,
                    assignee: values[5]?.trim() || '',
                    hours: parseInt(values[6]?.trim()) || 0,
                    region: values[7]?.trim() || '',
                    industry: values[8]?.trim() || '',
                    channel: values[9]?.trim() || '',
                    status: values[10]?.trim() || 'trial',
                    startDate: values[11]?.trim() || new Date().toLocaleDateString('ja-JP').replace(/-/g, '/'),
                    healthScore: 70, lastLogin: new Date().toLocaleDateString('ja-JP').replace(/-/g, '/'),
                    supportTickets: 0, npsScore: 7, usageRate: 50
                };
                if (newCustomer.name) {
                    dataStore.customers.push(newCustomer);
                    importedCount++;
                }
                else {
                    console.warn(`Skipping row ${i + 1} due to missing name: ${lines[i]}`);
                }
            }
            closeModal('importModal');
            renderCustomersTable();
            updateDashboard();
            updateFinanceMetrics();
            showNotification(`${importedCount}件のデータをインポートしました`, 'success');
        };
        reader.onerror = () => {
            showNotification('ファイル読み込みエラー', 'error');
        };
        reader.readAsText(file, 'UTF-8');
    }
    else {
        showNotification('CSVファイルを選択してください', 'error');
    }
}
function updateBulkDeleteButtonState() {
    const bulkDeleteButton = document.getElementById('bulkDeleteCustomersButton');
    if (!bulkDeleteButton)
        return;
    const selectedCheckboxes = document.querySelectorAll('.customer-select-checkbox:checked');
    if (selectedCheckboxes.length > 0) {
        bulkDeleteButton.disabled = false;
    }
    else {
        bulkDeleteButton.disabled = true;
    }
}
// --- Marketing Tab Functions ---
function updateMarketing() {
    const totalLeads = dataStore.leads.length;
    const conversions = dataStore.campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalSpent = dataStore.campaigns.reduce((sum, c) => sum + c.spent, 0);
    const conversionRate = totalLeads > 0 ? (conversions / totalLeads * 100).toFixed(1) : '0';
    const cpl = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;
    document.getElementById('totalLeads').textContent = String(totalLeads);
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
    document.getElementById('cplValue').textContent = `¥${cpl.toLocaleString()}`;
    document.getElementById('totalLeadsChange').textContent = `↑ 0% 前月比`;
    document.getElementById('conversionRateChange').textContent = `↑ 0% 前月比`;
    document.getElementById('cplValueChange').textContent = `↓ 0% 前月比`;
    renderCampaigns();
    renderLeads();
}
function renderCampaigns() {
    const campaignList = document.getElementById('campaignList');
    if (dataStore.campaigns.length === 0) {
        campaignList.innerHTML = `<div class="no-data">キャンペーンがありません。</div>`;
        return;
    }
    campaignList.innerHTML = dataStore.campaigns.map(campaign => {
        const roi = campaign.spent > 0 ? ((campaign.conversions * 25000 - campaign.spent) / campaign.spent * 100).toFixed(0) : '0';
        const progress = campaign.budget > 0 ? Math.min(100, (campaign.spent / campaign.budget * 100)).toFixed(0) : '0';
        return `
            <div class="campaign-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="font-size: 16px; margin-bottom: 8px;">${campaign.name}</h4>
                        <div style="font-size: 12px; color: #6f767e;">
                            ${campaign.channel} | ${campaign.startDate} - ${campaign.endDate}
                        </div>
                    </div>
                    <span class="status-badge ${campaign.status === 'active' ? 'active' : 'pending'}">${campaign.status}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px;">
                    <div>
                        <div style="font-size: 12px; color: #6f767e;">予算消化</div>
                        <div style="font-weight: 600;">¥${campaign.spent.toLocaleString()} / ¥${campaign.budget.toLocaleString()}</div>
                        <div class="progress-bar" style="margin-top: 4px;">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6f767e;">リード数</div>
                        <div style="font-weight: 600;">${campaign.leads}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6f767e;">コンバージョン</div>
                        <div style="font-weight: 600;">${campaign.conversions}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6f767e;">ROI</div>
                        <div style="font-weight: 600; color: ${parseFloat(roi) >= 0 ? '#00c853' : '#ff3b30'};">${roi}%</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
function renderLeads() {
    const tbody = document.getElementById('leadTableBody');
    if (dataStore.leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="no-data">リードがいません。</td></tr>`;
        return;
    }
    tbody.innerHTML = dataStore.leads.map(lead => `
        <tr>
            <td>${lead.company}</td>
            <td>${lead.contact}</td>
            <td>${lead.email}</td>
            <td>${lead.source}</td>
            <td>${getLeadScoreBadge(lead.score, lead.status)}</td>
            <td><span class="status-badge pending">${lead.status === 'converted' ? '商談化済' : '新規'}</span></td>
            <td>${lead.createdDate}</td>
            <td>
                <button class="btn btn-secondary btn-convert-lead" data-lead-id="${lead.id}" ${lead.status === 'converted' ? ' disabled' : ''}>商談化</button>
            </td>
        </tr>
    `).join('');
}
function getLeadScoreBadge(score, status) {
    return `<span class="lead-score ${status}">${score}</span>`;
}
function convertLead(leadId) {
    const lead = dataStore.leads.find(l => l.id === leadId);
    if (lead && lead.status !== 'converted') {
        lead.status = 'converted';
        showNotification(`${lead.company}を商談化しました`, 'success');
        renderLeads();
    }
    else if (lead && lead.status === 'converted') {
        showNotification(`${lead.company}は既に商談化されています`, 'error');
    }
}
function showAddCampaignModal() {
    document.getElementById('addCampaignForm').reset();
    document.getElementById('campaignStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('addCampaignModal').classList.add('active');
}
// (window as any).showAddCampaignModal = showAddCampaignModal; // Assigned via event listener
function addCampaign() {
    const newCampaign = {
        id: dataStore.campaigns.length > 0 ? Math.max(...dataStore.campaigns.map(c => c.id)) + 1 : 1,
        name: document.getElementById('campaignName').value,
        channel: document.getElementById('campaignChannel').value,
        budget: parseInt(document.getElementById('campaignBudget').value) || 0,
        spent: 0, leads: 0, conversions: 0,
        startDate: document.getElementById('campaignStartDate').value.replace(/-/g, '/'),
        endDate: document.getElementById('campaignEndDate').value.replace(/-/g, '/'),
        status: 'active'
    };
    dataStore.campaigns.push(newCampaign);
    closeModal('addCampaignModal');
    updateMarketing();
    showNotification('キャンペーンを作成しました', 'success');
}
// (window as any).addCampaign = addCampaign; // Assigned via event listener
// --- Customer Success Tab Functions ---
function updateCustomerSuccess() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const npsScores = activeCustomers.map(c => c.npsScore).filter(score => typeof score === 'number');
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const nps = npsScores.length > 0 ? Math.round((promoters - detractors) / npsScores.length * 100) : 0;
    document.getElementById('npsScore').textContent = String(nps);
    document.getElementById('avgResponseTime').textContent = '2.5h'; // Placeholder
    document.getElementById('csat').textContent = '92%'; // Placeholder
    document.getElementById('npsScoreChange').textContent = `↑ 0 前四半期比`;
    document.getElementById('avgResponseTimeChange').textContent = `↓ 0% 前月比`;
    document.getElementById('csatChange').textContent = `↑ 0% 前月比`;
    renderHealthScores();
    renderCSTasks();
}
function renderHealthScores() {
    const tbody = document.getElementById('healthScoreTableBody');
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    if (activeCustomers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">アクティブな顧客がいません。</td></tr>`;
        return;
    }
    tbody.innerHTML = activeCustomers.map(customer => {
        const healthStatus = customer.healthScore >= 80 ? 'healthy' : customer.healthScore >= 60 ? 'at-risk' : 'critical';
        return `
            <tr>
                <td>${customer.name}</td>
                <td><div class="health-score"><span class="health-dot ${healthStatus}"></span>${customer.healthScore}%</div></td>
                <td>${customer.usageRate}%</td>
                <td>${customer.lastLogin}</td>
                <td>${customer.supportTickets}</td>
                <td>${customer.assignee}</td>
                <td>${healthStatus === 'at-risk' ? '要フォローアップ' : healthStatus === 'critical' ? '緊急対応必要' : '定期チェック'}</td>
            </tr>
        `;
    }).join('');
}
function renderCSTasks() {
    const tasks = [
        { id: 1, title: 'PQRサービスのヘルススコア改善施策実施', due: '2025/06/10', completed: false },
        { id: 2, title: 'GHIコーポレーションの四半期レビュー', due: '2025/06/15', completed: false },
        { id: 3, title: 'JKLテクノロジーのオンボーディング完了確認', due: '2025/06/01', completed: true },
    ];
    const taskList = document.getElementById('csTaskList');
    if (tasks.length === 0) {
        taskList.innerHTML = `<div class="no-data">タスクがありません。</div>`;
        return;
    }
    taskList.innerHTML = tasks.map(task => `
        <div class="task-card">
            <input type="checkbox" class="task-checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
            <label for="task-${task.id}" style="flex: 1; ${task.completed ? 'text-decoration: line-through; color: #6f767e;' : ''}">
                <div>${task.title}</div>
                <div style="font-size: 12px; color: #6f767e; margin-top: 4px;">期限: ${task.due}</div>
            </label>
        </div>
    `).join('');
}
function toggleTask(taskId) {
    showNotification(`タスク ${taskId} のステータスを更新しました`, 'success');
}
// --- Finance Tab Functions ---
function updateFinanceMetrics(targetYear, targetMonth) {
    const now = new Date();
    const selectedYear = targetYear || parseInt(document.getElementById('balanceViewYear')?.value) || now.getFullYear();
    const selectedMonth = targetMonth !== null ? targetMonth : (parseInt(document.getElementById('balanceViewMonth')?.value) - 1) ?? now.getMonth();
    let monthlyInitialFees = 0, monthlyOperationFees = 0, monthlyMRR = 0;
    let newCount = 0, activeCount = 0, operationCount = 0;
    dataStore.customers.forEach(customer => {
        const startDate = new Date(customer.startDate.replace(/\//g, '-'));
        if (startDate.getMonth() === selectedMonth && startDate.getFullYear() === selectedYear) {
            monthlyInitialFees += customer.initialFee;
            newCount++;
        }
        const isActiveInSelectedMonth = (customer.status === 'active' ||
            (customer.status === 'churned' && customer.churnDate && new Date(customer.churnDate.replace(/\//g, '-')) > new Date(selectedYear, selectedMonth, 1))) &&
            startDate <= new Date(selectedYear, selectedMonth + 1, 0);
        if (isActiveInSelectedMonth) {
            monthlyMRR += customer.mrr;
            monthlyOperationFees += customer.operationFee;
            activeCount++;
            if (customer.operationFee > 0)
                operationCount++;
        }
    });
    const totalIncome = monthlyMRR + monthlyInitialFees + monthlyOperationFees;
    const monthlyExpenses = dataStore.expenses.filter(expense => {
        const expenseDate = new Date(expense.date.replace(/\//g, '-'));
        return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear && expense.status === 'approved';
    });
    const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (balance / totalIncome * 100).toFixed(1) : '0';
    document.getElementById('monthlyMRRIncome').textContent = `¥${monthlyMRR.toLocaleString()}`;
    document.getElementById('mrrIncomeDetail').textContent = `アクティブ顧客: ${activeCount}社`;
    document.getElementById('monthlyInitialFees').textContent = `¥${monthlyInitialFees.toLocaleString()}`;
    document.getElementById('initialFeeCount').textContent = `新規${newCount}件`;
    document.getElementById('monthlyOperationFees').textContent = `¥${monthlyOperationFees.toLocaleString()}`;
    document.getElementById('operationFeeChangeFinance').textContent = `対象顧客: ${operationCount}社`;
    document.getElementById('monthlyTotalIncome').textContent = `¥${totalIncome.toLocaleString()}`;
    document.getElementById('monthlyTotalExpense').textContent = `¥${totalExpense.toLocaleString()}`;
    const monthlyBalanceEl = document.getElementById('monthlyBalance');
    monthlyBalanceEl.textContent = `¥${balance.toLocaleString()}`;
    monthlyBalanceEl.className = `metric-value ${balance >= 0 ? '' : 'negative'}`;
    const balanceChangeEl = document.getElementById('balanceChange');
    balanceChangeEl.textContent = `利益率: ${profitMargin}%`;
    balanceChangeEl.className = `metric-change ${balance >= 0 ? 'positive' : 'negative'}`;
    updateExpenseCategoryBreakdown(monthlyExpenses);
    updateBalanceTable(totalIncome, monthlyMRR, monthlyInitialFees, monthlyOperationFees, monthlyExpenses);
    return { totalIncome, totalExpense, balance };
}
function updateExpenseCategoryBreakdown(currentMonthExpenses) {
    const categoryTotals = {};
    currentMonthExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    const breakdownDiv = document.getElementById('expenseCategoryBreakdown');
    const totalMonthlyExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (Object.keys(categoryTotals).length === 0) {
        breakdownDiv.innerHTML = `<div class="no-data">今月の経費データがありません。</div>`;
        return;
    }
    breakdownDiv.innerHTML = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([category, amount]) => {
        const percentage = totalMonthlyExpense > 0 ? (amount / totalMonthlyExpense * 100).toFixed(1) : '0';
        return `
                <div style="background: #f8f9fb; padding: 16px; border-radius: 8px;">
                    <div style="font-size: 12px; color: #6f767e; margin-bottom: 4px;">${category}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #1a1d1f;">¥${amount.toLocaleString()}</div>
                    <div style="font-size: 12px; color: #6f767e;">${percentage}%</div>
                </div>`;
    }).join('');
}
function updateBalanceTable(totalIncome, mrr, initialFees, operationFees, monthlyExpenses) {
    const tbody = document.getElementById('balanceTableBody');
    const rows = [];
    if (mrr > 0)
        rows.push({ name: '月額利用料（MRR）', category: '売上高', income: mrr, expense: 0 });
    if (initialFees > 0)
        rows.push({ name: '初期導入費用', category: '売上高', income: initialFees, expense: 0 });
    if (operationFees > 0)
        rows.push({ name: '運用代行費', category: '売上高', income: operationFees, expense: 0 });
    const expenseByCategory = {};
    monthlyExpenses.forEach(exp => {
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
    });
    Object.entries(expenseByCategory).forEach(([category, amount]) => {
        rows.push({ name: category, category: '経費', income: 0, expense: amount });
    });
    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">収支データがありません。</td></tr>`;
    }
    else {
        tbody.innerHTML = rows.map(row => {
            const balance = row.income - row.expense;
            return `
                <tr>
                    <td>${row.name}</td>
                    <td>${row.category}</td>
                    <td>${row.income > 0 ? `¥${row.income.toLocaleString()}` : '-'}</td>
                    <td>${row.expense > 0 ? `¥${row.expense.toLocaleString()}` : '-'}</td>
                    <td class="${balance >= 0 ? 'positive' : 'negative'}">¥${balance.toLocaleString()}</td>
                </tr>`;
        }).join('');
    }
    const totalExpenseVal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalIncomeFooter').textContent = `¥${totalIncome.toLocaleString()}`;
    document.getElementById('totalExpenseFooter').textContent = `¥${totalExpenseVal.toLocaleString()}`;
    const totalBalanceFooterEl = document.getElementById('totalBalanceFooter');
    totalBalanceFooterEl.textContent = `¥${(totalIncome - totalExpenseVal).toLocaleString()}`;
    totalBalanceFooterEl.className = (totalIncome - totalExpenseVal) >= 0 ? 'positive' : 'negative';
}
function renderExpensesTable() {
    const tbody = document.getElementById('expenseTableBodyFinance');
    if (dataStore.expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">経費データがありません。</td></tr>`;
        return;
    }
    tbody.innerHTML = dataStore.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => `
        <tr>
            <td>${expense.date}</td>
            <td>${expense.name}</td>
            <td>${expense.category}${expense.subcategory ? ` - ${expense.subcategory}` : ''}</td>
            <td>¥${expense.amount.toLocaleString()}</td>
            <td>${getStatusBadge(expense.status)}</td>
            <td><button class="btn btn-secondary btn-delete-expense" data-expense-id="${expense.id}" style="color: #ff3b30;">削除</button></td>
        </tr>
    `).join('');
}
function showAddExpenseModal() {
    document.getElementById('addExpenseFormFinance').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    updateExpenseSubcategory();
    document.getElementById('addExpenseModal').classList.add('active');
}
// (window as any).showAddExpenseModal = showAddExpenseModal; // Assigned via event listener
function addExpense() {
    const newExpense = {
        id: dataStore.expenses.length > 0 ? Math.max(...dataStore.expenses.map(e => e.id)) + 1 : 1,
        date: document.getElementById('expenseDate').value.replace(/-/g, '/'),
        name: document.getElementById('expenseName').value,
        category: document.getElementById('expenseCategoryFinance').value,
        subcategory: document.getElementById('expenseSubcategory').value || '',
        amount: parseInt(document.getElementById('expenseAmount').value) || 0,
        status: 'pending'
    };
    if (!newExpense.name || !newExpense.category || isNaN(newExpense.amount) || newExpense.amount <= 0) {
        showNotification('必須項目を入力してください。金額は0より大きい値を入力してください。', 'error');
        return;
    }
    dataStore.expenses.push(newExpense);
    closeModal('addExpenseModal');
    renderExpensesTable();
    updateFinanceMetrics();
    showNotification('経費を登録しました', 'success');
}
// (window as any).addExpense = addExpense; // Assigned via event listener
function deleteExpense(expenseId) {
    if (confirm('この経費を削除してもよろしいですか？')) {
        dataStore.expenses = dataStore.expenses.filter(e => e.id !== expenseId);
        renderExpensesTable();
        updateFinanceMetrics();
        showNotification('経費を削除しました', 'success');
    }
}
function updateExpenseSubcategory() {
    const category = document.getElementById('expenseCategoryFinance').value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategorySelect = document.getElementById('expenseSubcategory');
    const subcategories = {
        '広告宣伝費': ['Web広告', 'SNS広告', 'オフライン広告', 'PR・広報', 'イベント・展示会', 'コンテンツマーケティング'],
        '業務委託費': ['開発委託', 'デザイン委託', 'コンサルティング', 'マーケティング委託', 'カスタマーサポート委託', 'その他委託'],
        '人件費': ['役員報酬', '正社員給与', '契約社員給与', 'アルバイト給与', '賞与', '社会保険料', '退職金'],
        '研究開発費': ['製品開発', '技術研究', 'プロトタイプ制作', '特許申請', 'ライセンス取得', '開発ツール'],
        '予備投資費': ['設備投資', 'システム投資', '事業拡大準備', '新規事業開発', 'M&A関連', '緊急対応費']
    };
    if (category && subcategories[category]) {
        subcategoryGroup.style.display = 'block';
        subcategorySelect.innerHTML = '<option value="">選択してください</option>' +
            subcategories[category].map(sub => `<option value="${sub}">${sub}</option>`).join('');
    }
    else {
        subcategoryGroup.style.display = 'none';
        subcategorySelect.innerHTML = '<option value="">選択してください</option>';
        subcategorySelect.value = '';
    }
}
// (window as any).updateExpenseSubcategory = updateExpenseSubcategory; // Assigned via event listener
function updateBalanceView() {
    const year = parseInt(document.getElementById('balanceViewYear').value);
    const month = parseInt(document.getElementById('balanceViewMonth').value) - 1;
    updateFinanceMetrics(year, month);
    updateMonthlyBalanceChart();
}
// (window as any).updateBalanceView = updateBalanceView; // Assigned via event listener
// --- Analytics Tab Functions ---
function updateAnalytics() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const totalMRR = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const avgMRR = activeCustomers.length > 0 ? totalMRR / activeCustomers.length : 0;
    const marketingCostThisMonth = dataStore.campaigns.reduce((sum, camp) => {
        const campStartDate = new Date(camp.startDate.replace(/\//g, '-'));
        const campEndDate = new Date(camp.endDate.replace(/\//g, '-'));
        const now = new Date();
        if (campStartDate <= now && campEndDate >= now) {
            return sum + (camp.spent / ((campEndDate.getTime() - campStartDate.getTime()) / (1000 * 3600 * 24 * 30) || 1));
        }
        return sum;
    }, 0);
    const salesTeamCost = 450000;
    const newCustomersThisMonthCount = dataStore.customers.filter(c => {
        const sDate = new Date(c.startDate.replace(/\//g, '-'));
        const now = new Date();
        return sDate.getFullYear() === now.getFullYear() && sDate.getMonth() === now.getMonth();
    }).length || 1;
    const cac = (marketingCostThisMonth + salesTeamCost) / newCustomersThisMonthCount;
    const avgRetentionMonths = 24;
    const ltv = avgMRR * avgRetentionMonths;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    document.getElementById('cacValue').textContent = `¥${Math.round(cac).toLocaleString()}`;
    document.getElementById('ltvValue').textContent = `¥${Math.round(ltv).toLocaleString()}`;
    document.getElementById('ltvCacRatio').textContent = ltvCacRatio.toFixed(1);
    document.getElementById('cacValueChange').textContent = `↓ 0% 前月比`;
    document.getElementById('ltvValueChange').textContent = `↑ 0% 前月比`;
    document.getElementById('ltvCacRatioChange').textContent = `↑ 0 前月比`;
    const starterCustomers = activeCustomers.filter(c => c.plan === 'starter');
    const professionalCustomers = activeCustomers.filter(c => c.plan === 'professional');
    const enterpriseCustomers = activeCustomers.filter(c => c.plan === 'enterprise');
    document.getElementById('starterMetrics').textContent = `¥${starterCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    document.getElementById('starterMetricsCount').textContent = `顧客数: ${starterCustomers.length}`;
    document.getElementById('professionalMetrics').textContent = `¥${professionalCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    document.getElementById('professionalMetricsCount').textContent = `顧客数: ${professionalCustomers.length}`;
    document.getElementById('enterpriseMetrics').textContent = `¥${enterpriseCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    document.getElementById('enterpriseMetricsCount').textContent = `顧客数: ${enterpriseCustomers.length}`;
    const ltvTableBody = document.getElementById('ltvAnalysisTableBody');
    if (activeCustomers.length === 0) {
        ltvTableBody.innerHTML = `<tr><td colspan="5" class="no-data">アクティブな顧客がいません。</td></tr>`;
        return;
    }
    ltvTableBody.innerHTML = activeCustomers.map(customer => {
        const startDate = new Date(customer.startDate.replace(/\//g, '-'));
        const now = new Date();
        const monthsActive = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
        const totalPayment = customer.mrr * monthsActive + customer.initialFee;
        const predictedLTV = customer.mrr * avgRetentionMonths;
        const churnRiskStatus = customer.healthScore < 60 ? 'critical' : customer.healthScore < 80 ? 'at-risk' : 'healthy';
        const riskBadgeClass = churnRiskStatus === 'critical' ? 'churned' : churnRiskStatus === 'at-risk' ? 'pending' : 'active';
        const riskText = churnRiskStatus === 'critical' ? '高' : churnRiskStatus === 'at-risk' ? '中' : '低';
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${monthsActive}ヶ月</td>
                <td>¥${totalPayment.toLocaleString()}</td>
                <td>¥${predictedLTV.toLocaleString()}</td>
                <td><span class="status-badge ${riskBadgeClass}">${riskText}</span></td>
            </tr>
        `;
    }).join('');
}
function generateReport() { showNotification('レポートを生成中...', 'success'); setTimeout(() => showNotification('月次レポートが生成されました', 'success'), 2000); }
// (window as any).generateReport = generateReport; // Assigned via event listener
function downloadReport(type) { showNotification(`${type}レポートをダウンロード中...`, 'success'); }
// (window as any).downloadReport = downloadReport; // Assigned via event listener
// --- Subscription Tab Functions ---
function updateSubscription() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const totalMRR = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const totalARR = totalMRR * 12;
    const nrr = 100 + (Math.random() * 10 - 5);
    const churnedLastMonth = dataStore.customers.filter(c => {
        if (c.status !== 'churned' || !c.churnDate)
            return false;
        const churnDate = new Date(c.churnDate.replace(/\//g, '-'));
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return churnDate >= firstDayLastMonth && churnDate <= lastDayLastMonth;
    }).length;
    const activeBeginningLastMonth = dataStore.customers.filter(c => {
        const startDate = new Date(c.startDate.replace(/\//g, '-'));
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return startDate < firstDayLastMonth &&
            (c.status === 'active' || (c.status === 'churned' && c.churnDate && new Date(c.churnDate.replace(/\//g, '-')) >= firstDayLastMonth));
    }).length;
    const monthlyChurnRate = activeBeginningLastMonth > 0 ? (churnedLastMonth / activeBeginningLastMonth * 100) : 0;
    const arpa = activeCustomers.length > 0 ? totalMRR / activeCustomers.length : 0;
    let totalMonths = 0;
    activeCustomers.forEach(customer => {
        const startDate = new Date(customer.startDate.replace(/\//g, '-'));
        const endDate = customer.status === 'churned' && customer.churnDate ? new Date(customer.churnDate.replace(/\//g, '-')) : new Date();
        totalMonths += Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
    });
    const avgRetentionMonths = activeCustomers.length > 0 ? Math.round(totalMonths / activeCustomers.length) : 0;
    document.getElementById('subMRR').textContent = `¥${totalMRR.toLocaleString()}`;
    document.getElementById('subARR').textContent = `¥${totalARR.toLocaleString()}`;
    document.getElementById('nrr').textContent = `${nrr.toFixed(0)}%`;
    document.getElementById('monthlyChurnRate').textContent = `${monthlyChurnRate.toFixed(1)}%`;
    document.getElementById('arpa').textContent = `¥${Math.round(arpa).toLocaleString()}`;
    document.getElementById('avgRetentionMonths').textContent = `${avgRetentionMonths}ヶ月`;
    document.getElementById('subMRRChange').textContent = `↑ 0% 前月比`;
    document.getElementById('subARRChange').textContent = `↑ 0% 前年比`;
    document.getElementById('nrrChange').textContent = `↑ 0% 前四半期比`;
    document.getElementById('monthlyChurnRateChange').textContent = `↓ 0% 前月比`;
    document.getElementById('arpaChange').textContent = `↑ 0% 前月比`;
    document.getElementById('avgRetentionMonthsDetail').textContent = `業界平均: 24ヶ月`;
    if (charts.cohortChart)
        updateCohortChart();
    if (charts.mrrForecastChart)
        updateMRRForecastChart();
}
// --- Charting Functions ---
function initializeDashboardCharts() {
    const mrrCtx = document.getElementById('mrrChart')?.getContext('2d');
    if (mrrCtx && !charts.mrr) {
        charts.mrr = new Chart(mrrCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const subscribersCtx = document.getElementById('subscribersChart')?.getContext('2d');
    if (subscribersCtx && !charts.subscribers) {
        charts.subscribers = new Chart(subscribersCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const arrCtx = document.getElementById('arrChart')?.getContext('2d');
    if (arrCtx && !charts.arr) {
        charts.arr = new Chart(arrCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const mrrMovementsCtx = document.getElementById('mrrMovementsChart')?.getContext('2d');
    if (mrrMovementsCtx && !charts.mrrMovements) {
        charts.mrrMovements = new Chart(mrrMovementsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    { label: '新規', data: [], backgroundColor: '#00c853' },
                    { label: '拡張', data: [], backgroundColor: '#0066ff' },
                    { label: '解約', data: [], backgroundColor: '#ff3b30' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } },
                scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (value) => `¥${(Number(value) / 1000).toLocaleString()}k` } } }
            }
        });
    }
}
function updateDashboardCharts() {
    if (!charts.mrr || !charts.subscribers || !charts.arr || !charts.mrrMovements) {
        initializeDashboardCharts();
    }
    if (!charts.mrr || !charts.subscribers || !charts.arr || !charts.mrrMovements) {
        console.warn("Dashboard charts not fully initialized, skipping update.");
        return;
    }
    const labels = ['1月', '2月', '3月', '4月', '5月'];
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const currentMRR = activeCustomers.reduce((s, c) => s + c.mrr, 0);
    const currentSubscribers = activeCustomers.length;
    const mrrData = [80000, 90000, 115000, 140000, currentMRR];
    const subscriberData = [3, 3, 4, 5, currentSubscribers];
    const arrData = mrrData.map(mrr => mrr * 12);
    const newMrrData = [30000, 25000, 40000, 50000, Number(document.getElementById('newBusinessMRR').textContent?.replace(/[^0-9]/g, '')) || 0];
    const expansionMrrData = [5000, 10000, 15000, 25000, Number(document.getElementById('expansionMRR').textContent?.replace(/[^0-9]/g, '')) || 0];
    const churnMrrData = [-10000, -20000, -30000, -50000, -Math.abs(Number(document.getElementById('churnMRR').textContent?.replace(/[^0-9]/g, '')) || 0)];
    if (charts.mrr) {
        charts.mrr.data.labels = labels;
        charts.mrr.data.datasets[0].data = mrrData;
        charts.mrr.update();
    }
    if (charts.subscribers) {
        charts.subscribers.data.labels = labels;
        charts.subscribers.data.datasets[0].data = subscriberData;
        charts.subscribers.update();
    }
    if (charts.arr) {
        charts.arr.data.labels = labels;
        charts.arr.data.datasets[0].data = arrData;
        charts.arr.update();
    }
    if (charts.mrrMovements) {
        charts.mrrMovements.data.labels = labels;
        charts.mrrMovements.data.datasets[0].data = newMrrData.map(Number);
        charts.mrrMovements.data.datasets[1].data = expansionMrrData.map(Number);
        charts.mrrMovements.data.datasets[2].data = churnMrrData.map(Number);
        charts.mrrMovements.update();
    }
}
function initializeFinanceCharts() {
    const monthlyBalanceCtx = document.getElementById('monthlyBalanceChart')?.getContext('2d');
    if (monthlyBalanceCtx && !charts.monthlyBalance) {
        charts.monthlyBalance = new Chart(monthlyBalanceCtx, {
            type: 'line',
            data: { labels: [], datasets: [
                    { label: '収入', data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4, fill: true },
                    { label: '支出', data: [], borderColor: '#ff3b30', backgroundColor: 'rgba(255,59,48,0.1)', tension: 0.4, fill: true },
                    { label: '収支', data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4, borderWidth: 3, fill: true }
                ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}` } } },
                scales: { y: { beginAtZero: false, ticks: { callback: (value) => `¥${(Number(value) / 1000000).toFixed(1)}M` } } } }
        });
    }
}
function updateMonthlyBalanceChart() {
    if (!charts.monthlyBalance)
        initializeFinanceCharts();
    if (!charts.monthlyBalance)
        return;
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const balanceData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`${d.getFullYear()}/${d.getMonth() + 1}月`);
        let monthlyInitialFees = 0, monthlyOperationFees = 0, monthlyMRR = 0;
        dataStore.customers.forEach(customer => {
            const startDate = new Date(customer.startDate.replace(/\//g, '-'));
            if (startDate.getMonth() === d.getMonth() && startDate.getFullYear() === d.getFullYear()) {
                monthlyInitialFees += customer.initialFee;
            }
            const isActiveInSelectedMonth = (customer.status === 'active' ||
                (customer.status === 'churned' && customer.churnDate && new Date(customer.churnDate.replace(/\//g, '-')) > new Date(d.getFullYear(), d.getMonth(), 1))) &&
                startDate <= new Date(d.getFullYear(), d.getMonth() + 1, 0);
            if (isActiveInSelectedMonth) {
                monthlyMRR += customer.mrr;
                monthlyOperationFees += customer.operationFee;
            }
        });
        const totalIncomeForMonth = monthlyMRR + monthlyInitialFees + monthlyOperationFees;
        const expensesForMonth = dataStore.expenses.filter(exp => {
            const expDate = new Date(exp.date.replace(/\//g, '-'));
            return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear() && exp.status === 'approved';
        });
        const totalExpenseForMonth = expensesForMonth.reduce((sum, exp) => sum + exp.amount, 0);
        incomeData.push(totalIncomeForMonth);
        expenseData.push(totalExpenseForMonth);
        balanceData.push(totalIncomeForMonth - totalExpenseForMonth);
    }
    charts.monthlyBalance.data.labels = labels;
    charts.monthlyBalance.data.datasets[0].data = incomeData;
    charts.monthlyBalance.data.datasets[1].data = expenseData;
    charts.monthlyBalance.data.datasets[2].data = balanceData;
    charts.monthlyBalance.update();
}
function initializeSubscriptionCharts() {
    const cohortCtx = document.getElementById('cohortChart')?.getContext('2d');
    if (cohortCtx && !charts.cohortChart) {
        charts.cohortChart = new Chart(cohortCtx, {
            type: 'line', data: { labels: ['月1', '月2', '月3', '月4', '月5', '月6'], datasets: [
                    { label: '2025年1月コホート', data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4, fill: true },
                    { label: '2025年2月コホート', data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4, fill: true }
                ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%` } } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${Number(value)}%` } } } }
        });
    }
    const mrrForecastCtx = document.getElementById('mrrForecastChart')?.getContext('2d');
    if (mrrForecastCtx && !charts.mrrForecastChart) {
        charts.mrrForecastChart = new Chart(mrrForecastCtx, {
            type: 'line', data: { labels: [], datasets: [
                    { label: '実績MRR', data: [], borderColor: '#0066ff', tension: 0.4, fill: true },
                    { label: '予測MRR', data: [], borderColor: '#00c853', borderDash: [5, 5], tension: 0.4, fill: true }
                ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}` } } },
                scales: { y: { beginAtZero: true, ticks: { callback: (value) => `¥${(Number(value) / 1000).toFixed(0)}K` } } } }
        });
    }
}
function updateCohortChart() {
    if (!charts.cohortChart)
        initializeSubscriptionCharts();
    if (!charts.cohortChart)
        return;
    charts.cohortChart.data.datasets[0].data = [100, 95, 92, 90, 88, 87];
    charts.cohortChart.data.datasets[1].data = [100, 96, 93, 91, 90];
    charts.cohortChart.update();
}
function updateMRRForecastChart() {
    if (!charts.mrrForecastChart)
        initializeSubscriptionCharts();
    if (!charts.mrrForecastChart)
        return;
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const actualMRR = [80000, 90000, 115000, 140000, 215000];
    const forecastMRR = actualMRR.map(val => val);
    const actualMRRForChart = [...actualMRR];
    for (let i = actualMRRForChart.length; i < labels.length; i++) {
        actualMRRForChart.push(null);
    }
    let lastActual = forecastMRR[forecastMRR.length - 1] || 215000;
    for (let i = actualMRR.length; i < labels.length; i++) {
        lastActual = lastActual * (1 + (0.02 + Math.random() * 0.03));
        forecastMRR.push(Math.round(lastActual));
    }
    if (forecastMRR.length > actualMRR.length && actualMRR.length > 0) {
        forecastMRR[actualMRR.length - 1] = actualMRR[actualMRR.length - 1];
    }
    charts.mrrForecastChart.data.labels = labels;
    charts.mrrForecastChart.data.datasets[0].data = actualMRRForChart;
    charts.mrrForecastChart.data.datasets[1].data = forecastMRR;
    charts.mrrForecastChart.update();
}
// --- Utility Functions ---
function getPlanName(planKey) {
    const plans = { 'starter': 'スターター', 'professional': 'プロフェッショナル', 'enterprise': 'エンタープライズ' };
    return plans[planKey] || planKey;
}
function getStatusBadge(statusKey) {
    const badgeClasses = { 'active': 'active', 'trial': 'trial', 'churned': 'churned', 'pending': 'pending', 'approved': 'active' };
    const statusNames = { 'active': 'アクティブ', 'trial': 'トライアル', 'churned': '解約', 'pending': '申請中', 'approved': '承認済' };
    return `<span class="status-badge ${badgeClasses[statusKey] || 'pending'}">${statusNames[statusKey] || statusKey}</span>`;
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal)
        modal.classList.remove('active');
}
// (window as any).closeModal = closeModal; // Assigned via event listener
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
// --- Event Listeners Setup ---
function setupEventListeners() {
    // Tab switching for header nav and sidebar
    document.querySelectorAll('.nav-tab, .sidebar-icon').forEach(tab => {
        tab.addEventListener('click', (event) => {
            const targetTabName = event.currentTarget.dataset.tabTarget;
            if (targetTabName) {
                switchTab(targetTabName, event.currentTarget);
            }
        });
    });
    // Sales Tab Modals & Actions
    document.getElementById('showAddCustomerModalButton')?.addEventListener('click', showAddCustomerModal);
    document.getElementById('confirmAddCustomerButton')?.addEventListener('click', () => {
        addCustomer().catch(error => console.error('Error in addCustomer:', error));
    });
    document.getElementById('closeAddCustomerModalButton')?.addEventListener('click', () => closeModal('addCustomerModal'));
    document.getElementById('cancelAddCustomerButton')?.addEventListener('click', () => closeModal('addCustomerModal'));
    document.getElementById('exportCustomersButton')?.addEventListener('click', exportCustomers);
    document.getElementById('showImportModalButton')?.addEventListener('click', showImportModal);
    document.getElementById('bulkDeleteCustomersButton')?.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.customer-select-checkbox:checked');
        const customerIdsToBulkDelete = [];
        selectedCheckboxes.forEach(checkbox => {
            const id = checkbox.dataset.customerId;
            if (id)
                customerIdsToBulkDelete.push(parseInt(id, 10));
        });
        bulkDeleteCustomers(customerIdsToBulkDelete).catch(error => console.error('Error in bulkDeleteCustomers:', error));
    });
    // Sales Tab Filters
    document.getElementById('customerSearch')?.addEventListener('input', renderCustomersTable);
    document.getElementById('statusFilter')?.addEventListener('change', renderCustomersTable);
    document.getElementById('planFilterSales')?.addEventListener('change', renderCustomersTable);
    // Customer table actions (Details, Delete, Select) via event delegation
    const customerTableBody = document.getElementById('customerTableBody');
    if (customerTableBody) {
        customerTableBody.addEventListener('click', (event) => {
            const target = event.target;
            // Handle row checkbox click
            if (target.classList.contains('customer-select-checkbox')) {
                const checkbox = target;
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.toggle('customer-row-selected', checkbox.checked);
                }
                updateBulkDeleteButtonState();
                // Update selectAllCustomersCheckbox state
                const allCheckboxes = customerTableBody.querySelectorAll('.customer-select-checkbox');
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
                const selectAll = document.getElementById('selectAllCustomersCheckbox');
                if (selectAll) {
                    selectAll.checked = allChecked && allCheckboxes.length > 0;
                }
                return;
            }
            const detailButton = target.closest('.btn-show-detail');
            if (detailButton) {
                const customerIdStr = detailButton.dataset.customerId;
                if (customerIdStr) {
                    const customerId = parseInt(customerIdStr, 10);
                    if (!isNaN(customerId)) {
                        showCustomerDetail(customerId);
                    }
                }
                return;
            }
            const deleteButton = target.closest('.btn-delete-customer');
            if (deleteButton) {
                const customerIdStr = deleteButton.dataset.customerId;
                if (customerIdStr) {
                    const customerId = parseInt(customerIdStr, 10);
                    if (!isNaN(customerId)) {
                        deleteCustomer(customerId).catch(error => console.error('Error in deleteCustomer:', error));
                    }
                }
                return;
            }
        });
    }
    // Select All Customers Checkbox
    const selectAllCustomersCheckbox = document.getElementById('selectAllCustomersCheckbox');
    if (selectAllCustomersCheckbox) {
        selectAllCustomersCheckbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            const rowCheckboxes = document.querySelectorAll('#customerTableBody .customer-select-checkbox');
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.toggle('customer-row-selected', isChecked);
                }
            });
            updateBulkDeleteButtonState();
        });
    }
    // Import Modal
    document.getElementById('closeImportModalButton')?.addEventListener('click', () => closeModal('importModal'));
    document.getElementById('selectFileButton')?.addEventListener('click', () => document.getElementById('csvFileInput').click());
    document.getElementById('csvFileInput')?.addEventListener('change', handleFileUpload);
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0)
                handleFileUpload({ target: { files } });
        });
    }
    // Marketing Tab Modals & Actions
    document.getElementById('showAddCampaignModalButton')?.addEventListener('click', showAddCampaignModal);
    document.getElementById('confirmAddCampaignButton')?.addEventListener('click', addCampaign);
    document.getElementById('closeAddCampaignModalButton')?.addEventListener('click', () => closeModal('addCampaignModal'));
    document.getElementById('cancelAddCampaignButton')?.addEventListener('click', () => closeModal('addCampaignModal'));
    // Marketing lead table actions
    const leadTableBody = document.getElementById('leadTableBody');
    if (leadTableBody) {
        leadTableBody.addEventListener('click', (event) => {
            const target = event.target;
            const convertButton = target.closest('.btn-convert-lead');
            if (convertButton) {
                const leadIdStr = convertButton.dataset.leadId;
                if (leadIdStr) {
                    const leadId = parseInt(leadIdStr, 10);
                    if (!isNaN(leadId))
                        convertLead(leadId);
                }
            }
        });
    }
    // Customer Success task list actions
    const csTaskList = document.getElementById('csTaskList');
    if (csTaskList) {
        csTaskList.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('task-checkbox')) {
                const taskIdStr = target.dataset.taskId;
                if (taskIdStr) {
                    const taskId = parseInt(taskIdStr, 10);
                    if (!isNaN(taskId))
                        toggleTask(taskId);
                }
            }
        });
    }
    // Finance Tab Modals & Actions
    document.getElementById('showAddExpenseModalButton')?.addEventListener('click', showAddExpenseModal);
    document.getElementById('confirmAddExpenseButton')?.addEventListener('click', addExpense);
    document.getElementById('closeAddExpenseModalButton')?.addEventListener('click', () => closeModal('addExpenseModal'));
    document.getElementById('cancelAddExpenseButton')?.addEventListener('click', () => closeModal('addExpenseModal'));
    document.getElementById('expenseCategoryFinance')?.addEventListener('change', updateExpenseSubcategory);
    document.getElementById('balanceViewYear')?.addEventListener('change', updateBalanceView);
    document.getElementById('balanceViewMonth')?.addEventListener('change', updateBalanceView);
    // Finance expense table actions
    const expenseTableBodyFinance = document.getElementById('expenseTableBodyFinance');
    if (expenseTableBodyFinance) {
        expenseTableBodyFinance.addEventListener('click', (event) => {
            const target = event.target;
            const deleteButton = target.closest('.btn-delete-expense');
            if (deleteButton) {
                const expenseIdStr = deleteButton.dataset.expenseId;
                if (expenseIdStr) {
                    const expenseId = parseInt(expenseIdStr, 10);
                    if (!isNaN(expenseId))
                        deleteExpense(expenseId);
                }
            }
        });
    }
    // Analytics Tab
    document.getElementById('generateReportButton')?.addEventListener('click', generateReport);
    document.getElementById('downloadMonthlyReport')?.addEventListener('click', () => downloadReport('月次'));
    document.getElementById('downloadQuarterlyReport')?.addEventListener('click', () => downloadReport('四半期'));
    document.getElementById('downloadAnnualReport')?.addEventListener('click', () => downloadReport('年次'));
    // Close modals on outside click
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal.active').forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}
// --- Initial Load ---
window.addEventListener('DOMContentLoaded', async () => {
    initializeSampleData();
    setupEventListeners();
    // Load customer data from API
    await loadCustomersFromAPI();
    const initialTab = document.querySelector('.nav-tab.active')?.getAttribute('data-tab-target') || 'home';
    switchTab(initialTab);
    if (initialTab === 'home') {
        initializeDashboardCharts();
        updateDashboardCharts();
    }
    else if (initialTab === 'finance') {
        initializeFinanceCharts();
        updateMonthlyBalanceChart();
    }
    else if (initialTab === 'subscription') {
        initializeSubscriptionCharts();
        updateCohortChart();
        updateMRRForecastChart();
    }
});
