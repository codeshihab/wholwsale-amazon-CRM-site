# Wholesale Connect USA – Business Management System

A production-grade B2B Wholesale CRM and Referral Management Web Application designed specifically for connecting Amazon wholesale sellers/buyers with verified USA-based wholesale distributors, brands, and manufacturers.

---

## 1. Business Architecture & Purpose

Operating from **Dhaka, Bangladesh**, the business owner acts as an authorized referral partner connecting USA-based Amazon wholesale sellers with legitimate USA wholesale distributors.

### Business Workflow:
1. **Find Amazon Wholesale Sellers & Buyers**: Track FBA/FBM accounts, purchasing budgets, product categories, and Reseller Certificates.
2. **Find Wholesale Suppliers & Distributors**: Record brands, line cards, MOQs, MOV, Amazon approval status, and invoice verification.
3. **Lead Research Center**: Track discovery across Facebook Groups, LinkedIn, Thomasnet, Wholesale Central, Faire, and Trade Shows with due-diligence checklists.
4. **Buyer-Supplier Matching Engine**: Compute dynamic 0–100 compatibility scores across categories, brands, budgets, MOQs, Amazon acceptance, and invoice standards.
5. **Protect Referral Attribution**: Record written consent from both parties prior to issuing introduction letters.
6. **Deal & Introduction Pipeline**: Manage transitions from Awaiting Consent to Introduction, Negotiation, Order Placement, and Completion.
7. **Commission Management**: Calculate referral fees using percentage or fixed formulas, record partial payments, and track receivables.
8. **Daily Tasks & Timezone Planner**: Calendar & agenda view calibrated to Asia/Dhaka (UTC+6) time.
9. **Executive Reports & Analytics**: 10 comprehensive business summaries with CSV exports.
10. **Document Vault**: Secure repository for distributor catalogs, W-9s, Reseller Certificates, and agreements.

---

## 2. Key Features

- **Dual Language**: Seamless English and Bangla (বাংলা) translation toggle across the application.
- **Dual Theme**: Refined Light mode (white & light gray) and Dark mode (navy blue / deep slate).
- **Zero-Pill Aesthetic**: Clean tabular typography (`tabular-nums`, JetBrains Mono, Plus Jakarta Sans), no AI clutter.
- **Export & Import**: Full CSV import/export for Buyers and Suppliers, plus complete JSON database backup and restore.
- **Sample Records Toggle**: Explore with realistic pre-loaded demo records or purge with one click for live operation.

---

## 3. Firebase & Cloud Deployment Instructions

### Database & Security Architecture:
- `firebase-blueprint.json`: Standardized intermediate representation for Users, Buyers, Suppliers, Deals, Commissions, and Communications.
- `firestore.rules`: Enterprise-hardened Firestore security rules with default-deny catch-all, authenticated owner isolation, and strict ID validation.

### Deployment Steps:
1. **Build the Application**:
   ```bash
   npm run build
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Optional External Firebase Connection**:
   - Create a project at [Firebase Console](https://console.firebase.google.com).
   - Enable **Firebase Authentication** and **Cloud Firestore**.
   - Deploy `firestore.rules` using the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
   - Provide client configuration in `.env` or project settings.

---

## 4. Environment Variables

See `.env.example` for details:
```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```
