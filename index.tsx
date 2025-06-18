
// Chart.js declaration for TypeScript
declare var Chart: any;

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// --- Type Definitions ---
interface Customer {
    id: number;
    name: string;
    plan: 'starter' | 'professional' | 'enterprise' | string; // Allow string for flexibility if new plans are added
    mrr: number;
    initialFee: number;
    operationFee: number;
    assignee: string;
    hours: number;
    region: string;
    industry: string;
    channel: string;
    status: 'active' | 'trial' | 'churned' | string; // Allow string
    startDate: string; // YYYY/MM/DD
    healthScore: number; // 0-100
    lastLogin: string; // YYYY/MM/DD
    supportTickets: number;
    npsScore: number; // 0-10
    usageRate: number; // 0-100
    churnDate?: string; // YYYY/MM/DD, optional
}

interface Expense {
    id: number;
    date: string; // YYYY/MM/DD
    name: string;
    category: string;
    subcategory?: string;
    amount: number;
    status: 'approved' | 'pending' | string; // Allow string
}

interface Campaign {
    id: number;
    name: string;
    channel: string;
    budget: number;
    spent: number;
    leads: number;
    conversions: number;
    startDate: string; // YYYY/MM/DD
    endDate: string; // YYYY/MM/DD
    status: 'active' | 'paused' | 'completed' | string; // Allow string
}

interface Lead {
    id: number;
    company: string;
    contact: string;
    email: string;
    source: string;
    score: number;
    status: 'hot' | 'warm' | 'cold' | 'converted' | string; // Allow string
    createdDate: string; // YYYY/MM/DD
}

interface DataStore {
    customers: Customer[];
    expenses: Expense[];
    campaigns: Campaign[];
    leads: Lead[];
}

// Global data store
const dataStore: DataStore = {
    customers: [],
    expenses: [],
    campaigns: [],
    leads: []
};

// Global charts object
const charts: { [key: string]: any } = {};


// --- Sample Data Initialization ---
function initializeSampleData() {
    dataStore.customers = [
        {
            id: 1, name: '株式会社ABC商事', plan: 'professional', mrr: 25000, initialFee: 100000, operationFee: 50000,
            assignee: '田中太郎', hours: 20, region: '関東', industry: '小売業', channel: 'Web検索', status: 'active',
            startDate: '2024/03/15', healthScore: 85, lastLogin: '2025/05/28', supportTickets: 2, npsScore: 9, usageRate: 92
        },
        {
            id: 2, name: 'DEF株式会社', plan: 'starter', mrr: 15000, initialFee: 50000, operationFee: 0,
            assignee: '佐藤花子', hours: 10, region: '関西', industry: 'IT', channel: '紹介', status: 'trial',
            startDate: '2025/05/26', healthScore: 70, lastLogin: '2025/05/29', supportTickets: 0, npsScore: 7, usageRate: 45
        },
        {
            id: 3, name: 'GHIコーポレーション', plan: 'enterprise', mrr: 50000, initialFee: 200000, operationFee: 100000,
            assignee: '山田次郎', hours: 40, region: '関東', industry: '製造業', channel: 'イベント', status: 'active',
            startDate: '2023/08/01', healthScore: 95, lastLogin: '2025/05/29', supportTickets: 1, npsScore: 10, usageRate: 98
        },
        {
            id: 4, name: '株式会社JKLテクノロジー', plan: 'professional', mrr: 25000, initialFee: 100000, operationFee: 30000,
            assignee: '田中太郎', hours: 15, region: '関東', industry: 'IT', channel: 'Web検索', status: 'active',
            startDate: '2025/01/10', healthScore: 75, lastLogin: '2025/05/25', supportTickets: 3, npsScore: 8, usageRate: 78
        },
        {
            id: 5, name: 'MNO物産', plan: 'starter', mrr: 15000, initialFee: 50000, operationFee: 0,
            assignee: '佐藤花子', hours: 8, region: '中部', industry: '卸売業', channel: '紹介', status: 'active',
            startDate: '2025/02/20', healthScore: 88, lastLogin: '2025/05/27', supportTickets: 0, npsScore: 9, usageRate: 85
        },
        {
            id: 6, name: 'PQRサービス', plan: 'enterprise', mrr: 50000, initialFee: 200000, operationFee: 80000,
            assignee: '山田次郎', hours: 35, region: '関西', industry: 'サービス業', channel: 'パートナー', status: 'active',
            startDate: '2025/03/05', healthScore: 60, lastLogin: '2025/05/20', supportTickets: 5, npsScore: 6, usageRate: 55
        },
        {
            id: 7, name: 'STUエンタープライズ', plan: 'professional', mrr: 30000, initialFee: 100000, operationFee: 40000,
            assignee: '田中太郎', hours: 25, region: '九州', industry: '金融', channel: '広告', status: 'active',
            startDate: '2024/11/15', healthScore: 82, lastLogin: '2025/05/28', supportTickets: 1, npsScore: 8, usageRate: 90
        },
        {
            id: 8, name: 'VWX製薬', plan: 'enterprise', mrr: 75000, initialFee: 300000, operationFee: 150000,
            assignee: '山田次郎', hours: 50, region: '関東', industry: '医療', channel: 'アウトバウンド', status: 'active',
            startDate: '2024/05/01', healthScore: 92, lastLogin: '2025/05/29', supportTickets: 2, npsScore: 9, usageRate: 95
        }
    ];

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
function switchTab(targetTabName: string, triggerElement?: HTMLElement) {
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
        if (headerTabForSidebar) headerTabForSidebar.classList.add('active');
    }


    // Update data based on tab
    if (targetTabName === 'home') updateDashboard();
    else if (targetTabName === 'sales') {
        renderCustomersTable();
        updateBulkDeleteButtonState(); // Ensure button state is correct on tab switch
    }
    else if (targetTabName === 'marketing') updateMarketing();
    else if (targetTabName === 'customer-success') updateCustomerSuccess();
    else if (targetTabName === 'finance') {
        const now = new Date();
        (document.getElementById('balanceViewYear') as HTMLSelectElement).value = String(now.getFullYear());
        (document.getElementById('balanceViewMonth') as HTMLSelectElement).value = String(now.getMonth() + 1);
        updateFinanceMetrics();
        renderExpensesTable();
        if (!charts.monthlyBalance) initializeFinanceCharts();
        setTimeout(() => updateMonthlyBalanceChart(), 100);
    }
    else if (targetTabName === 'analytics') updateAnalytics();
    else if (targetTabName === 'subscription') {
        updateSubscription();
        if (!charts.cohortChart) initializeSubscriptionCharts(); // Check for specific chart
    }
    // 'integrations' tab currently has static content in HTML
}


