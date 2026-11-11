import { MessageTemplate } from '../types';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Initial Buyer Outreach (Amazon Wholesale)',
    code: 'buyer_outreach',
    category: 'Buyer',
    subject: 'Direct Wholesale Supplier Sourcing for {{BuyerCompanyName}}',
    body: `Hi {{ContactName}},

I came across {{BuyerCompanyName}} and noticed your active Amazon wholesale presence in the {{Category}} category.

We operate Wholesale Connect USA, a dedicated B2B sourcing network connecting legitimate Amazon sellers with verified USA-based wholesale distributors and brand manufacturers. We help sellers bypass saturated distributor lists and connect directly with suppliers who provide valid brand invoices and approve Amazon sales.

Are you currently looking to expand your inventory in {{Category}} with verified USA inventory lines? If you have specific brand targets or monthly purchasing targets, feel free to reply with your criteria.

Best regards,
{{SenderName}}
Wholesale Connect USA
{{SenderEmail}} | {{SenderWhatsApp}}`,
    placeholders: ['ContactName', 'BuyerCompanyName', 'Category', 'SenderName', 'SenderEmail', 'SenderWhatsApp']
  },
  {
    id: 'tpl-2',
    name: 'Initial Supplier Outreach (USA Brand / Distributor)',
    code: 'supplier_outreach',
    category: 'Supplier',
    subject: 'Wholesale Buyer Referral Inquiry – {{SupplierCompanyName}}',
    body: `Dear {{ContactName}},

I am reaching out from Wholesale Connect USA on behalf of our network of pre-qualified wholesale buyers and Amazon merchants in {{State}} and across North America.

We work with high-volume, compliant retail buyers who adhere strictly to MAP pricing, handle their own logistics, and maintain good standing on major marketplaces. Several of our verified clients are looking to place recurring wholesale orders in {{Category}} and are interested in your catalog.

Could you please share your latest wholesale catalog, MOQ/MOV guidelines, and your dealer application form? Additionally, do you allow authorized wholesale accounts to resell your catalog?

Thank you for your time, and we look forward to sending qualified purchasing volume your way.

Sincerely,
{{SenderName}}
Business Development Lead
Wholesale Connect USA
{{SenderEmail}}`,
    placeholders: ['ContactName', 'SupplierCompanyName', 'Category', 'State', 'SenderName', 'SenderEmail']
  },
  {
    id: 'tpl-3',
    name: 'Buyer Follow-up (Opportunity Update)',
    code: 'buyer_followup',
    category: 'Buyer',
    subject: 'Update: Verified USA Wholesale Lines for {{BuyerCompanyName}}',
    body: `Hi {{ContactName}},

Following up on our earlier conversation regarding wholesale inventory for {{BuyerCompanyName}}.

We have recently verified and qualified two authorized USA distributors with open dealer catalogs in {{Category}} with MOQs starting around {{MOQ}} and direct brand ungating support.

Would you be open to reviewing their line card this week? Please confirm your current purchasing budget so we can ensure the account matches your exact volume tier.

Best regards,
{{SenderName}}
Wholesale Connect USA`,
    placeholders: ['ContactName', 'BuyerCompanyName', 'Category', 'MOQ', 'SenderName']
  },
  {
    id: 'tpl-4',
    name: 'Supplier Follow-up (Buyer Roster)',
    code: 'supplier_followup',
    category: 'Supplier',
    subject: 'Follow-up: Qualified Buyer Ready for {{SupplierCompanyName}}',
    body: `Dear {{ContactName}},

I wanted to briefly follow up on our previous note regarding opening a wholesale channel for our vetted buyers.

We have a qualified Amazon wholesale business ready to place an initial opening order exceeding {{OrderValue}} for your {{Category}} lines. They have valid Resale Certificates (sales tax exemption) and are prepared to submit their dealer application immediately.

Please let me know where to direct the buyer application or who on your sales team handles new account onboarding.

Best regards,
{{SenderName}}
Wholesale Connect USA`,
    placeholders: ['ContactName', 'SupplierCompanyName', 'Category', 'OrderValue', 'SenderName']
  },
  {
    id: 'tpl-5',
    name: 'Buyer-Supplier Business Introduction (Attribution Safeguard)',
    code: 'introduction',
    category: 'Introduction',
    subject: 'Official Introduction: {{BuyerCompanyName}} <> {{SupplierCompanyName}}',
    body: `Dear {{BuyerContact}} and {{SupplierContact}},

It is my pleasure to introduce {{BuyerCompanyName}} to {{SupplierCompanyName}}.

Per our prior discussions and mutual consent:
- {{BuyerCompanyName}} is an established wholesale merchant with active Amazon fulfillment operations, seeking to open a recurring trade account for {{Category}} products.
- {{SupplierCompanyName}} is an authorized USA supplier carrying verified brand catalog items with wholesale terms matching {{BuyerCompanyName}}'s purchasing capacity.

As agreed in our Referral Representation Terms, Wholesale Connect USA is pleased to facilitate this connection. We will remain on copy to assist with catalog handoffs, account registration documents, or order confirmations.

{{BuyerContact}} – Please connect with {{SupplierContact}} to submit your Reseller Certificate and request the current order sheet.
{{SupplierContact}} – Please share your standard onboarding package and credit card/wire payment instructions.

Wishing you both a prosperous and long-term business partnership!

Warm regards,
{{SenderName}}
Wholesale Connect USA
Attribution ID: {{DealId}}
{{SenderEmail}} | {{SenderWhatsApp}}`,
    placeholders: ['BuyerContact', 'SupplierContact', 'BuyerCompanyName', 'SupplierCompanyName', 'Category', 'SenderName', 'DealId', 'SenderEmail', 'SenderWhatsApp']
  },
  {
    id: 'tpl-6',
    name: 'Deal Confirmation & First Order Notice',
    code: 'deal_confirm',
    category: 'Introduction',
    subject: 'Order Confirmation & Referral Log: Deal #{{DealId}}',
    body: `Hi {{ContactName}},

We are glad to hear that the introductory meeting between {{BuyerCompanyName}} and {{SupplierCompanyName}} went smoothly and an opening wholesale PO has been placed.

Summary Details:
- Deal Reference: {{DealId}}
- Product / Category: {{ProductDetails}}
- Order Value: {{OrderValue}}
- Order Date: {{OrderDate}}

In accordance with our referral arrangement, please keep us updated with the invoice confirmation and tracking details once dispatch takes place.

Thank you for your partnership!

Best regards,
{{SenderName}}
Wholesale Connect USA`,
    placeholders: ['ContactName', 'BuyerCompanyName', 'SupplierCompanyName', 'DealId', 'ProductDetails', 'OrderValue', 'OrderDate', 'SenderName']
  },
  {
    id: 'tpl-7',
    name: 'Commission Invoice / Settlement Request',
    code: 'commission_request',
    category: 'Commission',
    subject: 'Referral Fee Settlement Notice: Deal Ref {{DealId}} ({{BuyerCompanyName}})',
    body: `Dear {{PayerContact}},

I hope this email finds you well.

Following up on the successful wholesale order between {{BuyerCompanyName}} and {{SupplierCompanyName}} under Deal Reference {{DealId}}.

As agreed in our written referral agreement:
- Eligible Order Amount: \${{OrderValue}}
- Agreed Referral Fee: {{CommissionRate}}
- Total Commission Due: \${{CommissionAmount}}
- Currency: USD
- Payment Due Date: {{DueDate}}

Payment Instructions:
- Method: {{PaymentMethod}}
- Bank / Payoneer / Wise Account: {{AccountDetails}}
- Reference: {{DealId}}-COMM

Please confirm receipt and provide transaction proof once settled. Thank you for your continued trust in Wholesale Connect USA!

Warm regards,
{{SenderName}}
Wholesale Connect USA
{{SenderEmail}}`,
    placeholders: ['PayerContact', 'BuyerCompanyName', 'SupplierCompanyName', 'DealId', 'OrderValue', 'CommissionRate', 'CommissionAmount', 'DueDate', 'PaymentMethod', 'AccountDetails', 'SenderName', 'SenderEmail']
  }
];

export function fillTemplate(templateBody: string, data: Record<string, string>): string {
  let result = templateBody;
  for (const [key, val] of Object.entries(data)) {
    const reg = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(reg, val || `[${key}]`);
  }
  return result;
}
