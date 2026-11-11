/**
 * Wholesale Connect USA – Core Data Types & Schema
 */

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export type BuyerStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Qualified'
  | 'Matching'
  | 'Introduced'
  | 'Active Client'
  | 'Inactive'
  | 'Rejected';

export type AmazonSellingModel = 'FBA' | 'FBM' | 'Both';

export interface Buyer {
  id: string;
  buyerCustomId: string; // e.g. BUY-1001
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  website?: string;
  amazonStoreUrl?: string;
  country: string;
  state: string;
  city: string;
  businessType: string; // LLC, Sole Prop, Inc
  sellingModel: AmazonSellingModel;
  categories: string[];
  interestedBrands: string[];
  requiredProducts: string;
  purchasingBudget: number; // in USD
  preferredLocation: string;
  minProfitRequirement: number; // in %
  monthlyCapacity: number; // in USD
  currentSupplierStatus: string;
  additionalRequirements?: string;
  leadSource: string;
  facebookGroupName?: string;
  notes: string;
  dateAdded: string; // YYYY-MM-DD
  lastContactDate?: string;
  nextFollowUpDate?: string;
  status: BuyerStatus;
  ownerId?: string;
}

export type SupplierType = 'Brand' | 'Manufacturer' | 'Distributor' | 'Wholesaler';
export type SupplierVerificationStatus = 'Not Verified' | 'Verification Pending' | 'Verified' | 'Rejected';
export type SupplierPipelineStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Qualified'
  | 'Matching'
  | 'Introduced'
  | 'Active Supplier'
  | 'Inactive'
  | 'Rejected';

export type TriState = 'Yes' | 'No' | 'Unknown';

export interface Supplier {
  id: string;
  supplierCustomId: string; // e.g. SUP-2001
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  website?: string;
  facebookPage?: string;
  linkedinUrl?: string;
  country: string;
  state: string;
  city: string;
  companyType: SupplierType;
  categories: string[];
  availableBrands: string[];
  catalogUrl?: string;
  priceListUrl?: string;
  moq: number; // Minimum Order Quantity in units
  minimumOrderValue: number; // Minimum Order Value in USD
  shippingLocations: string;
  shippingTerms: string;
  paymentTerms: string;
  amazonAcceptance: TriState; // Does supplier allow Amazon sales?
  resellerProgram: TriState; // Has formal reseller agreement?
  authorizationDocuments?: string;
  invoiceAvailability: string; // Direct Brand Invoices, etc.
  verificationStatus: SupplierVerificationStatus;
  status: SupplierPipelineStatus;
  leadSource: string;
  contactDate?: string;
  nextFollowUpDate?: string;
  notes: string;
  dateAdded: string;
  ownerId?: string;
}

export type LeadSource =
  | 'Facebook Groups'
  | 'Facebook Pages'
  | 'Facebook Profiles'
  | 'LinkedIn'
  | 'Google Search'
  | 'Thomasnet'
  | 'Wholesale Central'
  | 'Faire'
  | 'Trade Shows'
  | 'Referrals'
  | 'Other';

export type LeadType = 'Buyer' | 'Supplier';

export type LeadVerificationStatus = 'Unverified' | 'Pending Review' | 'Verified' | 'Discarded';
export type LeadContactStatus = 'Not Contacted' | 'Outreach Sent' | 'Follow-up Sent' | 'Replied' | 'Converted';

export interface Lead {
  id: string;
  leadCustomId: string;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  leadType: LeadType;
  leadSource: LeadSource;
  sourceUrl?: string;
  discoveryDate: string;
  researchNotes: string;
  verificationStatus: LeadVerificationStatus;
  contactStatus: LeadContactStatus;
  convertedEntityId?: string;
  categories?: string[];
  targetBudgetOrMoq?: string;
  ownerId?: string;
}

export type MatchStatus = 'Potential Match' | 'Approved Match' | 'Under Review' | 'Rejected' | 'Introduced';

export interface MatchScoreBreakdown {
  categoryMatch: number; // 0-20
  brandMatch: number; // 0-15
  budgetCompatibility: number; // 0-15
  amazonAcceptance: number; // 0-20
  authorizationVerification: number; // 0-15
  locationCompatibility: number; // 0-15
  totalScore: number; // 0-100
  reasons: string[];
  missingRequirements: string[];
  warnings: string[];
}

export interface BuyerSupplierMatch {
  id: string;
  buyerId: string;
  supplierId: string;
  scoreBreakdown: MatchScoreBreakdown;
  status: MatchStatus;
  dateMatched: string;
  notes?: string;
  reviewedBy?: string;
}

export type CommunicationType =
  | 'Email Sent'
  | 'Facebook Message Sent'
  | 'WhatsApp Message Sent'
  | 'Phone Call'
  | 'Meeting'
  | 'Follow-up'
  | 'Reply Received';