// --- Dashboard Updates ---
function updateDashboard() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const totalMRR = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const totalARR = totalMRR * 12;
    const subscriberCount = activeCustomers.length;

    (document.getElementById('totalMRR') as HTMLElement).textContent = `¥${totalMRR.toLocaleString()}`;
    (document.getElementById('annualRunRate') as HTMLElement).textContent = `¥${totalARR.toLocaleString()}`;
    (document.getElementById('subscriberCount') as HTMLElement).textContent = String(subscriberCount);

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

    (document.getElementById('newBusinessMRR') as HTMLElement).textContent = `¥${newBusinessMRR.toLocaleString()}`;
    (document.getElementById('expansionMRR') as HTMLElement).textContent = `¥${expansionMRR.toLocaleString()}`;
    (document.getElementById('contractionMRR') as HTMLElement).textContent = `¥${Math.abs(contractionMRR).toLocaleString()}`;
    (document.getElementById('churnMRR') as HTMLElement).textContent = `¥${Math.abs(churnMRR).toLocaleString()}`;
    (document.getElementById('reactivationMRR') as HTMLElement).textContent = '¥0'; // Placeholder
    (document.getElementById('netMRRChange') as HTMLElement).textContent = `¥${netMRRChange.toLocaleString()}`;
    (document.getElementById('netMRRChange') as HTMLElement).style.color = netMRRChange >= 0 ? '#00c853' : '#ff3b30';
    (document.getElementById('scheduledMRRChange') as HTMLElement).textContent = '¥50,000'; // Placeholder

    const lastMonthMRR = totalMRR - netMRRChange;
    const mrrGrowth = lastMonthMRR > 0 ? ((netMRRChange / lastMonthMRR) * 100) : (newBusinessMRR > 0 ? 100 : 0);
    const mrrChangeEl = document.getElementById('mrrChangePercent') as HTMLElement;
    mrrChangeEl.textContent = `${netMRRChange >= 0 ? '↑' : '↓'} ${Math.abs(mrrGrowth).toFixed(1)}% 前月比`;
    mrrChangeEl.className = `metric-change ${netMRRChange >= 0 ? 'positive' : 'negative'}`;

    const arrChangeEl = document.getElementById('arrChange') as HTMLElement;
    arrChangeEl.textContent = `${netMRRChange >= 0 ? '↑' : '↓'} ${Math.abs(mrrGrowth).toFixed(1)}% 過去30日間`;
    arrChangeEl.className = `metric-change ${netMRRChange >= 0 ? 'positive' : 'negative'}`;
    
    const newSubs = dataStore.customers.filter(c => {
        const sDate = new Date(c.startDate.replace(/\//g, '-'));
        return sDate.getMonth() === thisMonth && sDate.getFullYear() === thisYear;
    }).length;
    const subChangeEl = document.getElementById('subscriberChange') as HTMLElement;
    subChangeEl.textContent = `↑ ${newSubs} 新規`;
    subChangeEl.className = `metric-change positive`;


    updateTopWins();
    updateDashboardCharts();
}

function updateTopWins() {
    const topWinsContent = document.getElementById('topWinsContent') as HTMLElement;
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
    } else {
        topWinsContent.innerHTML = '<div class="no-data">今週の成果はありません</div>';
    }
}

