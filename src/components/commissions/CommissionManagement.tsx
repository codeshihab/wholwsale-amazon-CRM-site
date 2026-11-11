import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Commission, CommissionPayer, CommissionType, CommissionStatus, PaymentRecord } from '../../types';
import { exportToCsv } from '../../utils/csv';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  Calendar,
  Trash2,
  Edit2,
  X,
  History,
  TrendingUp,
  Download
} from 'lucide-react';

export const CommissionManagement: React.FC = () => {
  const { commissions, addCommission, updateCommission, recordPayment, deleteCommission, deals, settings, t, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetCommission, setTargetCommission] = useState<Commission | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Wise / Standard Chartered Dhaka Wire');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Form State
  const initialFormState: Omit<Commission, 'id' | 'commissionCustomId'> = {
    dealId: deals[0]?.id || '',
    dealCustomId: deals[0]?.dealCustomId || 'DEAL-4001',
    buyerName: deals[0]?.buyerCompany || 'Apex Prime Commerce',
    supplierName: deals[0]?.supplierName || 'NorthEast Wholesale Distribution',
    payer: 'Buyer',
    commissionType: 'Percentage',
    commissionRate: 3.0,
    orderValue: 25000,
    commissionAmount: 750,
    paidAmount: 0,
    balanceRemaining: 750,
    currency: 'USD',
    agreementDate: new Date().toISOString().split('T')[0],
    expectedPaymentDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'Wise / Direct Wire Transfer',
    status: 'Pending',
    notes: 'Referral fee agreement',
    paymentHistory: []
  };

  const [formData, setFormData] = useState(initialFormState);

  // Live calculation of formula
  const handleOrderOrRateChange = (orderVal: number, rate: number, type: CommissionType) => {
    let amount = 0;
    if (type === 'Percentage') {
      amount = Math.round((orderVal * rate) / 100);
    } else {
      amount = formData.commissionAmount;
    }
    const balance = Math.max(0, amount - formData.paidAmount);
    setFormData(prev => ({
      ...prev,
      orderValue: orderVal,
      commissionRate: rate,
      commissionType: type,
      commissionAmount: amount,
      balanceRemaining: balance
    }));
  };

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch =
      c.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commissionCustomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.dealCustomId && c.dealCustomId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommissionEarned = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalPaid = commissions.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalBalanceDue = commissions.reduce((sum, c) => sum + (c.balanceRemaining || 0), 0);

  const handleOpenAdd = () => {
    setEditingCommission(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Commission) => {
    setEditingCommission(c);
    setFormData({
      dealId: c.dealId,
      dealCustomId: c.dealCustomId,
      buyerName: c.buyerName,
      supplierName: c.supplierName,
      payer: c.payer,
      commissionType: c.commissionType,
      commissionRate: c.commissionRate,
      orderValue: c.orderValue,
      commissionAmount: c.commissionAmount,
      paidAmount: c.paidAmount,
      balanceRemaining: c.balanceRemaining,
      currency: c.currency,
      agreementDate: c.agreementDate,
      expectedPaymentDate: c.expectedPaymentDate,
      actualPaymentDate: c.actualPaymentDate || '',
      paymentMethod: c.paymentMethod,
      status: c.status,
      transactionReference: c.transactionReference || '',
      notes: c.notes,
      paymentHistory: c.paymentHistory
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommission) {
      updateCommission(editingCommission.id, formData);
    } else {
      addCommission(formData);
    }
    setIsFormOpen(false);
  };

  const handleOpenRecordPayment = (c: Commission) => {
    setTargetCommission(c);
    setPaymentAmount(c.balanceRemaining);
    setPaymentRef(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes('Settlement confirmation');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCommission || paymentAmount <= 0) return;

    recordPayment(targetCommission.id, {
      date: new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentRef,
      notes: paymentNotes
    });

    setIsPaymentModalOpen(false);
  };

  const handleExport = () => {
    const rows = commissions.map(c => ({
      CommissionID: c.commissionCustomId,
      DealRef: c.dealCustomId || c.dealId,
      Buyer: c.buyerName,
      Supplier: c.supplierName,
      Payer: c.payer,
      Type: c.commissionType,
      Rate: `${c.commissionRate}%`,
      OrderValueUSD: c.orderValue,
      CommissionUSD: c.commissionAmount,
      PaidUSD: c.paidAmount,
      BalanceDueUSD: c.balanceRemaining,
      Status: c.status,
      DueDate: c.expectedPaymentDate,
      PaidDate: c.actualPaymentDate || 'N/A',
      Method: c.paymentMethod
    }));
    exportToCsv(`WholesaleConnect_CommissionLedger_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.commissionsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.commissionsSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Financial Ledger</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addCommission}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Agreed Referral Fees</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            ${totalCommissionEarned.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all confirmed deal contracts</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Settled & Received (Paid)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Deposited to bank accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Receivables (Pending & Due)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            ${totalBalanceDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting order delivery / invoice schedule</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search commissions by ID, buyer, supplier, deal ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full md:w-52 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Due">Due for Settlement</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid in Full</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Commission Records Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Commission ID & Deal</th>
                <th className="py-3 px-4">Buyer & Supplier</th>
                <th className="py-3 px-4">Calculation Formula</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-right">Agreed Fee</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">{t.noData}</p>
                    <p className="text-xs mt-1">No commission records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map(comm => (
                  <tr key={comm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{comm.commissionCustomId}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Deal: <span className="font-mono">{comm.dealCustomId || 'Custom'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{comm.buyerName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Payer: {comm.payer}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {comm.commissionType === 'Percentage' ? `${comm.commissionRate}% of Order` : 'Fixed Fee'}
                      </div>
                      <div className="text-[10px] text-slate-500">Due: {comm.expectedPaymentDate}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      ${comm.orderValue.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                      ${comm.commissionAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${comm.paidAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                      ${comm.balanceRemaining.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          comm.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : comm.status === 'Partially Paid'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : comm.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {comm.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {comm.balanceRemaining > 0 && (
                          <button
                            onClick={() => handleOpenRecordPayment(comm)}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs"
                          >
                            Record Pay
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCommission(comm)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700"
                          title="History & Details"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(comm)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete commission record ${comm.commissionCustomId}?`)) {
                              deleteCommission(comm.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && targetCommission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Record Payment for #{targetCommission.commissionCustomId}
              </h2>
              <button onClick={() => setIsPaymentModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Commission:</span>
                <span className="font-mono font-bold">${targetCommission.commissionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-mono text-emerald-600 font-semibold">${targetCommission.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Remaining Balance:</span>
                <span className="font-mono font-bold text-amber-600">${targetCommission.balanceRemaining.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Amount to Record ($ USD) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={targetCommission.balanceRemaining}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-base font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="Wise to Standard Chartered Dhaka">Wise to Standard Chartered Dhaka</option>
                  <option value="Payoneer USD Transfer">Payoneer USD Transfer</option>
                  <option value="Direct International Bank Wire">Direct International Bank Wire</option>
                  <option value="ACH Transfer (US Partner Account)">ACH Transfer (US Partner Account)</option>
                  <option value="PayPal Business">PayPal Business</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Transaction Reference / Bank Slip #</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. TRX-WISE-99214"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Settlement for first tranche of wholesale order"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PAYMENT HISTORY DETAIL MODAL */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-emerald-600 font-bold">{selectedCommission.commissionCustomId}</span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Payment History & Settlement Audit
                </h3>
              </div>
              <button onClick={() => setSelectedCommission(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">Transaction Installments:</h4>
              {selectedCommission.paymentHistory.length === 0 ? (
                <p className="text-slate-500 italic p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  No payment tranches recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {selectedCommission.paymentHistory.map((p, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">${p.amount.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.method}</div>
                        <div className="text-[10px] font-mono text-slate-400">Ref: {p.reference}</div>
                      </div>
                      <div className="text-right font-mono text-slate-500 text-[11px]">{p.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedCommission(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COMMISSION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingCommission ? 'Edit Commission Record' : 'Create New Commission Agreement'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Related Deal</label>
                <select
                  value={formData.dealId}
                  onChange={e => {
                    const sel = deals.find(d => d.id === e.target.value);
                    if (sel) {
                      const val = sel.actualOrderValue || sel.estimatedOrderValue;
                      const amt = Math.round((val * formData.commissionRate) / 100);
                      setFormData({
                        ...formData,
                        dealId: sel.id,
                        dealCustomId: sel.dealCustomId,
                        buyerName: sel.buyerCompany,
                        supplierName: sel.supplierName,
                        orderValue: val,
                        commissionAmount: amt,
                        balanceRemaining: amt - formData.paidAmount
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.dealCustomId}: {d.buyerCompany} &lt;&gt; {d.supplierName} (${(d.actualOrderValue || d.estimatedOrderValue).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Commission Type</label>
                  <select
                    value={formData.commissionType}
                    onChange={e => handleOrderOrRateChange(formData.orderValue, formData.commissionRate, e.target.value as CommissionType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Fee ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={e => handleOrderOrRateChange(formData.orderValue, Number(e.target.value), formData.commissionType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Eligible Wholesale Order ($)</label>
                  <input
                    type="number"
                    value={formData.orderValue}
                    onChange={e => handleOrderOrRateChange(Number(e.target.value), formData.commissionRate, formData.commissionType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Calculated Commission ($)</label>
                  <input
                    type="number"
                    value={formData.commissionAmount}
                    onChange={e => {
                      const amt = Number(e.target.value);
                      setFormData({ ...formData, commissionAmount: amt, balanceRemaining: amt - formData.paidAmount });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Payer</label>
                  <select
                    value={formData.payer}
                    onChange={e => setFormData({ ...formData, payer: e.target.value as CommissionPayer })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Split 50/50">Split 50/50</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Payment Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as CommissionStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Due">Due</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Agreement Date</label>
                  <input
                    type="date"
                    value={formData.agreementDate}
                    onChange={e => setFormData({ ...formData, agreementDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Expected Payment Date</label>
                  <input
                    type="date"
                    value={formData.expectedPaymentDate}
                    onChange={e => setFormData({ ...formData, expectedPaymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  {editingCommission ? 'Save Updates' : 'Add Commission Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
