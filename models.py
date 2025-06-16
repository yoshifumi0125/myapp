"""
SaaS販売管理システムのデータベースモデル
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum
import enum

db = SQLAlchemy()

class ContractStatus(enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class InvoiceStatus(enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentMethod(enum.Enum):
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    OTHER = "other"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class BillingCycle(enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

class CompanyStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class CompanyType(enum.Enum):
    CORPORATION = "corporation"
    LLC = "llc"
    PARTNERSHIP = "partnership"
    SOLE_PROPRIETOR = "sole_proprietor"
    NONPROFIT = "nonprofit"
    OTHER = "other"

class Company(db.Model):
    """会社モデル"""
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    legal_name = db.Column(db.String(200))
    company_type = db.Column(db.Enum(CompanyType), default=CompanyType.CORPORATION)
    registration_number = db.Column(db.String(100), unique=True)
    tax_id = db.Column(db.String(100))
    founded_date = db.Column(db.Date)
    capital = db.Column(db.Numeric(15, 2))
    employees = db.Column(db.Integer)
    industry = db.Column(db.String(100))
    website = db.Column(db.String(255))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(50))
    fax = db.Column(db.String(50))
    address = db.Column(db.String(500))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100), default='Japan')
    representative_name = db.Column(db.String(100))
    representative_title = db.Column(db.String(100))
    description = db.Column(db.Text)
    status = db.Column(db.Enum(CompanyStatus), default=CompanyStatus.PENDING)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    customers = db.relationship('Customer', backref='company', lazy='dynamic')

class Customer(db.Model):
    """顧客モデル（既存）"""
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'))
    name = db.Column(db.String(100), nullable=False)
    plan = db.Column(db.String(50))
    mrr = db.Column(db.Integer, default=0)
    initial_fee = db.Column(db.Integer, default=0)
    operation_fee = db.Column(db.Integer, default=0)
    assignee = db.Column(db.String(50))
    hours = db.Column(db.Integer, default=0)
    region = db.Column(db.String(50))
    industry = db.Column(db.String(50))
    channel = db.Column(db.String(50))
    status = db.Column(db.String(50), default='active')
    contract_date = db.Column(db.String(50))
    health_score = db.Column(db.Integer, default=50)
    last_login = db.Column(db.String(50))
    support_tickets = db.Column(db.Integer, default=0)
    nps_score = db.Column(db.Integer, default=50)
    usage_rate = db.Column(db.Integer, default=50)
    churn_date = db.Column(db.String(50))
    
    # リレーションシップ
    contracts = db.relationship('Contract', backref='customer', lazy='dynamic', cascade='all, delete-orphan')
    invoices = db.relationship('Invoice', backref='customer', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='customer', lazy='dynamic', cascade='all, delete-orphan')
    recurring_billings = db.relationship('RecurringBilling', backref='customer', lazy='dynamic', cascade='all, delete-orphan')

class Contract(db.Model):
    """契約モデル"""
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    contract_number = db.Column(db.String(50), unique=True, nullable=False)
    plan = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    auto_renewal = db.Column(db.Boolean, default=True)
    mrr = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(ContractStatus), default=ContractStatus.PENDING)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    invoices = db.relationship('Invoice', backref='contract', lazy='dynamic')
    recurring_billing = db.relationship('RecurringBilling', backref='contract', uselist=False, cascade='all, delete-orphan')
    history = db.relationship('ContractHistory', backref='contract', lazy='dynamic', cascade='all, delete-orphan')

class Invoice(db.Model):
    """請求書モデル"""
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'))
    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    payment_method = db.Column(db.String(50))
    paid_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy='dynamic')

class InvoiceItem(db.Model):
    """請求明細モデル"""
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    """支払いモデル"""
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'))
    payment_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), nullable=False)
    transaction_id = db.Column(db.String(100))
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.COMPLETED)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RecurringBilling(db.Model):
    """定期請求設定モデル"""
    __tablename__ = 'recurring_billing'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False, unique=True)
    billing_cycle = db.Column(db.Enum(BillingCycle), default=BillingCycle.MONTHLY)
    next_billing_date = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContractHistory(db.Model):
    """契約更新履歴モデル"""
    __tablename__ = 'contract_history'
    
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    old_values = db.Column(db.JSON)
    new_values = db.Column(db.JSON)
    changed_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)