// --- Sales Tab Functions ---
function renderCustomersTable() {
    const tbody = document.getElementById('customerTableBody') as HTMLTableSectionElement;
    const searchTerm = (document.getElementById('customerSearch') as HTMLInputElement).value.toLowerCase();
    const statusFilter = (document.getElementById('statusFilter') as HTMLSelectElement).value;
    const planFilter = (document.getElementById('planFilterSales') as HTMLSelectElement).value;

    const filteredCustomers = dataStore.customers.filter(customer => {
        const nameMatch = customer.name.toLowerCase().includes(searchTerm);
        const statusMatch = !statusFilter || customer.status === statusFilter;
        const planMatch = !planFilter || customer.plan === planFilter;
        return nameMatch && statusMatch && planMatch;
    });
    
    // Uncheck select all checkbox before rendering
    const selectAllCheckbox = document.getElementById('selectAllCustomersCheckbox') as HTMLInputElement | null;
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    if (filteredCustomers.length === 0) {
        if (dataStore.customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="14" class="no-data">顧客データがありません。</td></tr>`;
        } else {
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
    (document.getElementById('addCustomerForm') as HTMLFormElement).reset();
    (document.getElementById('addCustomerModal') as HTMLElement).classList.add('active');
}

function getNextCustomerId(): number {
    if (dataStore.customers.length === 0) {
        return 1;
    }
    return Math.max(...dataStore.customers.map(c => c.id)) + 1;
}

async function addCustomer() {
    const nameInput = document.getElementById('newCustomerName') as HTMLInputElement;
    const planInput = document.getElementById('newCustomerPlan') as HTMLSelectElement;
    const mrrInput = document.getElementById('newCustomerMrr') as HTMLInputElement;
    const initialFeeInput = document.getElementById('newCustomerInitialFee') as HTMLInputElement;
    const operationFeeInput = document.getElementById('newCustomerOperationFee') as HTMLInputElement;
    const assigneeInput = document.getElementById('newCustomerAssignee') as HTMLSelectElement;
    const hoursInput = document.getElementById('newCustomerHours') as HTMLInputElement;
    const regionInput = document.getElementById('newCustomerRegion') as HTMLSelectElement;
    const industryInput = document.getElementById('newCustomerIndustry') as HTMLSelectElement;
    const channelInput = document.getElementById('newCustomerChannel') as HTMLSelectElement;

    if (!nameInput.value || !planInput.value || !mrrInput.value || !assigneeInput.value || !hoursInput.value || !regionInput.value || !industryInput.value || !channelInput.value) {
        showNotification('必須項目を全て入力してください。', 'error');
        return;
    }


    const newCustomer: Customer = {
        id: getNextCustomerId(), // This might be overwritten by backend or used if backend doesn't assign one
        name: nameInput.value,
        plan: planInput.value,
        mrr: parseInt(mrrInput.value) || 0,
        initialFee: parseInt(initialFeeInput.value) || 0,
        operationFee: parseInt(operationFeeInput.value) || 0,
        assignee: assigneeInput.value,
        hours: parseInt(hoursInput.value) || 0,
        region: regionInput.value,
        industry: industryInput.value,
        channel: channelInput.value,
        status: 'trial', // Default status
        startDate: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
        healthScore: 70, // Default health score
        lastLogin: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/'),
        supportTickets: 0, // Default support tickets
        npsScore: 7, // Default NPS
        usageRate: 50 // Default usage rate
    };

    try {
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCustomer),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`サーバーエラー: ${response.status} ${errorText}`);
        }

        // Get the response from backend which includes the customer_id
        const savedResponse = await response.json();
        
        // Update the customer ID with the one from the database
        if (savedResponse.customer_id) {
            newCustomer.id = savedResponse.customer_id;
        }

        dataStore.customers.push(newCustomer); // Add to local store on successful save
        closeModal('addCustomerModal');
        renderCustomersTable();
        updateDashboard();
        updateFinanceMetrics();
        showNotification('顧客情報を保存し、追加しました', 'success');

    } catch (error) {
        console.error('顧客情報の保存に失敗しました:', error);
        showNotification(`顧客情報の保存に失敗しました: ${(error as Error).message}`, 'error');
        // Do not close modal, do not update local store
    }
}


function deleteCustomer(customerId: number) {
    if (confirm('この顧客を削除してもよろしいですか？')) {
        dataStore.customers = dataStore.customers.filter(c => c.id !== customerId);
        renderCustomersTable(); // This will also call updateBulkDeleteButtonState
        updateDashboard();
        updateFinanceMetrics();
        showNotification('顧客を削除しました', 'success');
    }
}

function bulkDeleteCustomers(customerIds: number[]) {
    if (customerIds.length === 0) {
        showNotification('削除する顧客が選択されていません。', 'error');
        return;
    }
    if (confirm(`選択した ${customerIds.length} 件の顧客を削除してもよろしいですか？`)) {
        dataStore.customers = dataStore.customers.filter(c => !customerIds.includes(c.id));
        renderCustomersTable(); // This will also call updateBulkDeleteButtonState
        updateDashboard();
        updateFinanceMetrics();
        showNotification(`${customerIds.length} 件の顧客を削除しました`, 'success');
        // Ensure selectAll checkbox is unchecked
        const selectAllCheckbox = document.getElementById('selectAllCustomersCheckbox') as HTMLInputElement | null;
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    }
}


function showCustomerDetail(customerId: number) {
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
    } else {
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


function showImportModal() {
    (document.getElementById('importModal') as HTMLElement).classList.add('active');
     // Reset file input
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
}

function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').map(line => line.trim()).filter(line => line); // Trim and remove empty lines
            
            if (lines.length <= 1) { // Only header or empty file
                showNotification('CSVファイルにデータがありません。', 'error');
                return;
            }

            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) { 
                const values = lines[i].split(',');
                if (values.length < 12) {
                    console.warn(`Skipping row ${i+1} due to insufficient columns: ${lines[i]}`);
                    continue; 
                }

                const newCustomer: Customer = {
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
                } else {
                    console.warn(`Skipping row ${i+1} due to missing name: ${lines[i]}`);
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
    } else {
        showNotification('CSVファイルを選択してください', 'error');
    }
}

function updateBulkDeleteButtonState() {
    const bulkDeleteButton = document.getElementById('bulkDeleteCustomersButton') as HTMLButtonElement | null;
    if (!bulkDeleteButton) return;

    const selectedCheckboxes = document.querySelectorAll('.customer-select-checkbox:checked');
    if (selectedCheckboxes.length > 0) {
        bulkDeleteButton.disabled = false;
    } else {
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

    (document.getElementById('totalLeads') as HTMLElement).textContent = String(totalLeads);
    (document.getElementById('conversionRate') as HTMLElement).textContent = `${conversionRate}%`;
    (document.getElementById('cplValue') as HTMLElement).textContent = `¥${cpl.toLocaleString()}`;
    (document.getElementById('totalLeadsChange') as HTMLElement).textContent = `↑ 0% 前月比`;
    (document.getElementById('conversionRateChange') as HTMLElement).textContent = `↑ 0% 前月比`;
    (document.getElementById('cplValueChange') as HTMLElement).textContent = `↓ 0% 前月比`;


    renderCampaigns();
    renderLeads();
}

function renderCampaigns() {
    const campaignList = document.getElementById('campaignList') as HTMLElement;
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
    const tbody = document.getElementById('leadTableBody') as HTMLTableSectionElement;
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
            <td>${getLeadScoreBadge(lead.score, lead.status as 'hot' | 'warm' | 'cold')}</td>
            <td><span class="status-badge pending">${lead.status === 'converted' ? '商談化済' : '新規'}</span></td>
            <td>${lead.createdDate}</td>
            <td>
                <button class="btn btn-secondary btn-convert-lead" data-lead-id="${lead.id}" ${lead.status === 'converted' ? ' disabled': ''}>商談化</button>
            </td>
        </tr>
    `).join('');
}

function getLeadScoreBadge(score: number, status: 'hot' | 'warm' | 'cold' | string) {
    return `<span class="lead-score ${status}">${score}</span>`;
}

function convertLead(leadId: number) {
    const lead = dataStore.leads.find(l => l.id === leadId);
    if (lead && lead.status !== 'converted') {
        lead.status = 'converted';
        showNotification(`${lead.company}を商談化しました`, 'success');
        renderLeads();
    } else if (lead && lead.status === 'converted') {
        showNotification(`${lead.company}は既に商談化されています`, 'error');
    }
}

function showAddCampaignModal() {
    (document.getElementById('addCampaignForm') as HTMLFormElement).reset();
    (document.getElementById('campaignStartDate') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
    (document.getElementById('addCampaignModal') as HTMLElement).classList.add('active');
}

function addCampaign() {
    const newCampaign: Campaign = {
        id: dataStore.campaigns.length > 0 ? Math.max(...dataStore.campaigns.map(c => c.id)) + 1 : 1,
        name: (document.getElementById('campaignName') as HTMLInputElement).value,
        channel: (document.getElementById('campaignChannel') as HTMLSelectElement).value,
        budget: parseInt((document.getElementById('campaignBudget') as HTMLInputElement).value) || 0,
        spent: 0, leads: 0, conversions: 0,
        startDate: (document.getElementById('campaignStartDate') as HTMLInputElement).value.replace(/-/g, '/'),
        endDate: (document.getElementById('campaignEndDate') as HTMLInputElement).value.replace(/-/g, '/'),
        status: 'active'
    };
    dataStore.campaigns.push(newCampaign);
    closeModal('addCampaignModal');
    updateMarketing();
    showNotification('キャンペーンを作成しました', 'success');
}

// --- Customer Success Tab Functions ---
function updateCustomerSuccess() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const npsScores = activeCustomers.map(c => c.npsScore).filter(score => typeof score === 'number');
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const nps = npsScores.length > 0 ? Math.round((promoters - detractors) / npsScores.length * 100) : 0;

    (document.getElementById('npsScore') as HTMLElement).textContent = String(nps);
    (document.getElementById('avgResponseTime') as HTMLElement).textContent = '2.5h'; // Placeholder
    (document.getElementById('csat') as HTMLElement).textContent = '92%'; // Placeholder
    (document.getElementById('npsScoreChange') as HTMLElement).textContent = `↑ 0 前四半期比`;
    (document.getElementById('avgResponseTimeChange') as HTMLElement).textContent = `↓ 0% 前月比`;
    (document.getElementById('csatChange') as HTMLElement).textContent = `↑ 0% 前月比`;


    renderHealthScores();
    renderCSTasks();
}

function renderHealthScores() {
    const tbody = document.getElementById('healthScoreTableBody') as HTMLTableSectionElement;
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
    const taskList = document.getElementById('csTaskList') as HTMLElement;
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

function toggleTask(taskId: number) {
    showNotification(`タスク ${taskId} のステータスを更新しました`, 'success');
}

// --- Finance Tab Functions ---
function updateFinanceMetrics(targetYear?: number, targetMonth?: number) {
    const now = new Date();
    const selectedYear = targetYear || parseInt((document.getElementById('balanceViewYear') as HTMLSelectElement)?.value) || now.getFullYear();
    const selectedMonth = targetMonth !== null ? targetMonth : (parseInt((document.getElementById('balanceViewMonth') as HTMLSelectElement)?.value) -1) ?? now.getMonth();


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
            if (customer.operationFee > 0) operationCount++;
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

    (document.getElementById('monthlyMRRIncome') as HTMLElement).textContent = `¥${monthlyMRR.toLocaleString()}`;
    (document.getElementById('mrrIncomeDetail') as HTMLElement).textContent = `アクティブ顧客: ${activeCount}社`;
    (document.getElementById('monthlyInitialFees') as HTMLElement).textContent = `¥${monthlyInitialFees.toLocaleString()}`;
    (document.getElementById('initialFeeCount') as HTMLElement).textContent = `新規${newCount}件`;
    (document.getElementById('monthlyOperationFees') as HTMLElement).textContent = `¥${monthlyOperationFees.toLocaleString()}`;
    (document.getElementById('operationFeeChangeFinance') as HTMLElement).textContent = `対象顧客: ${operationCount}社`;
    
    (document.getElementById('monthlyTotalIncome') as HTMLElement).textContent = `¥${totalIncome.toLocaleString()}`;
    (document.getElementById('monthlyTotalExpense') as HTMLElement).textContent = `¥${totalExpense.toLocaleString()}`;
    const monthlyBalanceEl = document.getElementById('monthlyBalance') as HTMLElement;
    monthlyBalanceEl.textContent = `¥${balance.toLocaleString()}`;
    monthlyBalanceEl.className = `metric-value ${balance >=0 ? '' : 'negative'}`; 
    const balanceChangeEl = document.getElementById('balanceChange') as HTMLElement;
    balanceChangeEl.textContent = `利益率: ${profitMargin}%`;
    balanceChangeEl.className = `metric-change ${balance >= 0 ? 'positive' : 'negative'}`;

    updateExpenseCategoryBreakdown(monthlyExpenses);
    updateBalanceTable(totalIncome, monthlyMRR, monthlyInitialFees, monthlyOperationFees, monthlyExpenses);
    return { totalIncome, totalExpense, balance };
}


function updateExpenseCategoryBreakdown(currentMonthExpenses: Expense[]) {
    const categoryTotals: { [key: string]: number } = {};
    currentMonthExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const breakdownDiv = document.getElementById('expenseCategoryBreakdown') as HTMLElement;
    const totalMonthlyExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (Object.keys(categoryTotals).length === 0) {
        breakdownDiv.innerHTML = `<div class="no-data">今月の経費データがありません。</div>`;
        return;
    }

    breakdownDiv.innerHTML = Object.entries(categoryTotals)
        .sort(([,a],[,b]) => b-a) 
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

function updateBalanceTable(totalIncome: number, mrr: number, initialFees: number, operationFees: number, monthlyExpenses: Expense[]) {
    const tbody = document.getElementById('balanceTableBody') as HTMLTableSectionElement;
    const rows: any[] = [];

    if (mrr > 0) rows.push({ name: '月額利用料（MRR）', category: '売上高', income: mrr, expense: 0 });
    if (initialFees > 0) rows.push({ name: '初期導入費用', category: '売上高', income: initialFees, expense: 0 });
    if (operationFees > 0) rows.push({ name: '運用代行費', category: '売上高', income: operationFees, expense: 0 });

    const expenseByCategory: { [key: string]: number } = {};
    monthlyExpenses.forEach(exp => {
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
    });
    Object.entries(expenseByCategory).forEach(([category, amount]) => {
        rows.push({ name: category, category: '経費', income: 0, expense: amount });
    });

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">収支データがありません。</td></tr>`;
    } else {
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
    (document.getElementById('totalIncomeFooter') as HTMLElement).textContent = `¥${totalIncome.toLocaleString()}`;
    (document.getElementById('totalExpenseFooter') as HTMLElement).textContent = `¥${totalExpenseVal.toLocaleString()}`;
    const totalBalanceFooterEl = document.getElementById('totalBalanceFooter') as HTMLElement;
    totalBalanceFooterEl.textContent = `¥${(totalIncome - totalExpenseVal).toLocaleString()}`;
    totalBalanceFooterEl.className = (totalIncome - totalExpenseVal) >= 0 ? 'positive' : 'negative';
}

function renderExpensesTable() {
    const tbody = document.getElementById('expenseTableBodyFinance') as HTMLTableSectionElement;
    if (dataStore.expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">経費データがありません。</td></tr>`;
        return;
    }
    tbody.innerHTML = dataStore.expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => `
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
    (document.getElementById('addExpenseFormFinance') as HTMLFormElement).reset();
    (document.getElementById('expenseDate') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
    updateExpenseSubcategory(); 
    (document.getElementById('addExpenseModal') as HTMLElement).classList.add('active');
}

function addExpense() {
    const newExpense: Expense = {
        id: dataStore.expenses.length > 0 ? Math.max(...dataStore.expenses.map(e => e.id)) + 1 : 1,
        date: (document.getElementById('expenseDate') as HTMLInputElement).value.replace(/-/g, '/'),
        name: (document.getElementById('expenseName') as HTMLInputElement).value,
        category: (document.getElementById('expenseCategoryFinance') as HTMLSelectElement).value,
        subcategory: (document.getElementById('expenseSubcategory') as HTMLSelectElement).value || '',
        amount: parseInt((document.getElementById('expenseAmount') as HTMLInputElement).value) || 0,
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


function deleteExpense(expenseId: number) {
    if (confirm('この経費を削除してもよろしいですか？')) {
        dataStore.expenses = dataStore.expenses.filter(e => e.id !== expenseId);
        renderExpensesTable();
        updateFinanceMetrics();
        showNotification('経費を削除しました', 'success');
    }
}

function updateExpenseSubcategory() {
    const category = (document.getElementById('expenseCategoryFinance') as HTMLSelectElement).value;
    const subcategoryGroup = document.getElementById('subcategoryGroup') as HTMLElement;
    const subcategorySelect = document.getElementById('expenseSubcategory') as HTMLSelectElement;

    const subcategories: { [key: string]: string[] } = {
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
    } else {
        subcategoryGroup.style.display = 'none';
        subcategorySelect.innerHTML = '<option value="">選択してください</option>'; 
        subcategorySelect.value = '';
    }
}


function updateBalanceView() {
    const year = parseInt((document.getElementById('balanceViewYear') as HTMLSelectElement).value);
    const month = parseInt((document.getElementById('balanceViewMonth') as HTMLSelectElement).value) - 1;
    updateFinanceMetrics(year, month);
    updateMonthlyBalanceChart(); 
}


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
    },0);
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

    (document.getElementById('cacValue') as HTMLElement).textContent = `¥${Math.round(cac).toLocaleString()}`;
    (document.getElementById('ltvValue') as HTMLElement).textContent = `¥${Math.round(ltv).toLocaleString()}`;
    (document.getElementById('ltvCacRatio') as HTMLElement).textContent = ltvCacRatio.toFixed(1);
    (document.getElementById('cacValueChange') as HTMLElement).textContent = `↓ 0% 前月比`;
    (document.getElementById('ltvValueChange') as HTMLElement).textContent = `↑ 0% 前月比`;
    (document.getElementById('ltvCacRatioChange') as HTMLElement).textContent = `↑ 0 前月比`;


    const starterCustomers = activeCustomers.filter(c => c.plan === 'starter');
    const professionalCustomers = activeCustomers.filter(c => c.plan === 'professional');
    const enterpriseCustomers = activeCustomers.filter(c => c.plan === 'enterprise');
    (document.getElementById('starterMetrics') as HTMLElement).textContent = `¥${starterCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    (document.getElementById('starterMetricsCount') as HTMLElement).textContent = `顧客数: ${starterCustomers.length}`;
    (document.getElementById('professionalMetrics') as HTMLElement).textContent = `¥${professionalCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    (document.getElementById('professionalMetricsCount') as HTMLElement).textContent = `顧客数: ${professionalCustomers.length}`;
    (document.getElementById('enterpriseMetrics') as HTMLElement).textContent = `¥${enterpriseCustomers.reduce((s, c) => s + c.mrr, 0).toLocaleString()}`;
    (document.getElementById('enterpriseMetricsCount') as HTMLElement).textContent = `顧客数: ${enterpriseCustomers.length}`;

    const ltvTableBody = document.getElementById('ltvAnalysisTableBody') as HTMLTableSectionElement;
    if(activeCustomers.length === 0) {
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
function downloadReport(type: string) { showNotification(`${type}レポートをダウンロード中...`, 'success'); }


// --- Subscription Tab Functions ---
function updateSubscription() {
    const activeCustomers = dataStore.customers.filter(c => c.status === 'active');
    const totalMRR = activeCustomers.reduce((sum, c) => sum + c.mrr, 0);
    const totalARR = totalMRR * 12;
    
    const nrr = 100 + (Math.random() * 10 - 5); 
    
    const churnedLastMonth = dataStore.customers.filter(c => {
        if (c.status !== 'churned' || !c.churnDate) return false;
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
                (c.status === 'active' || (c.status === 'churned' && c.churnDate && new Date(c.churnDate.replace(/\//g, '-')) >= firstDayLastMonth ));
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

    (document.getElementById('subMRR') as HTMLElement).textContent = `¥${totalMRR.toLocaleString()}`;
    (document.getElementById('subARR') as HTMLElement).textContent = `¥${totalARR.toLocaleString()}`;
    (document.getElementById('nrr') as HTMLElement).textContent = `${nrr.toFixed(0)}%`;
    (document.getElementById('monthlyChurnRate') as HTMLElement).textContent = `${monthlyChurnRate.toFixed(1)}%`;
    (document.getElementById('arpa') as HTMLElement).textContent = `¥${Math.round(arpa).toLocaleString()}`;
    (document.getElementById('avgRetentionMonths') as HTMLElement).textContent = `${avgRetentionMonths}ヶ月`;

    (document.getElementById('subMRRChange') as HTMLElement).textContent = `↑ 0% 前月比`;
    (document.getElementById('subARRChange') as HTMLElement).textContent = `↑ 0% 前年比`;
    (document.getElementById('nrrChange') as HTMLElement).textContent = `↑ 0% 前四半期比`;
    (document.getElementById('monthlyChurnRateChange') as HTMLElement).textContent = `↓ 0% 前月比`;
    (document.getElementById('arpaChange') as HTMLElement).textContent = `↑ 0% 前月比`;
    (document.getElementById('avgRetentionMonthsDetail') as HTMLElement).textContent = `業界平均: 24ヶ月`;

    if (charts.cohortChart) updateCohortChart();
    if (charts.mrrForecastChart) updateMRRForecastChart();
}


// --- Charting Functions ---
function initializeDashboardCharts() {
    // Destroy existing charts before creating new ones
    if (charts.mrr) {
        charts.mrr.destroy();
        charts.mrr = undefined;
    }
    if (charts.subscribers) {
        charts.subscribers.destroy();
        charts.subscribers = undefined;
    }
    if (charts.arr) {
        charts.arr.destroy();
        charts.arr = undefined;
    }
    if (charts.mrrMovements) {
        charts.mrrMovements.destroy();
        charts.mrrMovements = undefined;
    }

    const mrrCtx = (document.getElementById('mrrChart') as HTMLCanvasElement)?.getContext('2d');
    if (mrrCtx) {
        charts.mrr = new Chart(mrrCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const subscribersCtx = (document.getElementById('subscribersChart') as HTMLCanvasElement)?.getContext('2d');
    if (subscribersCtx) {
        charts.subscribers = new Chart(subscribersCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const arrCtx = (document.getElementById('arrChart') as HTMLCanvasElement)?.getContext('2d');
    if (arrCtx) {
        charts.arr = new Chart(arrCtx, {
            type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const mrrMovementsCtx = (document.getElementById('mrrMovementsChart') as HTMLCanvasElement)?.getContext('2d');
    if (mrrMovementsCtx) {
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
                scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (value: any) => `¥${(Number(value) / 1000).toLocaleString()}k` } } }
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
    const activeCustomers = dataStore.customers.filter(c=>c.status==='active');
    const currentMRR = activeCustomers.reduce((s,c)=>s+c.mrr,0);
    const currentSubscribers = activeCustomers.length;

    const mrrData = [80000, 90000, 115000, 140000, currentMRR];
    const subscriberData = [3, 3, 4, 5, currentSubscribers];
    const arrData = mrrData.map(mrr => mrr * 12);
    
    const newMrrData = [30000, 25000, 40000, 50000, Number((document.getElementById('newBusinessMRR') as HTMLElement).textContent?.replace(/[^0-9]/g,'')) || 0]; 
    const expansionMrrData = [5000, 10000, 15000, 25000, Number((document.getElementById('expansionMRR') as HTMLElement).textContent?.replace(/[^0-9]/g,'')) || 0];
    const churnMrrData = [-10000, -20000, -30000, -50000, -Math.abs(Number((document.getElementById('churnMRR') as HTMLElement).textContent?.replace(/[^0-9]/g,'')) || 0)];


    if (charts.mrr) { charts.mrr.data.labels = labels; charts.mrr.data.datasets[0].data = mrrData; charts.mrr.update(); }
    if (charts.subscribers) { charts.subscribers.data.labels = labels; charts.subscribers.data.datasets[0].data = subscriberData; charts.subscribers.update(); }
    if (charts.arr) { charts.arr.data.labels = labels; charts.arr.data.datasets[0].data = arrData; charts.arr.update(); }
    if (charts.mrrMovements) {
        charts.mrrMovements.data.labels = labels;
        charts.mrrMovements.data.datasets[0].data = newMrrData.map(Number);
        charts.mrrMovements.data.datasets[1].data = expansionMrrData.map(Number);
        charts.mrrMovements.data.datasets[2].data = churnMrrData.map(Number);
        charts.mrrMovements.update();
    }
}

function initializeFinanceCharts() {
    // Destroy existing chart before creating new one
    if (charts.monthlyBalance) {
        charts.monthlyBalance.destroy();
        charts.monthlyBalance = undefined;
    }

    const monthlyBalanceCtx = (document.getElementById('monthlyBalanceChart') as HTMLCanvasElement)?.getContext('2d');
    if (monthlyBalanceCtx) {
        charts.monthlyBalance = new Chart(monthlyBalanceCtx, {
            type: 'line',
            data: { labels: [], datasets: [
                { label: '収入', data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4, fill: true },
                { label: '支出', data: [], borderColor: '#ff3b30', backgroundColor: 'rgba(255,59,48,0.1)', tension: 0.4, fill: true },
                { label: '収支', data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4, borderWidth: 3, fill: true }
            ]},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}` } } },
                       scales: { y: { beginAtZero: false, ticks: { callback: (value: any) => `¥${(Number(value)/1000000).toFixed(1)}M` } } } }
        });
    }
}

