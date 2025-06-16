"""
SaaS販売管理システムの拡張APIエンドポイント
"""
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta, date
from models import db, Contract, Invoice, InvoiceItem, Payment, RecurringBilling, ContractHistory
from models import ContractStatus, InvoiceStatus, PaymentStatus, BillingCycle
import random
import string

api_bp = Blueprint('api', __name__, url_prefix='/api')

def generate_contract_number():
    """契約番号を生成"""
    prefix = "CTR"
    timestamp = datetime.now().strftime("%Y%m")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_suffix}"

def generate_invoice_number():
    """請求書番号を生成"""
    prefix = "INV"
    timestamp = datetime.now().strftime("%Y%m")
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{timestamp}-{random_suffix}"

# 契約管理エンドポイント
@api_bp.route('/contracts', methods=['GET'])
def get_contracts():
    """契約一覧を取得"""
    try:
        contracts = Contract.query.all()
        result = []
        for contract in contracts:
            result.append({
                'id': contract.id,
                'customer_id': contract.customer_id,
                'customer_name': contract.customer.name,
                'contract_number': contract.contract_number,
                'plan': contract.plan,
                'start_date': contract.start_date.isoformat(),
                'end_date': contract.end_date.isoformat(),
                'auto_renewal': contract.auto_renewal,
                'mrr': contract.mrr,
                'status': contract.status.value,
                'notes': contract.notes,
                'created_at': contract.created_at.isoformat()
            })
        return jsonify({'contracts': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/contracts', methods=['POST'])
def create_contract():
    """新規契約を作成"""
    try:
        data = request.json
        
        # 契約番号を自動生成
        contract_number = generate_contract_number()
        
        # 契約を作成
        contract = Contract(
            customer_id=data['customer_id'],
            contract_number=contract_number,
            plan=data['plan'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            auto_renewal=data.get('auto_renewal', True),
            mrr=data['mrr'],
            status=ContractStatus.ACTIVE,
            notes=data.get('notes', '')
        )
        
        db.session.add(contract)
        db.session.flush()
        
        # 定期請求設定を作成
        if data.get('enable_recurring_billing', True):
            billing_cycle = BillingCycle(data.get('billing_cycle', 'monthly'))
            next_billing_date = contract.start_date
            
            recurring_billing = RecurringBilling(
                customer_id=contract.customer_id,
                contract_id=contract.id,
                billing_cycle=billing_cycle,
                next_billing_date=next_billing_date,
                is_active=True
            )
            db.session.add(recurring_billing)
        
        # 契約履歴を記録
        history = ContractHistory(
            contract_id=contract.id,
            action='created',
            new_values={
                'plan': contract.plan,
                'mrr': contract.mrr,
                'start_date': contract.start_date.isoformat(),
                'end_date': contract.end_date.isoformat()
            },
            changed_by=data.get('created_by', 'system')
        )
        db.session.add(history)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Contract created successfully',
            'contract_id': contract.id,
            'contract_number': contract_number
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/contracts/<int:contract_id>', methods=['PUT'])
def update_contract(contract_id):
    """契約を更新"""
    try:
        contract = Contract.query.get_or_404(contract_id)
        data = request.json
        
        # 変更前の値を保存
        old_values = {
            'plan': contract.plan,
            'mrr': contract.mrr,
            'auto_renewal': contract.auto_renewal,
            'status': contract.status.value
        }
        
        # 契約を更新
        if 'plan' in data:
            contract.plan = data['plan']
        if 'mrr' in data:
            contract.mrr = data['mrr']
        if 'auto_renewal' in data:
            contract.auto_renewal = data['auto_renewal']
        if 'status' in data:
            contract.status = ContractStatus(data['status'])
        if 'notes' in data:
            contract.notes = data['notes']
        
        # 変更履歴を記録
        history = ContractHistory(
            contract_id=contract.id,
            action='modified',
            old_values=old_values,
            new_values={
                'plan': contract.plan,
                'mrr': contract.mrr,
                'auto_renewal': contract.auto_renewal,
                'status': contract.status.value
            },
            changed_by=data.get('modified_by', 'system')
        )
        db.session.add(history)
        
        db.session.commit()
        
        return jsonify({'message': 'Contract updated successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 請求書管理エンドポイント
@api_bp.route('/invoices', methods=['GET'])
def get_invoices():
    """請求書一覧を取得"""
    try:
        status = request.args.get('status')
        customer_id = request.args.get('customer_id')
        
        query = Invoice.query
        
        if status:
            query = query.filter_by(status=InvoiceStatus(status))
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        
        invoices = query.all()
        result = []
        
        for invoice in invoices:
            result.append({
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'customer_id': invoice.customer_id,
                'customer_name': invoice.customer.name,
                'issue_date': invoice.issue_date.isoformat(),
                'due_date': invoice.due_date.isoformat(),
                'amount': float(invoice.amount),
                'tax_amount': float(invoice.tax_amount),
                'total_amount': float(invoice.total_amount),
                'status': invoice.status.value,
                'paid_date': invoice.paid_date.isoformat() if invoice.paid_date else None,
                'created_at': invoice.created_at.isoformat()
            })
        
        return jsonify({'invoices': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/invoices', methods=['POST'])
def create_invoice():
    """請求書を作成"""
    try:
        data = request.json
        
        # 請求書番号を自動生成
        invoice_number = generate_invoice_number()
        
        # 請求書を作成
        invoice = Invoice(
            invoice_number=invoice_number,
            customer_id=data['customer_id'],
            contract_id=data.get('contract_id'),
            issue_date=datetime.strptime(data['issue_date'], '%Y-%m-%d').date(),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
            amount=data['amount'],
            tax_amount=data.get('tax_amount', 0),
            total_amount=data['total_amount'],
            status=InvoiceStatus.DRAFT,
            notes=data.get('notes', '')
        )
        
        db.session.add(invoice)
        db.session.flush()
        
        # 請求明細を追加
        for item_data in data.get('items', []):
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=item_data['description'],
                quantity=item_data.get('quantity', 1),
                unit_price=item_data['unit_price'],
                amount=item_data['amount']
            )
            db.session.add(item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice_id': invoice.id,
            'invoice_number': invoice_number
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/invoices/<int:invoice_id>/send', methods=['POST'])
def send_invoice(invoice_id):
    """請求書を送信"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        # ステータスを送信済みに更新
        invoice.status = InvoiceStatus.SENT
        
        # TODO: 実際のメール送信処理を実装
        # send_invoice_email(invoice)
        
        db.session.commit()
        
        return jsonify({'message': 'Invoice sent successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 支払い管理エンドポイント
@api_bp.route('/payments', methods=['GET'])
def get_payments():
    """支払い履歴を取得"""
    try:
        customer_id = request.args.get('customer_id')
        
        query = Payment.query
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        
        payments = query.order_by(Payment.payment_date.desc()).all()
        result = []
        
        for payment in payments:
            result.append({
                'id': payment.id,
                'customer_id': payment.customer_id,
                'customer_name': payment.customer.name,
                'invoice_id': payment.invoice_id,
                'invoice_number': payment.invoice.invoice_number if payment.invoice else None,
                'payment_date': payment.payment_date.isoformat(),
                'amount': float(payment.amount),
                'payment_method': payment.payment_method.value,
                'transaction_id': payment.transaction_id,
                'status': payment.status.value,
                'created_at': payment.created_at.isoformat()
            })
        
        return jsonify({'payments': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/payments', methods=['POST'])
def record_payment():
    """支払いを記録"""
    try:
        data = request.json
        
        # 支払いを記録
        payment = Payment(
            customer_id=data['customer_id'],
            invoice_id=data.get('invoice_id'),
            payment_date=datetime.strptime(data['payment_date'], '%Y-%m-%d').date(),
            amount=data['amount'],
            payment_method=PaymentMethod(data['payment_method']),
            transaction_id=data.get('transaction_id'),
            status=PaymentStatus.COMPLETED,
            notes=data.get('notes', '')
        )
        
        db.session.add(payment)
        
        # 請求書のステータスを更新
        if payment.invoice_id:
            invoice = Invoice.query.get(payment.invoice_id)
            if invoice:
                invoice.status = InvoiceStatus.PAID
                invoice.paid_date = payment.payment_date
                invoice.payment_method = data['payment_method']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment recorded successfully',
            'payment_id': payment.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 定期請求処理
@api_bp.route('/billing/process-recurring', methods=['POST'])
def process_recurring_billing():
    """定期請求を処理"""
    try:
        # 本日が請求日の定期請求を取得
        today = date.today()
        recurring_billings = RecurringBilling.query.filter(
            RecurringBilling.next_billing_date <= today,
            RecurringBilling.is_active == True
        ).all()
        
        processed = 0
        for billing in recurring_billings:
            contract = billing.contract
            
            # 請求書を作成
            invoice_number = generate_invoice_number()
            invoice = Invoice(
                invoice_number=invoice_number,
                customer_id=contract.customer_id,
                contract_id=contract.id,
                issue_date=today,
                due_date=today + timedelta(days=30),
                amount=contract.mrr,
                tax_amount=contract.mrr * 0.1,  # 10%の税金
                total_amount=contract.mrr * 1.1,
                status=InvoiceStatus.SENT,
                notes=f"定期請求 - {contract.plan}プラン"
            )
            db.session.add(invoice)
            db.session.flush()
            
            # 請求明細を追加
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=f"{contract.plan}プラン - 月額料金",
                quantity=1,
                unit_price=contract.mrr,
                amount=contract.mrr
            )
            db.session.add(item)
            
            # 次回請求日を更新
            if billing.billing_cycle == BillingCycle.MONTHLY:
                billing.next_billing_date = today + timedelta(days=30)
            elif billing.billing_cycle == BillingCycle.QUARTERLY:
                billing.next_billing_date = today + timedelta(days=90)
            elif billing.billing_cycle == BillingCycle.ANNUALLY:
                billing.next_billing_date = today + timedelta(days=365)
            
            processed += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Processed {processed} recurring billings',
            'processed': processed
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ダッシュボード用統計情報
@api_bp.route('/stats/billing', methods=['GET'])
def get_billing_stats():
    """請求関連の統計情報を取得"""
    try:
        # 今月の請求額
        today = date.today()
        start_of_month = date(today.year, today.month, 1)
        
        monthly_invoices = Invoice.query.filter(
            Invoice.issue_date >= start_of_month,
            Invoice.issue_date <= today
        ).all()
        
        monthly_revenue = sum(float(inv.total_amount) for inv in monthly_invoices)
        
        # 未払い請求書
        unpaid_invoices = Invoice.query.filter(
            Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.OVERDUE])
        ).all()
        
        unpaid_amount = sum(float(inv.total_amount) for inv in unpaid_invoices)
        
        # アクティブな契約数
        active_contracts = Contract.query.filter_by(status=ContractStatus.ACTIVE).count()
        
        # 今月の回収額
        monthly_payments = Payment.query.filter(
            Payment.payment_date >= start_of_month,
            Payment.payment_date <= today,
            Payment.status == PaymentStatus.COMPLETED
        ).all()
        
        collected_amount = sum(float(p.amount) for p in monthly_payments)
        
        return jsonify({
            'monthly_revenue': monthly_revenue,
            'unpaid_amount': unpaid_amount,
            'unpaid_count': len(unpaid_invoices),
            'active_contracts': active_contracts,
            'collected_amount': collected_amount,
            'collection_rate': (collected_amount / monthly_revenue * 100) if monthly_revenue > 0 else 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500