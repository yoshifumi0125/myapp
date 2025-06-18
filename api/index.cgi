#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Xserver CGI wrapper for API endpoints
"""
import sys
import os
import cgitb
import json
from urllib.parse import parse_qs

# Enable CGI error handling
cgitb.enable()

# Add the parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the main application
from main_xserver import app, SessionLocal, Customer

def handle_save():
    """Handle save customer request"""
    try:
        # Read POST data
        content_length = int(os.environ.get('CONTENT_LENGTH', 0))
        if content_length > 0:
            post_data = sys.stdin.read(content_length)
            data = json.loads(post_data)
            
            session = SessionLocal()
            try:
                customer = Customer(
                    name=data.get('name'),
                    plan=data.get('plan'),
                    mrr=data.get('mrr', 0),
                    initial_fee=data.get('initialFee', 0),
                    operation_fee=data.get('operationFee', 0),
                    assignee=data.get('assignee'),
                    hours=data.get('hours', 0),
                    region=data.get('region'),
                    industry=data.get('industry'),
                    channel=data.get('channel'),
                    status=data.get('status', 'active'),
                    contract_date=data.get('startDate'),
                    health_score=data.get('healthScore', 50),
                    last_login=data.get('lastLogin'),
                    support_tickets=data.get('supportTickets', 0),
                    nps_score=data.get('npsScore', 7),
                    usage_rate=data.get('usageRate', 50),
                    churn_date=data.get('churnDate')
                )
                
                session.add(customer)
                session.commit()
                
                return {
                    'status': 'success',
                    'message': 'Customer data saved successfully',
                    'customer_id': customer.id
                }
            except Exception as e:
                session.rollback()
                return {'status': 'error', 'message': str(e)}
            finally:
                session.close()
        else:
            return {'status': 'error', 'message': 'No data received'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def handle_customers():
    """Handle get customers request"""
    try:
        session = SessionLocal()
        try:
            customers = session.query(Customer).all()
            customer_list = []
            for customer in customers:
                customer_list.append({
                    'id': customer.id,
                    'name': customer.name,
                    'plan': customer.plan,
                    'mrr': customer.mrr,
                    'initialFee': customer.initial_fee,
                    'operationFee': customer.operation_fee,
                    'assignee': customer.assignee,
                    'hours': customer.hours,
                    'region': customer.region,
                    'industry': customer.industry,
                    'channel': customer.channel,
                    'status': customer.status,
                    'startDate': customer.contract_date,
                    'healthScore': customer.health_score,
                    'lastLogin': customer.last_login,
                    'supportTickets': customer.support_tickets,
                    'npsScore': customer.nps_score,
                    'usageRate': customer.usage_rate,
                    'churnDate': customer.churn_date
                })
            
            return {
                'status': 'success',
                'customers': customer_list
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
        finally:
            session.close()
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def main():
    """Main CGI handler"""
    # Get request path
    path_info = os.environ.get('PATH_INFO', '')
    request_method = os.environ.get('REQUEST_METHOD', 'GET')
    
    # CORS headers
    print("Content-Type: application/json")
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
    print("Access-Control-Allow-Headers: Content-Type")
    print()
    
    # Handle OPTIONS request
    if request_method == 'OPTIONS':
        sys.exit(0)
    
    # Route requests
    if path_info == '/save' and request_method == 'POST':
        result = handle_save()
    elif path_info == '/customers' and request_method == 'GET':
        result = handle_customers()
    else:
        result = {'status': 'error', 'message': f'Unknown endpoint: {path_info}'}
    
    # Output JSON response
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()