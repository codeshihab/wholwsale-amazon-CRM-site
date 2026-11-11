import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommunicationLog, CommunicationType, ResponseStatus, MessageTemplate } from '../../types';
import { DEFAULT_TEMPLATES, fillTemplate } from '../../utils/templates';
import {
  MessageSquare,
  Plus,
  Copy,
  Check,
  Send,
  Phone,
  Calendar,
  Clock,
  Trash2,
  X,
  Users,
  Building2,
  FileText,
  Search,
  Filter
} from 'lucide-react';

export const CommunicationCenter: React.FC = () => {
  const {
    communications,
    addCommunication,
    deleteCommunication,
    buyers,
    suppliers,
    deals,
    settings,
    user,
    t,
    language
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'templates'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template preview & fill state
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(DEFAULT_TEMPLATES[0]);
  const [targetBuyerId, setTargetBuyerId] = useState<string>(buyers[0]?.id || '');
  const [targetSupplierId, setTargetSupplierId] = useState<string>(suppliers[0]?.id || '');

  // Log Form Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logEntityType, setLogEntityType] = useState<'Buyer' | 'Supplier'>('Buyer');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(buyers[0]?.id || '');
  const [commType, setCommType] = useState<CommunicationType>('Email Sent');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>('Pending');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Filled Template Text
  const currentFilledTemplate = React.useMemo(() => {
    const selBuyer = buyers.find(b => b.id === targetBuyerId) || buyers[0];
    const selSupplier = suppliers.find(s => s.id === targetSupplierId) || suppliers[0];

    const data: Record<string, string> = {
      ContactName: logEntityType === 'Buyer' ? selBuyer?.contactName || 'Marcus' : selSupplier?.contactName || 'Robert',
      BuyerContact: selBuyer?.contactName || 'Marcus Vance',
      SupplierContact: selSupplier?.contactName || 'Robert Sterling',
      BuyerCompanyName: selBuyer?.companyName || 'Apex Prime Commerce',
      SupplierCompanyName: selSupplier?.companyName || 'NorthEast Wholesale Distribution',
      Category: selBuyer?.categories[0] || 'Beauty & Personal Care',
      State: selSupplier?.state || 'New Jersey',
      MOQ: String(selSupplier?.moq || 24),
      OrderValue: `$${(selBuyer?.purchasingBudget || 25000).toLocaleString()}`,
      CommissionRate: `${settings.defaultCommissionRate || 3.0}%`,
      CommissionAmount: `$${Math.round((selBuyer?.purchasingBudget || 25000) * 0.03).toLocaleString()}`,
      DueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      OrderDate: new Date().toISOString().split('T')[0],
      ProductDetails: `${selSupplier?.availableBrands[0] || 'Wholesale Line'} Master Cartons`,
      PayerContact: selBuyer?.contactName || 'Marcus Vance',
      PaymentMethod: 'Wise / Wire to Standard Chartered Dhaka',
      AccountDetails: 'Wholesale Connect USA Account #8892-0192',
      DealId: 'DEAL-4001',
      SenderName: user?.displayName || 'Shihab Hossen',
      SenderEmail: user?.email || 'mdshihabhossen.dm@gmail.com',
      SenderWhatsApp: settings.businessWhatsApp || '+880 1712-345678'
    };

    return {
      subject: fillTemplate(selectedTemplate.subject, data),
      body: fillTemplate(selectedTemplate.body, data)
    };
  }, [selectedTemplate, targetBuyerId, targetSupplierId, buyers, suppliers, settings, user, logEntityType]);

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`Subject: ${currentFilledTemplate.subject}\n\n${currentFilledTemplate.body}`);
    setCopiedId(selectedTemplate.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const entityName =
      logEntityType === 'Buyer'
        ? buyers.find(b => b.id === selectedEntityId)?.companyName || 'Unknown Buyer'
        : suppliers.find(s => s.id === selectedEntityId)?.companyName || 'Unknown Supplier';

    addCommunication({
      entityType: logEntityType,
      entityId: selectedEntityId,
      entityName,
      communicationType: commType,
      subject: subject || 'Wholesale Sourcing Follow-up',
      content,
      responseStatus,
      nextFollowUpDate,
      notes
    });

    setIsLogModalOpen(false);
    setSubject('');
    setContent('');
    setNotes('');
  };

  const filteredLogs = communications.filter(c => {
    const matchesSearch =
      c.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || c.communicationType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.commTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.commSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented sub tabs */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'logs'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Communication Logs ({communications.length})
            </button>
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'templates'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Outreach Templates (7)
            </button>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.logComm}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'logs' ? (
        /* COMMUNICATIONS LOG VIEW */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search correspondence by company, subject, or message content..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full md:w-52 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Communication Types</option>
              <option value="Email Sent">Email Sent</option>
              <option value="WhatsApp Message Sent">WhatsApp Message</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Reply Received">Reply Received</option>
            </select>
          </div>

          {/* Logs List */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                <p className="text-sm font-semibold">{t.noData}</p>
                <p className="text-xs mt-1">Log correspondence with Amazon sellers and wholesale suppliers.</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.entityType === 'Buyer'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {log.entityType}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.entityName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{log.communicationType}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="font-mono">{new Date(log.date).toLocaleDateString()}</span>
                      {log.nextFollowUpDate && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          Next: {log.nextFollowUpDate}
                        </span>
                      )}
                      <button
                        onClick={() => deleteCommunication(log.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="font-semibold text-slate-900 dark:text-slate-100 pt-1">{log.subject}</div>

                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {log.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Response: <span className="font-semibold text-slate-800 dark:text-slate-200">{log.responseStatus}</span>
                    </span>
                    {log.notes && <span>Notes: {log.notes}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TEMPLATES VIEW WITH PREVIEW & LIVE PLACEHOLDER INJECTION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Template Selection Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Templates</h3>
            {DEFAULT_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`w-full p-3.5 rounded-xl border text-left transition-colors text-xs ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{tpl.category}</span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {tpl.id}</span>
                </div>
                <div className="font-bold truncate">{tpl.name}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.subject}</div>
              </button>
            ))}
          </div>

          {/* Template Live Composer / Injector */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{selectedTemplate.category}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedTemplate.name}</h3>
              </div>

              <button
                onClick={handleCopyTemplate}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs ${
                  copiedId === selectedTemplate.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copiedId === selectedTemplate.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === selectedTemplate.id ? t.copied : t.copy}</span>
              </button>
            </div>

            {/* Entity selector controls to dynamically populate placeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Select Buyer for Placeholders</label>
                <select
                  value={targetBuyerId}
                  onChange={e => setTargetBuyerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.companyName} ({b.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Select Supplier for Placeholders</label>
                <select
                  value={targetSupplierId}
                  onChange={e => setTargetSupplierId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.contactName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Preview */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Rendered Subject Line</label>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {currentFilledTemplate.subject}
              </div>
            </div>

            {/* Message Body Preview */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Rendered Email / WhatsApp Body</label>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {currentFilledTemplate.body}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span>All placeholders populated from active records. Ready to paste into Gmail, Outlook, or WhatsApp.</span>
            </div>
          </div>
        </div>
      )}

      {/* LOG COMMUNICATION MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.logComm}</h2>
              <button onClick={() => setIsLogModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Entity Type</label>
                  <select
                    value={logEntityType}
                    onChange={e => {
                      const type = e.target.value as 'Buyer' | 'Supplier';
                      setLogEntityType(type);
                      setSelectedEntityId(type === 'Buyer' ? buyers[0]?.id || '' : suppliers[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Buyer">Buyer / Amazon Seller</option>
                    <option value="Supplier">Wholesale Supplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Select Contact</label>
                  <select
                    value={selectedEntityId}
                    onChange={e => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {logEntityType === 'Buyer'
                      ? buyers.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.companyName} ({b.contactName})
                          </option>
                        ))
                      : suppliers.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.companyName} ({s.contactName})
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Communication Type</label>
                  <select
                    value={commType}
                    onChange={e => setCommType(e.target.value as CommunicationType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Email Sent">Email Sent</option>
                    <option value="WhatsApp Message Sent">WhatsApp Message</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Meeting">Meeting (Zoom/Phone)</option>
                    <option value="Follow-up">Follow-up Note</option>
                    <option value="Reply Received">Reply Received</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Response Status</label>
                  <select
                    value={responseStatus}
                    onChange={e => setResponseStatus(e.target.value as ResponseStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Pending">Pending Reply</option>
                    <option value="Positive">Positive / High Interest</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Not Interested</option>
                    <option value="No Response">No Response Yet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Subject Line</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Invoiced catalog line inquiry"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Summary / Message Text</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Record summary of call, email sent, or response from client..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={e => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Communication Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
