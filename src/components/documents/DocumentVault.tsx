import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, DocumentType } from '../../types';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  X,
  ExternalLink,
  Download,
  Building2,
  Users,
  Handshake,
  DollarSign
} from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { documents, addDocument, deleteDocument, buyers, suppliers, deals, t, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('Supplier Catalog');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [associatedEntityType, setAssociatedEntityType] = useState<'Buyer' | 'Supplier' | 'Deal' | 'General'>('Supplier');
  const [associatedEntityId, setAssociatedEntityId] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.associatedEntityName && d.associatedEntityName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileName) {
      alert('Please provide a title and select a document.');
      return;
    }

    let assocName = 'General Workspace';
    if (associatedEntityType === 'Buyer') {
      assocName = buyers.find(b => b.id === associatedEntityId)?.companyName || 'Buyer';
    } else if (associatedEntityType === 'Supplier') {
      assocName = suppliers.find(s => s.id === associatedEntityId)?.companyName || 'Supplier';
    } else if (associatedEntityType === 'Deal') {
      const deal = deals.find(d => d.id === associatedEntityId);
      assocName = deal ? `${deal.dealCustomId}: ${deal.buyerCompany}` : 'Deal';
    }

    addDocument({
      title,
      type: docType,
      fileName,
      fileSize,
      associatedEntityType,
      associatedEntityId,
      associatedEntityName: assocName,
      verificationStatus: 'Verified',
      notes
    });

    setIsFormOpen(false);
    setTitle('');
    setFileName('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.docsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.docsSubtitle}</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.uploadDoc}</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title, file name, or associated partner..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="w-full md:w-56 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="all">All Document Types</option>
          <option value="Supplier Catalog">Supplier Catalogs</option>
          <option value="Wholesale Price List">Wholesale Price Lists</option>
          <option value="Business Verification">Business Verifications</option>
          <option value="Reseller Authorization">Reseller Authorizations</option>
          <option value="Commission Agreement">Commission Agreements</option>
          <option value="Deal Document">Deal Documents</option>
          <option value="Payment Proof">Payment Proofs</option>
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <p className="text-sm font-semibold">{t.noData}</p>
            <p className="text-xs mt-1">Upload wholesale catalogs, dealer agreements, and resale tax certificates.</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block truncate">
                    {doc.type}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{doc.title}</h4>
                </div>

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Name:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{doc.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size:</span>
                  <span className="font-mono text-slate-500">{doc.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Associated With:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {doc.associatedEntityName}
                  </span>
                </div>
              </div>

              {doc.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{doc.notes}</p>}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="font-mono text-slate-400">{doc.uploadDate}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {doc.verificationStatus}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.uploadDoc}</h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. NorthEast Wholesale Line Card Q4"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Document Classification</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="Supplier Catalog">Supplier Catalog</option>
                  <option value="Wholesale Price List">Wholesale Price List</option>
                  <option value="Business Verification">Business Verification (EIN / W-9 / LLC)</option>
                  <option value="Reseller Authorization">Reseller Authorization Addendum</option>
                  <option value="Commission Agreement">Commission Agreement</option>
                  <option value="Deal Document">Deal PO / Invoice</option>
                  <option value="Payment Proof">Payment Proof / Wire Slip</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Associated With</label>
                  <select
                    value={associatedEntityType}
                    onChange={e => setAssociatedEntityType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Supplier">Wholesale Supplier</option>
                    <option value="Buyer">Amazon Buyer</option>
                    <option value="Deal">Deal Record</option>
                    <option value="General">General Workspace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Select Entity</label>
                  <select
                    value={associatedEntityId}
                    onChange={e => setAssociatedEntityId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {associatedEntityType === 'Supplier' &&
                      suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.companyName}
                        </option>
                      ))}
                    {associatedEntityType === 'Buyer' &&
                      buyers.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.companyName}
                        </option>
                      ))}
                    {associatedEntityType === 'Deal' &&
                      deals.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.dealCustomId}: {d.buyerCompany}
                        </option>
                      ))}
                    {associatedEntityType === 'General' && <option value="general">Global Vault</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Choose File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Notes / Verification Remarks</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Validated with state registry portal on Nov 2026..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Upload & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