function updateMonthlyBalanceChart() {
    if (!charts.monthlyBalance) initializeFinanceCharts();
    if (!charts.monthlyBalance) return; 

    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    const balanceData: number[] = [];
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
    // Destroy existing charts before creating new ones
    if (charts.cohortChart) {
        charts.cohortChart.destroy();
        charts.cohortChart = undefined;
    }
    if (charts.mrrForecastChart) {
        charts.mrrForecastChart.destroy();
        charts.mrrForecastChart = undefined;
    }

    const cohortCtx = (document.getElementById('cohortChart') as HTMLCanvasElement)?.getContext('2d');
    if (cohortCtx) {
        charts.cohortChart = new Chart(cohortCtx, {
            type: 'line', data: { labels: ['月1', '月2', '月3', '月4', '月5', '月6'], datasets: [
                { label: '2025年1月コホート', data: [], borderColor: '#0066ff', backgroundColor: 'rgba(0,102,255,0.1)', tension: 0.4, fill:true },
                { label: '2025年2月コホート', data: [], borderColor: '#00c853', backgroundColor: 'rgba(0,200,83,0.1)', tension: 0.4, fill:true }
            ]},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx:any) => `${ctx.dataset.label}: ${ctx.parsed.y}%` } } },
                       scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (value:any) => `${Number(value)}%` } } } }
        });
    }
    const mrrForecastCtx = (document.getElementById('mrrForecastChart') as HTMLCanvasElement)?.getContext('2d');
    if (mrrForecastCtx) {
        charts.mrrForecastChart = new Chart(mrrForecastCtx, {
            type: 'line', data: { labels: [], datasets: [
                { label: '実績MRR', data: [], borderColor: '#0066ff', tension: 0.4, fill:true },
                { label: '予測MRR', data: [], borderColor: '#00c853', borderDash: [5, 5], tension: 0.4, fill:true }
            ]},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' }, tooltip: { callbacks: { label: (ctx:any) => `${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}` } } },
                       scales: { y: { beginAtZero: true, ticks: { callback: (value:any) => `¥${(Number(value)/1000).toFixed(0)}K` } } } }
        });
    }
}

