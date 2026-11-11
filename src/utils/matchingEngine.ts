import { Buyer, Supplier, MatchScoreBreakdown } from '../types';

/**
 * Calculates a 0-100 compatibility score between a Buyer and a Supplier
 */
export function calculateMatchScore(buyer: Buyer, supplier: Supplier): MatchScoreBreakdown {
  const reasons: string[] = [];
  const missingRequirements: string[] = [];
  const warnings: string[] = [];

  // 1. Category Matching (up to 20 pts)
  let categoryScore = 0;
  const buyerCats = buyer.categories.map(c => c.trim().toLowerCase());
  const supplierCats = supplier.categories.map(c => c.trim().toLowerCase());
  const matchedCats = buyerCats.filter(c => supplierCats.some(sc => sc.includes(c) || c.includes(sc)));

  if (matchedCats.length > 0) {
    categoryScore = Math.min(20, 10 + matchedCats.length * 5);
    reasons.push(`Direct category overlap in ${matchedCats.join(', ')}`);
  } else {
    missingRequirements.push('No direct category match between buyer interests and supplier catalog');
  }

  // 2. Brand Matching (up to 15 pts)
  let brandScore = 0;
  const buyerBrands = buyer.interestedBrands.map(b => b.trim().toLowerCase());
  const supplierBrands = supplier.availableBrands.map(b => b.trim().toLowerCase());
  const matchedBrands = buyerBrands.filter(b => supplierBrands.some(sb => sb.includes(b) || b.includes(sb)));

  if (matchedBrands.length > 0) {
    brandScore = Math.min(15, 8 + matchedBrands.length * 4);
    reasons.push(`Supplier carries buyer's target brands: ${matchedBrands.join(', ')}`);
  } else if (buyerBrands.length > 0) {
    missingRequirements.push(`Requested brands (${buyer.interestedBrands.join(', ')}) not explicitly listed by supplier`);
  } else {
    brandScore = 8; // Buyer has generic brand requirements
    reasons.push('Buyer is open to general catalog brands');
  }

  // 3. Budget vs MOV/MOQ Compatibility (up to 15 pts)
  let budgetScore = 0;
  if (buyer.purchasingBudget >= supplier.minimumOrderValue) {
    budgetScore = 15;
    reasons.push(`Buyer budget ($${buyer.purchasingBudget.toLocaleString()}) easily clears supplier MOV ($${supplier.minimumOrderValue.toLocaleString()})`);
  } else if (buyer.monthlyCapacity >= supplier.minimumOrderValue) {
    budgetScore = 10;
    reasons.push(`Buyer monthly capacity ($${buyer.monthlyCapacity.toLocaleString()}) meets supplier MOV requirement`);
  } else {
    budgetScore = 3;
    missingRequirements.push(`Buyer budget ($${buyer.purchasingBudget.toLocaleString()}) is below supplier minimum order value ($${supplier.minimumOrderValue.toLocaleString()})`);
  }

  // 4. Amazon Reseller Acceptance (up to 20 pts)
  let amazonScore = 0;
  if (supplier.amazonAcceptance === 'Yes') {
    amazonScore = 20;
    reasons.push('Supplier explicitly accepts Amazon wholesale sellers');
  } else if (supplier.amazonAcceptance === 'Unknown') {
    amazonScore = 8;
    warnings.push('Amazon selling policy is unknown; needs explicit clarification before introduction');
  } else {
    amazonScore = 0;
    warnings.push('CRITICAL: Supplier restricts or rejects 3P Amazon marketplace sellers');
  }

  // 5. Authorization & Invoice Viability (up to 15 pts)
  let authScore = 0;
  if (supplier.resellerProgram === 'Yes') {
    authScore += 10;
    reasons.push('Supplier offers formal Authorized Reseller agreements');
  } else if (supplier.resellerProgram === 'Unknown') {
    authScore += 4;
  }

  if (supplier.invoiceAvailability && supplier.invoiceAvailability.toLowerCase().includes('invoice')) {
    authScore += 5;
    reasons.push(`Invoice standard: ${supplier.invoiceAvailability}`);
  } else {
    warnings.push('Check invoice ungating eligibility with Amazon guidelines');
  }
  authScore = Math.min(15, authScore);

  // 6. Business Verification Status (up to 15 pts)
  let verifyScore = 0;
  if (supplier.verificationStatus === 'Verified') {
    verifyScore = 15;
    reasons.push('Supplier EIN / Business License & legitimacy officially verified');
  } else if (supplier.verificationStatus === 'Verification Pending') {
    verifyScore = 7;
    warnings.push('Supplier verification in progress; collect W-9 / business filings');
  } else {
    verifyScore = 0;
    warnings.push('Supplier is unverified; do not introduce before conducting due diligence');
  }

  const totalScore = Math.round(
    categoryScore + brandScore + budgetScore + amazonScore + authScore + verifyScore
  );

  return {
    categoryMatch: categoryScore,
    brandMatch: brandScore,
    budgetCompatibility: budgetScore,
    amazonAcceptance: amazonScore,
    authorizationVerification: authScore,
    locationCompatibility: 0,
    totalScore,
    reasons,
    missingRequirements,
    warnings
  };
}