export type ResponseStatus = 'Pending' | 'Positive' | 'Neutral' | 'Negative' | 'No Response';

export interface CommunicationLog {
  id: string;
  entityType: 'Buyer' | 'Supplier';
  entityId: string;
  entityName: string;
  date: string; // ISO string
  communicationType: CommunicationType;
  subject: string;
  content: string;
  responseStatus: ResponseStatus;
  nextFollowUpDate?: string;
  notes?: string;
  ownerId?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  code: 'buyer_outreach' | 'supplier_outreach' | 'buyer_followup' | 'supplier_followup' | 'introduction' | 'deal_confirm' | 'commission_request';
  category: 'Buyer' | 'Supplier' | 'Introduction' | 'Commission';
  subject: string;
  body: string;
  placeholders: string[];
}

export type DealStatus =
  | 'Potential Deal'
  | 'Awaiting Consent'
  | 'Ready for Introduction'
  | 'Introduced'
  | 'Negotiation'
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Deal Completed'
  | 'Cancelled'
  | 'Disputed';

export type PaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Fully Paid' | 'Refunded';
export type DeliveryStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Returned';
export type IntroMethod = 'Email Introduction' | 'WhatsApp Group' | 'Zoom Meeting' | 'Direct Handshake';

export interface Deal {
  id: string;
  dealCustomId: string; // e.g. DEAL-4001
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  supplierId: string;
  supplierName: string;
  matchId?: string;
  introductionDate?: string;
  buyerConsent: boolean;
  buyerConsentDate?: string;
  buyerConsentNote?: string;
  supplierConsent: boolean;
  supplierConsentDate?: string;
  supplierConsentNote?: string;
  introductionMethod: IntroMethod;
  productName: string;
  productCategory: string;
  estimatedOrderValue: number; // USD
  actualOrderValue: number; // USD
  dealStatus: DealStatus;
  orderDate?: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  commissionAgreement: string; // e.g. "3% of invoiced wholesale total"
  referralAttributionNote: string; // Protect referral attribution
  notes: string;
  supportingDocuments?: string[];
  createdAt: string;
  ownerId?: string;
}

export type CommissionPayer = 'Supplier' | 'Buyer' | 'Split 50/50';
export type CommissionType = 'Percentage' | 'Fixed Amount';
export type CommissionStatus = 'Pending' | 'Due' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  notes?: string;
}

export interface Commission {
  id: string;
  commissionCustomId: string; // e.g. COM-5001
  dealId: string;
  dealCustomId?: string;
  buyerName: string;
  supplierName: string;
  payer: CommissionPayer;
  commissionType: CommissionType;
  commissionRate: number; // % rate if percentage
  orderValue: number; // Eligible Order Value in USD
  commissionAmount: number; // Total commission owed
  paidAmount: number; // Total paid so far
  balanceRemaining: number; // Remaining balance
  currency: string; // USD
  agreementDate: string;
  expectedPaymentDate: string;
  actualPaymentDate?: string;
  paymentMethod: string;
  status: CommissionStatus;
  transactionReference?: string;
  notes: string;
  paymentHistory: PaymentRecord[];
  ownerId?: string;
}

export type TaskCategory =
  | 'Find New Buyers'
  | 'Find New Suppliers'
  | 'Verify Leads'
  | 'Send Outreach Messages'
  | 'Follow-up'
  | 'Qualify Clients'
  | 'Match Buyers and Suppliers'
  | 'Introduce Business Partners'
  | 'Check Deal Status'
  | 'Collect Commission';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  reminder: boolean;
  relatedEntityType?: 'Buyer' | 'Supplier' | 'Deal' | 'Lead';
  relatedEntityId?: string;
  relatedEntityName?: string;
  notes?: string;
  ownerId?: string;
}

export type DocumentType =
  | 'Supplier Catalog'
  | 'Wholesale Price List'
  | 'Business Verification'
  | 'Reseller Authorization'
  | 'Commission Agreement'
  | 'Deal Document'
  | 'Payment Proof';

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  associatedEntityType: 'Buyer' | 'Supplier' | 'Deal' | 'General';
  associatedEntityId?: string;
  associatedEntityName?: string;
  uploadDate: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Rejected';
  notes?: string;
  ownerId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'agent';
  businessName: string;
  logoUrl?: string;
  phone?: string;
  location?: string;
}

export interface BusinessSettings {
  businessName: string;
  businessLogoUrl: string;
  businessEmail: string;
  businessPhone: string;
  businessWhatsApp: string;
  currency: string;
  currencySymbol: string;
  timezone: string; // Asia/Dhaka
  defaultCommissionRate: number; // 3%
  language: Language;
  theme: Theme;
  allowSampleData: boolean;
  firebaseProjectId?: string;
  firebaseConnected: boolean;
}
