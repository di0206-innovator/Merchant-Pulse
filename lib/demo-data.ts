import type { MerchantProfile, RazorpayPayment } from '@/core/types';

export const demoMerchant: MerchantProfile = {
  id: 'mer_demo_01',
  name: 'Northstar Commerce',
  monthly_gmv_paise: 1240000000,
  daily_action_budget_paise: 3000000,
  max_payment_attempts: 3,
  auto_execute_threshold: 0.62,
};

export const demoPayments: RazorpayPayment[] = [
  { id: 'pay_demo_001', order_id: 'order_demo_001', amount: 349900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Network timeout', created_at: 1756000010, attempts: 1, customer_id: 'cust_repeat_1' },
  { id: 'pay_demo_002', order_id: 'order_demo_002', amount: 79900, currency: 'INR', status: 'failed', method: 'upi', error_code: 'BAD_REQUEST_ERROR', error_description: 'Customer declined payment', created_at: 1756000210, attempts: 1, customer_id: 'cust_new_2' },
  { id: 'pay_demo_003', order_id: 'order_demo_003', amount: 129900, currency: 'INR', status: 'captured', method: 'card', created_at: 1756000310, attempts: 1, customer_id: 'cust_repeat_3' },
  { id: 'pay_demo_004', order_id: 'order_demo_004', amount: 549900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Network timeout', created_at: 1756000410, attempts: 1, customer_id: 'cust_repeat_4' },
  { id: 'pay_demo_005', order_id: 'order_demo_005', amount: 219900, currency: 'INR', status: 'captured', method: 'upi', created_at: 1756000510, attempts: 1, customer_id: 'cust_new_5' },
  { id: 'pay_demo_006', order_id: 'order_demo_006', amount: 649900, currency: 'INR', status: 'failed', method: 'card', error_code: 'AUTH_ERROR', error_description: 'Authentication failed', created_at: 1756000610, attempts: 2, customer_id: 'cust_repeat_1' },
  { id: 'pay_demo_007', order_id: 'order_demo_007', amount: 99900, currency: 'INR', status: 'captured', method: 'upi', created_at: 1756000710, attempts: 1, customer_id: 'cust_new_7' },
  { id: 'pay_demo_008', order_id: 'order_demo_008', amount: 459900, currency: 'INR', status: 'failed', method: 'card', error_code: 'GATEWAY_TIMEOUT', error_description: 'Network timeout', created_at: 1756000810, attempts: 2, customer_id: 'cust_repeat_8' },
];
