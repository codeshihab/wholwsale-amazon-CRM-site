import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv } from '../../utils/csv';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Building2,
  Compass,
  Handshake,
  DollarSign,
  PieChart,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { buyers, suppliers, leads, deals, commissions, tasks, t, language } = useApp();

  const [activeReport, setActiveReport] = useState<string>('buyer_acquisition');
  const [dateRange, setDateRange] = useState<string>('all');

  const reportsList = [
    { id: 'buyer_acquisition', name: 'Buyer Acquisition Report', icon: Users },
    { id: 'supplier_acquisition', name: 'Supplier Acquisition Report', icon: Building2 },
    { id: 'lead_source', name: 'Lead Source Discovery Report', icon: Compass },
    { id: 'qualification', name: 'Qualification & Audit Report', icon: CheckCircle2 },
    { id: 'matching', name: 'Buyer-Supplier Matching Report', icon: TrendingUp },
    { id: 'deal_conversion', name: 'Deal Conversion Funnel Report', icon: Handshake },
    { id: 'commission_revenue', name: 'Commission & Revenue Report', icon: DollarSign },
    { id: 'pending_commission', name: 'Pending Commission Receivables', icon: DollarSign },
    { id: 'followup_performance', name: 'Follow-up Performance Report', icon: BarChart3 }
  ];

  // Dynamic calculations for reports
  const leadSourceCounts = useMemo(() => {
    const map: { [key: string]: number } = {};
    leads.forEach(l => {
      map[l.leadSource] = (map[l.leadSource] || 0) + 1;
    });
    buyers.forEach(b => {
      map[b.leadSource] = (map[b.leadSource] || 0) + 1;
    });
    return Object.entries(map).map(([source, count]) => ({ source, count }));
  }, [leads, buyers]);

  const categoryDemand = useMemo(() => {
    const map: { [cat: string]: { buyers: number; suppliers: number } } = {};
    buyers.forEach(b => {
      b.categories.forEach(c => {
        if (!map[c]) map[c] = { buyers: 0, suppliers: 0 };
        map[c].buyers += 1;
      });
    });
    suppliers.forEach(s => {
      s.categories.forEach(c => {
        if (!map[c]) map[c] = { buyers: 0, suppliers: 0 };
        map[c].suppliers += 1;
      });
    });
    return Object.entries(map).map(([cat, counts]) => ({ cat, ...counts }));
  }, [buyers, suppliers]);

  const handleExportCurrentReport = () => {
    let rows: Record<string, any>[] = [];
    let filename = `WholesaleConnect_${activeReport}`;

    if (activeReport === 'buyer_acquisition') {
      rows = buyers.map(b => ({
        BuyerID: b.buyerCustomId,
        Company: b.companyName,
        Contact: b.contactName,
        Budget: b.purchasingBudget,
        MonthlyCap: b.monthlyCapacity,
        Model: b.sellingModel,
        Status: b.status,
        DateAdded: b.dateAdded
      }));
    } else if (activeReport === 'supplier_acquisition') {
      rows = suppliers.map(s => ({
        SupplierID: s.supplierCustomId,
        Company: s.companyName,
        Type: s.companyType,
        MOV: s.minimumOrderValue,
        AmazonAllowed: s.amazonAcceptance,
        Verification: s.verificationStatus,
        PipelineStatus: s.status
      }));
    } else if (activeReport === 'commission_revenue' || activeReport === 'pending_commission') {
      rows = commissions.map(c => ({
        CommissionID: c.commissionCustomId,
        DealRef: c.dealCustomId,
        Buyer: c.buyerName,
        Supplier: c.supplierName,
        OrderValue: c.orderValue,
        FeeAmount: c.commissionAmount,
        PaidAmount: c.paidAmount,
        BalanceDue: c.balanceRemaining,
        Status: c.status,
        DueDate: c.expectedPaymentDate
      }));
    } else if (activeReport === 'deal_conversion') {
      rows = deals.map(d => ({
        DealID: d.dealCustomId,
        Buyer: d.buyerCompany,
        Supplier: d.supplierName,
        EstimatedValue: d.estimatedOrderValue,
        ActualValue: d.actualOrderValue,
        Status: d.dealStatus,
        IntroductionDate: d.introductionDate
      }));
    } else {
      rows = leadSourceCounts.map(l => ({
        DiscoverySource: l.source,
        TotalLeads: l.count
      }));
    }

    exportToCsv(filename, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.reportsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.reportsSubtitle}</p>
        </div>

        <button
          onClick={handleExportCurrentReport}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Selected Report (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Reports</h3>
          {reportsList.map(rep => {
            const Icon = rep.icon;
            const isActive = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-colors text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs border-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="truncate">{rep.name}</span>
              </button>
            );
          })}
        </div>

        {/* Report Content Viewport */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {reportsList.find(r => r.id === activeReport)?.name}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Calculated in real-time from active system records</p>
            </div>
            <span className="font-mono text-slate-500 text-[11px]">As of {new Date().toLocaleDateString()}</span>
          </div>

          {/* Conditional Report Content */}
          {activeReport === 'buyer_acquisition' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Total Buyers</span>
                  <div className="text-xl font-bold font-mono mt-1">{buyers.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Qualified Buyers</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    {buyers.filter(b => b.status === 'Qualified' || b.status === 'Active Client').length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Avg Purchasing Budget</span>
                  <div className="text-xl font-bold font-mono text-blue-600 mt-1">
                    ${buyers.length > 0 ? Math.round(buyers.reduce((s, b) => s + b.purchasingBudget, 0) / buyers.length).toLocaleString() : 0}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2.5">Buyer</th>
                      <th className="p-2.5">Model</th>
                      <th className="p-2.5 text-right">Budget</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {buyers.map(b => (
                      <tr key={b.id}>
                        <td className="p-2.5 font-medium">{b.companyName}</td>
                        <td className="p-2.5">{b.sellingModel}</td>
                        <td className="p-2.5 text-right font-mono">${b.purchasingBudget.toLocaleString()}</td>
                        <td className="p-2.5 font-semibold text-blue-600">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'lead_source' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Lead Volume by Sourcing Channel</h4>
              <div className="space-y-2">
                {leadSourceCounts.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{s.source}</span>
                      <span className="font-mono">{s.count} leads</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${Math.min(100, s.count * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeReport === 'commission_revenue' || activeReport === 'pending_commission') && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Total Invoiced</span>
                  <div className="text-xl font-bold font-mono mt-1">
                    ${commissions.reduce((s, c) => s + c.commissionAmount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Collected in Bank</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    ${commissions.reduce((s, c) => s + c.paidAmount, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Outstanding Balance</span>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                    ${commissions.reduce((s, c) => s + c.balanceRemaining, 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2.5">Deal & Client</th>
                      <th className="p-2.5 text-right">Fee ($)</th>
                      <th className="p-2.5 text-right">Paid ($)</th>
                      <th className="p-2.5 text-right">Balance</th>
                      <th className="p-2.5">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissions.map(c => (
                      <tr key={c.id}>
                        <td className="p-2.5 font-medium">{c.buyerName}</td>
                        <td className="p-2.5 text-right font-mono">${c.commissionAmount.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-600">${c.paidAmount.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-600">${c.balanceRemaining.toLocaleString()}</td>
                        <td className="p-2.5 font-mono">{c.expectedPaymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport !== 'buyer_acquisition' && activeReport !== 'lead_source' && activeReport !== 'commission_revenue' && activeReport !== 'pending_commission' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Wholesale Category Demand Matrix</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2.5">Product Category</th>
                      <th className="p-2.5 text-center">Interested Buyers</th>
                      <th className="p-2.5 text-center">Available Suppliers</th>
                      <th className="p-2.5">Market Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categoryDemand.map((cd, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{cd.cat}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-600">{cd.buyers}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-600">{cd.suppliers}</td>
                        <td className="p-2.5">
                          {cd.suppliers >= cd.buyers ? (
                            <span className="text-emerald-600 font-semibold">Healthy Supply</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">High Buyer Demand</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