function updateCohortChart() { 
    if(!charts.cohortChart) initializeSubscriptionCharts();
    if(!charts.cohortChart) return;
    charts.cohortChart.data.datasets[0].data = [100, 95, 92, 90, 88, 87];
    charts.cohortChart.data.datasets[1].data = [100, 96, 93, 91, 90]; 
    charts.cohortChart.update();
}
function updateMRRForecastChart() { 
    if(!charts.mrrForecastChart) initializeSubscriptionCharts();
    if(!charts.mrrForecastChart) return;

    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const actualMRR = [80000, 90000, 115000, 140000, 215000]; 
    const forecastMRR : (number | null)[] = actualMRR.map(val => val as number | null); 

    const actualMRRForChart = [...actualMRR];
    for(let i=actualMRRForChart.length; i<labels.length; i++) {
        (actualMRRForChart as (number|null)[]).push(null);
    }
    
    let lastActual = forecastMRR[forecastMRR.length-1] || 215000;

    for(let i = actualMRR.length; i<labels.length; i++) {
        lastActual = lastActual * (1 + (0.02 + Math.random()*0.03)); 
        forecastMRR.push(Math.round(lastActual));
    }
    if (forecastMRR.length > actualMRR.length && actualMRR.length > 0) {
       forecastMRR[actualMRR.length -1] = actualMRR[actualMRR.length-1];
    }


    charts.mrrForecastChart.data.labels = labels;
    charts.mrrForecastChart.data.datasets[0].data = actualMRRForChart;
    charts.mrrForecastChart.data.datasets[1].data = forecastMRR;
    charts.mrrForecastChart.update();
}


