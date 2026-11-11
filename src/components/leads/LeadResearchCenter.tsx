import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadType, LeadSource, LeadVerificationStatus, LeadContactStatus } from '../../types';
import { exportToCsv } from '../../utils/csv';
import {
  Compass,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Users,
  Building2,
  Trash2,
  Edit2,
  X,
  FileCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const LeadResearchCenter: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead, convertLeadToBuyer, convertLeadToSupplier, t, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Lead Research Checklist interactive state
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    corpRegistration: true,
    einVerify: true,
    resaleCert: false,
    warehouseAddress: true,
    amazonFeedback: false,
    brandInvoices: true
  });

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const initialFormState: Omit<Lead, 'id' | 'leadCustomId' | 'discoveryDate'> = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    leadType: 'Buyer',
    leadSource: 'Facebook Groups',
    sourceUrl: '',
    researchNotes: '',
    verificationStatus: 'Unverified',
    contactStatus: 'Not Contacted',
    categories: ['General Wholesale']
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categoriesInput, setCategoriesInput] = useState('');

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leadCustomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.sourceUrl && l.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.researchNotes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || l.leadType === typeFilter;
    const matchesSource = sourceFilter === 'all' || l.leadSource === sourceFilter;

    return matchesSearch && matchesType && matchesSource;
  });

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData(initialFormState);
    setCategoriesInput('Beauty & Personal Care');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (l: Lead) => {
    setEditingLead(l);
    setFormData({
      companyName: l.companyName,
      contactName: l.contactName,
      email: l.email || '',
      phone: l.phone || '',
      leadType: l.leadType,
      leadSource: l.leadSource,
      sourceUrl: l.sourceUrl || '',
      researchNotes: l.researchNotes,
      verificationStatus: l.verificationStatus,
      contactStatus: l.contactStatus,
      categories: l.categories || []
    });
    setCategoriesInput((l.categories || []).join(', '));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName) {
      alert('Company name is required.');
      return;
    }

    const cats = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);
    const payload = {
      ...formData,
      categories: cats
    };

    if (editingLead) {
      updateLead(editingLead.id, payload);
    } else {
      addLead(payload);
    }

    setIsFormOpen(false);
  };

  const handleExport = () => {
    const rows = leads.map(l => ({
      LeadID: l.leadCustomId,
      Company: l.companyName,
      Contact: l.contactName,
      Type: l.leadType,
      Source: l.leadSource,
      SourceURL: l.sourceUrl || '',
      DiscoveryDate: l.discoveryDate,
      VerificationStatus: l.verificationStatus,
      ContactStatus: l.contactStatus,
      Notes: l.researchNotes
    }));
    exportToCsv(`WholesaleConnect_LeadResearch_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.leadsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.leadsSubtitle}</p>
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
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addLead}</span>
          </button>
        </div>
      </div>

      {/* Lead Research & Verification Checklist Widget */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/10 via-slate-50 to-white dark:from-slate-900 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              {t.researchChecklist}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Adhere to strict verification standards prior to introduction</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {[
            { id: 'corpRegistration', label: '1. State Corporate Filing Verification', desc: 'Check Secretary of State LLC/Inc active standing' },
            { id: 'einVerify', label: '2. IRS EIN & W-9 Tax Exemption Match', desc: 'Ensure legal entity name matches bank account' },
            { id: 'warehouseAddress', label: '3. Physical Warehouse & Phone Verification', desc: 'Confirm commercial address and active trade desk' },
            { id: 'resaleCert', label: '4. Buyer Sales Tax Resale Exemption', desc: 'Verify buyer Resale Certificate is valid for exempt PO' },
            { id: 'amazonFeedback', label: '5. Amazon Seller Storefront Health Audit', desc: 'Check seller review count, MAP compliance history' },
            { id: 'brandInvoices', label: '6. Itemized Manufacturer Invoice Inspection', desc: 'Verify invoice has UPCs and ungateable formatting' }
          ].map(item => (
            <label
              key={item.id}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                checklist[item.id]
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[item.id]}
                onChange={() => toggleChecklistItem(item.id)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <p className={`font-semibold ${checklist[item.id] ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, source, group, notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="w-full md:w-36 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">Type: All</option>
          <option value="Buyer">Buyers Only</option>
          <option value="Supplier">Suppliers Only</option>
        </select>

        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">Source: All</option>
          <option value="Facebook Groups">Facebook Groups</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Thomasnet">Thomasnet</option>
          <option value="Wholesale Central">Wholesale Central</option>
          <option value="Faire">Faire</option>
          <option value="Google Search">Google Search</option>
          <option value="Trade Shows">Trade Shows</option>
          <option value="Referrals">Referrals</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Lead & Contact</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Discovery Source & URL</th>
                <th className="py-3 px-4">Discovery Date</th>
                <th className="py-3 px-4">Verification & Outreach</th>
                <th className="py-3 px-4">Research Notes</th>
                <th className="py-3 px-4 text-center">Convert / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">{t.noData}</p>
                    <p className="text-xs mt-1">Record leads discovered during your daily outreach.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{l.companyName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{l.leadCustomId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{l.contactName}</span>
                      </div>
                      {l.email && <div className="text-[10px] text-slate-400 mt-0.5">{l.email}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.leadType === 'Buyer'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {l.leadType === 'Buyer' ? <Users className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {l.leadType}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{l.leadSource}</div>
                      {l.sourceUrl && (
                        <a
                          href={l.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5 truncate max-w-[200px]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{l.sourceUrl}</span>
                        </a>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {l.discoveryDate}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        {l.verificationStatus}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Status: <span className="font-semibold">{l.contactStatus}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {l.researchNotes}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {l.contactStatus !== 'Converted' ? (
                          <button
                            onClick={() => {
                              if (l.leadType === 'Buyer') {
                                convertLeadToBuyer(l.id);
                              } else {
                                convertLeadToSupplier(l.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] flex items-center gap-1 shadow-xs whitespace-nowrap"
                            title={`Convert directly into ${l.leadType} record`}
                          >
                            <span>Convert</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">
                            Converted
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete lead record?')) deleteLead(l.id);
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

      {/* ADD / EDIT LEAD MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingLead ? 'Edit Discovered Lead' : 'Record New Discovered Lead'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company / Store Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Timberland Commerce"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Jason Wood"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Lead Type</label>
                  <select
                    value={formData.leadType}
                    onChange={e => setFormData({ ...formData, leadType: e.target.value as LeadType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="Buyer">Buyer / Amazon Seller</option>
                    <option value="Supplier">Wholesale Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Discovery Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={e => setFormData({ ...formData, leadSource: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Facebook Groups">Facebook Groups</option>
                    <option value="Facebook Pages">Facebook Pages</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Thomasnet">Thomasnet</option>
                    <option value="Wholesale Central">Wholesale Central</option>
                    <option value="Faire">Faire</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Trade Shows">Trade Shows</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Source URL / Group Link</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://facebook.com/groups/... or LinkedIn profile URL"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Email (if known)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@ecom.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (615) ..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Research Notes & Sourcing Needs</label>
                <textarea
                  rows={3}
                  required
                  value={formData.researchNotes}
                  onChange={e => setFormData({ ...formData, researchNotes: e.target.value })}
                  placeholder="Products needed, budget, posted request in Facebook group, current distributor bottlenecks..."
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
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  {editingLead ? 'Update Lead' : 'Save Discovered Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
