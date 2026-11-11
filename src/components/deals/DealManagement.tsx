import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Deal, DealStatus, PaymentStatus, DeliveryStatus, IntroMethod } from '../../types';
import { exportToCsv } from '../../utils/csv';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  DollarSign,
  Truck,
  Edit2,
  Trash2,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';

export const DealManagement: React.FC = () => {
  const { deals, addDeal, updateDeal, deleteDeal, buyers, suppliers, settings, user, t, language, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [copiedDealId, setCopiedDealId] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<Deal, 'id' | 'dealCustomId' | 'createdAt'> = {
    buyerId: buyers[0]?.id || '',
    buyerName: buyers[0]?.contactName || 'Marcus Vance',
    buyerCompany: buyers[0]?.companyName || 'Apex Prime Commerce',
    supplierId: suppliers[0]?.id || '',
    supplierName: suppliers[0]?.companyName || 'NorthEast Wholesale Distribution',
    introductionDate: new Date().toISOString().split('T')[0],
    buyerConsent: true,
    buyerConsentDate: new Date().toISOString().split('T')[0],
    buyerConsentNote: 'Written referral consent confirmed via email',
    supplierConsent: true,
    supplierConsentDate: new Date().toISOString().split('T')[0],
    supplierConsentNote: 'Supplier sales manager agreed in writing to referral fee terms',
    introductionMethod: 'Email Introduction',
    productName: 'Beauty & Personal Care Consignment',
    productCategory: 'Beauty & Personal Care',
    estimatedOrderValue: 25000,
    actualOrderValue: 25000,
    dealStatus: 'Ready for Introduction',
    paymentStatus: 'Unpaid',
    deliveryStatus: 'Pending',
    commissionAgreement: `3% referral commission on invoiced wholesale order total`,
    referralAttributionNote: `Attribution established by Wholesale Connect USA. Parties introduced under registered agreement.`,
    notes: 'Opening wholesale trade order'
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredDeals = deals.filter(d => {
    const matchesSearch =
      d.buyerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dealCustomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.dealStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingDeal(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (d: Deal) => {
    setEditingDeal(d);
    setFormData({
      buyerId: d.buyerId,
      buyerName: d.buyerName,
      buyerCompany: d.buyerCompany,
      supplierId: d.supplierId,
      supplierName: d.supplierName,
      matchId: d.matchId,
      introductionDate: d.introductionDate || '',
      buyerConsent: d.buyerConsent,
      buyerConsentDate: d.buyerConsentDate || '',
      buyerConsentNote: d.buyerConsentNote || '',
      supplierConsent: d.supplierConsent,
      supplierConsentDate: d.supplierConsentDate || '',
      supplierConsentNote: d.supplierConsentNote || '',
      introductionMethod: d.introductionMethod,
      productName: d.productName,
      productCategory: d.productCategory,
      estimatedOrderValue: d.estimatedOrderValue,
      actualOrderValue: d.actualOrderValue,
      dealStatus: d.dealStatus,
      orderDate: d.orderDate || '',
      paymentStatus: d.paymentStatus,
      deliveryStatus: d.deliveryStatus,
      commissionAgreement: d.commissionAgreement,
      referralAttributionNote: d.referralAttributionNote,
      notes: d.notes
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal) {
      updateDeal(editingDeal.id, formData);
    } else {
      addDeal(formData);
    }
    setIsFormOpen(false);
  };

  const handleCopyIntroLetter = (deal: Deal) => {
    const text = `Subject: Official Introduction: ${deal.buyerCompany} <> ${deal.supplierName} (Ref: ${deal.dealCustomId})

Dear ${deal.buyerName} and Wholesale Sales Team at ${deal.supplierName},

I am delighted to officially introduce ${deal.buyerCompany} to ${deal.supplierName}.

Per our mutual communications and verified written consent:
- ${deal.buyerCompany} is an established wholesale buyer seeking to open a recurring trade account for ${deal.productCategory}.
- ${deal.supplierName} is an authorized USA supplier carrying verified brand inventory.

As acknowledged in our Referral Agreement, Wholesale Connect USA is facilitating this introduction under Deal Ref: ${deal.dealCustomId}.

Next Steps:
1. ${deal.buyerName}: Please submit your Resale Tax Certificate and initial opening PO request.
2. ${deal.supplierName}: Please provide your dealer onboarding pack and credit card / wire instructions.

Warm regards,
${user?.displayName || 'Shihab Hossen'}
Wholesale Connect USA
Attribution Protection ID: ${deal.dealCustomId}`;

    navigator.clipboard.writeText(text);
    setCopiedDealId(deal.id);
    setTimeout(() => setCopiedDealId(null), 2500);
  };

  const handleExport = () => {
    const rows = deals.map(d => ({
      DealID: d.dealCustomId,
      Buyer: d.buyerCompany,
      Supplier: d.supplierName,
      Product: d.productName,
      Category: d.productCategory,
      EstimatedValue: d.estimatedOrderValue,
      ActualValue: d.actualOrderValue,
      Status: d.dealStatus,
      BuyerConsent: d.buyerConsent ? 'Yes' : 'No',
      SupplierConsent: d.supplierConsent ? 'Yes' : 'No',
      PaymentStatus: d.paymentStatus,
      DeliveryStatus: d.deliveryStatus,
      IntroMethod: d.introductionMethod,
      Agreement: d.commissionAgreement
    }));
    exportToCsv(`WholesaleConnect_Deals_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Handshake className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.dealsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.dealsSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newDeal}</span>
          </button>
        </div>
      </div>

      {/* Compliance Attribution Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-950 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Strict Referral Protection & Consent Enforcement</p>
          <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            Introductions require verified consent from both the Amazon Buyer and Wholesale Supplier before contact details are exchanged.
            Each transaction generates an irreversible Referral Attribution ID to guarantee commission attribution.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deals by buyer, supplier, deal ID, or product category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full md:w-56 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Deal Stages</option>
          <option value="Potential Deal">Potential Deal</option>
          <option value="Awaiting Consent">Awaiting Consent</option>
          <option value="Ready for Introduction">Ready for Introduction</option>
          <option value="Introduced">Introduced</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Payment Confirmed">Payment Confirmed</option>
          <option value="Deal Completed">Deal Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Deal ID & Introduction</th>
                <th className="py-3 px-4">Amazon Buyer</th>
                <th className="py-3 px-4">Wholesale Supplier</th>
                <th className="py-3 px-4">Product & Category</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-center">Consent Gate</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">{t.noData}</p>
                    <p className="text-xs mt-1">Start by matching a buyer with a supplier or creating a new deal.</p>
                  </td>
                </tr>
              ) : (
                filteredDeals.map(deal => {
                  const hasBothConsent = deal.buyerConsent && deal.supplierConsent;
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{deal.dealCustomId}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {deal.introductionDate || 'Not introduced'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{deal.introductionMethod}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{deal.buyerCompany}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{deal.buyerName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{deal.supplierName}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{deal.productName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{deal.productCategory}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                          ${(deal.actualOrderValue || deal.estimatedOrderValue).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Est. Fee: ${Math.round((deal.actualOrderValue || deal.estimatedOrderValue) * 0.03).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {hasBothConsent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Both Agreed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <AlertTriangle className="w-3 h-3" />
                              Awaiting Consent
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            deal.dealStatus === 'Deal Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : deal.dealStatus === 'Order Placed'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : deal.dealStatus === 'Ready for Introduction' || deal.dealStatus === 'Introduced'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {deal.dealStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleCopyIntroLetter(deal)}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="Copy Official Introduction Email"
                          >
                            {copiedDealId === deal.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setSelectedDeal(deal)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Deal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(deal)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Deal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete deal #${deal.dealCustomId}?`)) deleteDeal(deal.id);
                            }}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DEAL MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{selectedDeal.dealCustomId}</span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedDeal.buyerCompany} &lt;&gt; {selectedDeal.supplierName}
                </h2>
              </div>
              <button onClick={() => setSelectedDeal(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Product & Category</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedDeal.productName}</p>
                <p className="text-slate-500">{selectedDeal.productCategory}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Order Value & Commission</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Order: ${(selectedDeal.actualOrderValue || selectedDeal.estimatedOrderValue).toLocaleString()}
                </p>
                <p className="text-emerald-600 font-mono font-semibold">
                  Fee: ~${Math.round((selectedDeal.actualOrderValue || selectedDeal.estimatedOrderValue) * 0.03).toLocaleString()} (3%)
                </p>
              </div>
            </div>

            {/* Consent Status Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Referral Consent & Attribution Protection</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    {selectedDeal.buyerConsent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Buyer Consent</span>
                  </div>
                  <p className="text-slate-500 mt-1">{selectedDeal.buyerConsentNote || 'Consent on file'}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    {selectedDeal.supplierConsent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Supplier Consent</span>
                  </div>
                  <p className="text-slate-500 mt-1">{selectedDeal.supplierConsentNote || 'Consent on file'}</p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Commission Terms</span>
              <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {selectedDeal.commissionAgreement}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Referral Attribution Notes</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{selectedDeal.referralAttributionNote}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleCopyIntroLetter(selectedDeal)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Official Introduction Letter</span>
              </button>

              <button
                onClick={() => {
                  setSelectedDeal(null);
                  setActiveTab('commissions');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
              >
                View Commission Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DEAL MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingDeal ? `Edit Deal #${editingDeal.dealCustomId}` : 'Create New Introduction Deal'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Select Buyer *</label>
                  <select
                    value={formData.buyerId}
                    onChange={e => {
                      const sel = buyers.find(b => b.id === e.target.value);
                      if (sel) {
                        setFormData({
                          ...formData,
                          buyerId: sel.id,
                          buyerName: sel.contactName,
                          buyerCompany: sel.companyName,
                          productCategory: sel.categories[0] || formData.productCategory
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {buyers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.companyName} ({b.contactName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Select Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={e => {
                      const sel = suppliers.find(s => s.id === e.target.value);
                      if (sel) {
                        setFormData({
                          ...formData,
                          supplierId: sel.id,
                          supplierName: sel.companyName,
                          productName: `${sel.availableBrands[0] || 'Wholesale Line'} Consignment`
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} ({s.contactName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Product Description</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.productCategory}
                    onChange={e => setFormData({ ...formData, productCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Estimated Order Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimatedOrderValue}
                    onChange={e => setFormData({ ...formData, estimatedOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Actual Order Value ($)</label>
                  <input
                    type="number"
                    value={formData.actualOrderValue}
                    onChange={e => setFormData({ ...formData, actualOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Deal Stage</label>
                  <select
                    value={formData.dealStatus}
                    onChange={e => setFormData({ ...formData, dealStatus: e.target.value as DealStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Potential Deal">Potential Deal</option>
                    <option value="Awaiting Consent">Awaiting Consent</option>
                    <option value="Ready for Introduction">Ready for Introduction</option>
                    <option value="Introduced">Introduced</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Payment Confirmed">Payment Confirmed</option>
                    <option value="Deal Completed">Deal Completed</option>
                  </select>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">Consent Verification Gate</div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.buyerConsent}
                      onChange={e => setFormData({ ...formData, buyerConsent: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Buyer Written Consent Received</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.supplierConsent}
                      onChange={e => setFormData({ ...formData, supplierConsent: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Supplier Consent Received</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Commission Agreement Terms</label>
                <input
                  type="text"
                  value={formData.commissionAgreement}
                  onChange={e => setFormData({ ...formData, commissionAgreement: e.target.value })}
                  placeholder="e.g. 3% of invoiced wholesale total within 7 days of delivery"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingDeal ? 'Update Deal' : 'Save Deal & Attribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