// --- Utility Functions ---
function getPlanName(planKey: string): string {
    const plans: { [key: string]: string } = { 'starter': 'スターター', 'professional': 'プロフェッショナル', 'enterprise': 'エンタープライズ' };
    return plans[planKey] || planKey;
}

function getStatusBadge(statusKey: string): string {
    const badgeClasses: { [key: string]: string } = { 'active': 'active', 'trial': 'trial', 'churned': 'churned', 'pending': 'pending', 'approved': 'active' };
    const statusNames: { [key: string]: string } = { 'active': 'アクティブ', 'trial': 'トライアル', 'churned': '解約', 'pending': '申請中', 'approved': '承認済' };
    return `<span class="status-badge ${badgeClasses[statusKey] || 'pending'}">${statusNames[statusKey] || statusKey}</span>`;
}

function closeModal(modalId: string) {
    const modal = document.getElementById(modalId) as HTMLElement;
    if (modal) modal.classList.remove('active');
}

function showNotification(message: string, type: 'success' | 'error') {
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
            const targetTabName = (event.currentTarget as HTMLElement).dataset.tabTarget;
            if (targetTabName) {
                switchTab(targetTabName, event.currentTarget as HTMLElement);
            }
        });
    });

    // Sales Tab Modals & Actions
    document.getElementById('showAddCustomerModalButton')?.addEventListener('click', showAddCustomerModal);
    document.getElementById('confirmAddCustomerButton')?.addEventListener('click', addCustomer);
    document.getElementById('closeAddCustomerModalButton')?.addEventListener('click', () => closeModal('addCustomerModal'));
    document.getElementById('cancelAddCustomerButton')?.addEventListener('click', () => closeModal('addCustomerModal'));
    document.getElementById('exportCustomersButton')?.addEventListener('click', exportCustomers);
    document.getElementById('showImportModalButton')?.addEventListener('click', showImportModal);
    document.getElementById('bulkDeleteCustomersButton')?.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.customer-select-checkbox:checked');
        const customerIdsToBulkDelete: number[] = [];
        selectedCheckboxes.forEach(checkbox => {
            const id = (checkbox as HTMLElement).dataset.customerId;
            if (id) customerIdsToBulkDelete.push(parseInt(id, 10));
        });
        bulkDeleteCustomers(customerIdsToBulkDelete);
    });
    
    // Sales Tab Filters
    document.getElementById('customerSearch')?.addEventListener('input', renderCustomersTable);
    document.getElementById('statusFilter')?.addEventListener('change', renderCustomersTable);
    document.getElementById('planFilterSales')?.addEventListener('change', renderCustomersTable);

    // Customer table actions (Details, Delete, Select) via event delegation
    const customerTableBody = document.getElementById('customerTableBody');
    if (customerTableBody) {
        customerTableBody.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            
            // Handle row checkbox click
            if (target.classList.contains('customer-select-checkbox')) {
                const checkbox = target as HTMLInputElement;
                const row = checkbox.closest('tr');
                if (row) {
                    row.classList.toggle('customer-row-selected', checkbox.checked);
                }
                updateBulkDeleteButtonState();
                
                // Update selectAllCustomersCheckbox state
                const allCheckboxes = customerTableBody.querySelectorAll('.customer-select-checkbox');
                const allChecked = Array.from(allCheckboxes).every(cb => (cb as HTMLInputElement).checked);
                const selectAll = document.getElementById('selectAllCustomersCheckbox') as HTMLInputElement | null;
                if (selectAll) {
                    selectAll.checked = allChecked && allCheckboxes.length > 0;
                }
                return;
            }
            
            const detailButton = target.closest('.btn-show-detail') as HTMLButtonElement | null;
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
            
            const deleteButton = target.closest('.btn-delete-customer') as HTMLButtonElement | null;
            if (deleteButton) {
                const customerIdStr = deleteButton.dataset.customerId;
                if (customerIdStr) {
                    const customerId = parseInt(customerIdStr, 10);
                    if (!isNaN(customerId)) {
                        deleteCustomer(customerId);
                    }
                }
                return; 
            }
        });
    }
    
    // Select All Customers Checkbox
    const selectAllCustomersCheckbox = document.getElementById('selectAllCustomersCheckbox') as HTMLInputElement | null;
    if (selectAllCustomersCheckbox) {
        selectAllCustomersCheckbox.addEventListener('change', (event) => {
            const isChecked = (event.target as HTMLInputElement).checked;
            const rowCheckboxes = document.querySelectorAll('#customerTableBody .customer-select-checkbox');
            rowCheckboxes.forEach(checkbox => {
                (checkbox as HTMLInputElement).checked = isChecked;
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
    document.getElementById('selectFileButton')?.addEventListener('click', () => (document.getElementById('csvFileInput') as HTMLInputElement).click());
    document.getElementById('csvFileInput')?.addEventListener('change', handleFileUpload);
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault(); uploadArea.classList.remove('drag-over');
            const files = (e as DragEvent).dataTransfer?.files;
            if (files && files.length > 0) handleFileUpload({ target: { files } } as unknown as Event);
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
            const target = event.target as HTMLElement;
            const convertButton = target.closest('.btn-convert-lead') as HTMLButtonElement | null;
            if (convertButton) {
                const leadIdStr = convertButton.dataset.leadId;
                if (leadIdStr) {
                    const leadId = parseInt(leadIdStr, 10);
                    if (!isNaN(leadId)) convertLead(leadId);
                }
            }
        });
    }


    // Customer Success task list actions
    const csTaskList = document.getElementById('csTaskList');
    if (csTaskList) {
        csTaskList.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            if (target.classList.contains('task-checkbox')) {
                const taskIdStr = target.dataset.taskId;
                if (taskIdStr) {
                    const taskId = parseInt(taskIdStr, 10);
                    if (!isNaN(taskId)) toggleTask(taskId); 
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
            const target = event.target as HTMLElement;
            const deleteButton = target.closest('.btn-delete-expense') as HTMLButtonElement | null;
            if (deleteButton) {
                const expenseIdStr = deleteButton.dataset.expenseId;
                if (expenseIdStr) {
                    const expenseId = parseInt(expenseIdStr, 10);
                    if (!isNaN(expenseId)) deleteExpense(expenseId);
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
// Function to load customers from database
async function loadCustomersFromDatabase() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.customers) {
                // Replace sample data with database data
                dataStore.customers = data.customers;
                console.log(`Loaded ${data.customers.length} customers from database`);
                
                // Update all views
                renderCustomersTable();
                updateDashboard();
                updateFinanceMetrics();
            }
        }
    } catch (error) {
        console.error('Failed to load customers from database:', error);
        // Continue with sample data if database load fails
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    initializeSampleData();
    setupEventListeners();
    
    // Load customers from database
    await loadCustomersFromDatabase();
    
    const initialTab = document.querySelector('.nav-tab.active')?.getAttribute('data-tab-target') || 'home';
    switchTab(initialTab);

    if (initialTab === 'home') {
        initializeDashboardCharts();
        updateDashboardCharts(); 
    } else if (initialTab === 'finance') {
        initializeFinanceCharts();
        updateMonthlyBalanceChart();
    } else if (initialTab === 'subscription') {
        initializeSubscriptionCharts();
        updateCohortChart();
        updateMRRForecastChart();
    }
});
