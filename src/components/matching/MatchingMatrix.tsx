import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Buyer, Supplier, MatchStatus } from '../../types';
import { calculateMatchScore } from '../../utils/matchingEngine';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Handshake,
  DollarSign,
  Package,
  ShieldCheck,
  Building2,
  Users,
  Search,
  ChevronRight
} from 'lucide-react';

export const MatchingMatrix: React.FC = () => {
  const { buyers, suppliers, saveMatch, addDeal, setActiveTab, t, language } = useApp();

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [matchNotes, setMatchNotes] = useState<{ [supplierId: string]: string }>({});

  const selectedBuyer = useMemo(() => {
    return buyers.find(b => b.id === selectedBuyerId) || buyers[0];
  }, [buyers, selectedBuyerId]);

  // Compute live match score and comparison for selected buyer across all suppliers
  const supplierMatches = useMemo(() => {
    if (!selectedBuyer) return [];

    return suppliers
      .map(supplier => {
        const breakdown = calculateMatchScore(selectedBuyer, supplier);
        return {
          supplier,
          breakdown
        };
      })
      .filter(item => item.breakdown.totalScore >= minScoreFilter)
      .sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);
  }, [selectedBuyer, suppliers, minScoreFilter]);

  const handleRecordMatch = (supplier: Supplier, status: MatchStatus, scoreBreakdown: any) => {
    if (!selectedBuyer) return;

    saveMatch({
      id: `match-${Date.now()}`,
      buyerId: selectedBuyer.id,
      supplierId: supplier.id,
      scoreBreakdown,
      status,
      dateMatched: new Date().toISOString().split('T')[0],
      notes: matchNotes[supplier.id] || ''
    });
  };

  const handleStartDeal = (supplier: Supplier, scoreBreakdown: any) => {
    if (!selectedBuyer) return;

    // Direct transition to Deal with consent checklist
    addDeal({
      buyerId: selectedBuyer.id,
      buyerName: selectedBuyer.contactName,
      buyerCompany: selectedBuyer.companyName,
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      introductionDate: new Date().toISOString().split('T')[0],
      buyerConsent: false,
      supplierConsent: false,
      introductionMethod: 'Email Introduction',
      productName: `${supplier.availableBrands[0] || 'Wholesale Catalog'} Consignment`,
      productCategory: selectedBuyer.categories[0] || supplier.categories[0] || 'General Merchandise',
      estimatedOrderValue: Math.max(selectedBuyer.purchasingBudget, supplier.minimumOrderValue),
      actualOrderValue: 0,
      dealStatus: 'Awaiting Consent',
      paymentStatus: 'Unpaid',
      deliveryStatus: 'Pending',
      commissionAgreement: `3% of invoiced wholesale total ($${Math.round(
        Math.max(selectedBuyer.purchasingBudget, supplier.minimumOrderValue) * 0.03
      ).toLocaleString()} estimated fee)`,
      referralAttributionNote: `Attribution created on ${new Date().toISOString().split('T')[0]}. Pending written consent from both parties prior to introduction letter.`,
      notes: `Matched via scoring matrix with compatibility of ${scoreBreakdown.totalScore}%.`
    });

    setActiveTab('deals');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.matchingTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.matchingSubtitle}</p>
        </div>

        {/* Min score filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Min Score:</span>
          <select
            value={minScoreFilter}
            onChange={e => setMinScoreFilter(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value={0}>All Scores (0%+)</option>
            <option value={50}>50%+ Fair Match</option>
            <option value={70}>70%+ High Compatibility</option>
            <option value={85}>85%+ Prime Match</option>
          </select>
        </div>
      </div>

      {/* Buyer Selector and Profile Spotlight */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t.selectBuyer}</span>
          </label>

          <select
            value={selectedBuyerId}
            onChange={e => setSelectedBuyerId(e.target.value)}
            className="w-full sm:w-96 px-3.5 py-2 text-xs font-semibold rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {buyers.map(b => (
              <option key={b.id} value={b.id}>
                {b.companyName} ({b.buyerCustomId}) · Budget: ${b.purchasingBudget.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {selectedBuyer && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Contact & Location</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedBuyer.contactName}
              </p>
              <p className="text-slate-500 text-[11px]">{selectedBuyer.city}, {selectedBuyer.state}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Amazon Model</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedBuyer.sellingModel} ({selectedBuyer.businessType})
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-[11px] truncate">
                {selectedBuyer.categories.join(', ')}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Purchasing Budget</span>
              <p className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                ${selectedBuyer.purchasingBudget.toLocaleString()}
              </p>
              <p className="text-slate-500 text-[11px]">Monthly Cap: ${selectedBuyer.monthlyCapacity.toLocaleString()}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Target Brands</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedBuyer.interestedBrands.length > 0 ? (
                  selectedBuyer.interestedBrands.map((b, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-medium border border-slate-200 dark:border-slate-600">
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[11px]">Any high-rank wholesale brand</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matching Matrix Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.compareSuppliers} ({supplierMatches.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Scores dynamically evaluated across 6 criteria
          </span>
        </div>

        <div className="space-y-4">
          {supplierMatches.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <p className="text-sm font-semibold">No suppliers met the score threshold.</p>
              <p className="text-xs mt-1">Try lowering the minimum score filter above.</p>
            </div>
          ) : (
            supplierMatches.map(({ supplier, breakdown }) => {
              const isHighMatch = breakdown.totalScore >= 75;
              const isModerate = breakdown.totalScore >= 50 && breakdown.totalScore < 75;

              return (
                <div
                  key={supplier.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs space-y-4"
                >
                  {/* Top row: Supplier title & Score badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold shrink-0">
                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {supplier.companyName}
                          </h3>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {supplier.supplierCustomId}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{supplier.companyType}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {supplier.contactName} ({supplier.email}) · {supplier.city}, {supplier.state}
                        </p>
                      </div>
                    </div>

                    {/* Big Match Score */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Match Compatibility</div>
                        <div
                          className={`text-2xl font-black font-mono tabular-nums ${
                            isHighMatch
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isModerate
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {breakdown.totalScore}%
                        </div>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs ${
                          isHighMatch
                            ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : isModerate
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                            : 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                        }`}
                      >
                        {isHighMatch ? 'Prime' : isModerate ? 'Good' : 'Fair'}
                      </div>
                    </div>
                  </div>

                  {/* Criteria Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Category Match</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {breakdown.categoryMatch} / 20 pts
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Brand Alignment</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {breakdown.brandMatch} / 15 pts
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Budget vs MOV</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {breakdown.budgetCompatibility} / 15 pts
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Amazon Allowed</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {breakdown.amazonAcceptance} / 20 pts
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Invoice Validity</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {breakdown.authorizationVerification} / 15 pts
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-400 text-[10px] block">Supplier MOV</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${supplier.minimumOrderValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Reasons, Missing Requirements, Warnings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    {/* Compatibility Reasons */}
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Why This Matches ({breakdown.reasons.length})</span>
                      </div>
                      <ul className="text-[11px] text-emerald-800 dark:text-emerald-200 space-y-1">
                        {breakdown.reasons.map((r, i) => (
                          <li key={i}>· {r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing criteria */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Gaps / Criteria Missing ({breakdown.missingRequirements.length})</span>
                      </div>
                      {breakdown.missingRequirements.length > 0 ? (
                        <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                          {breakdown.missingRequirements.map((m, i) => (
                            <li key={i}>· {m}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-500">None! Meets all target criteria.</p>
                      )}
                    </div>

                    {/* Warnings */}
                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
                      <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verification Alerts ({breakdown.warnings.length})</span>
                      </div>
                      {breakdown.warnings.length > 0 ? (
                        <ul className="text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
                          {breakdown.warnings.map((w, i) => (
                            <li key={i}>· {w}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">All due diligence passed.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Decision buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleRecordMatch(supplier, 'Potential Match', breakdown)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        Save as Potential Match
                      </button>
                      <button
                        onClick={() => handleRecordMatch(supplier, 'Approved Match', breakdown)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                      >
                        Approve Match
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartDeal(supplier, breakdown)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Initialize Introduction Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
