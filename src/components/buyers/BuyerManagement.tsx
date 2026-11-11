import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Buyer, BuyerStatus, AmazonSellingModel } from '../../types';
import { exportToCsv, parseCsv } from '../../utils/csv';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Calendar,
  Building,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const BuyerManagement: React.FC = () => {
  const { buyers, addBuyer, updateBuyer, deleteBuyer, importBuyers, addCommunication, t, language, setActiveTab } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sellingModelFilter, setSellingModelFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');

  // Modals
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [commNote, setCommNote] = useState('');

  // Form State
  const initialFormState: Omit<Buyer, 'id' | 'buyerCustomId' | 'dateAdded'> = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    whatsapp: '',
    facebookUrl: '',
    linkedinUrl: '',
    website: '',
    amazonStoreUrl: '',
    country: 'United States',
    state: '',
    city: '',
    businessType: 'LLC',
    sellingModel: 'FBA',
    categories: ['Beauty & Personal Care'],
    interestedBrands: [],
    requiredProducts: '',
    purchasingBudget: 25000,
    preferredLocation: 'USA Nationwide',
    minProfitRequirement: 18,
    monthlyCapacity: 50000,
    currentSupplierStatus: '',
    additionalRequirements: '',
    leadSource: 'Facebook Groups',
    facebookGroupName: '',
    notes: '',
    status: 'New Lead',
    lastContactDate: new Date().toISOString().split('T')[0],
    nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);
  const [brandsInput, setBrandsInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Filtered Buyers
  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const matchesSearch =
        b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.buyerCustomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesModel = sellingModelFilter === 'all' || b.sellingModel === sellingModelFilter;
      const matchesCategory =
        categoryFilter === 'all' ||
        b.categories.some(c => c.toLowerCase().includes(categoryFilter.toLowerCase()));

      let matchesBudget = true;
      if (budgetFilter === 'under25k') matchesBudget = b.purchasingBudget < 25000;
      else if (budgetFilter === '25k-50k') matchesBudget = b.purchasingBudget >= 25000 && b.purchasingBudget <= 50000;
      else if (budgetFilter === 'over50k') matchesBudget = b.purchasingBudget > 50000;

      return matchesSearch && matchesStatus && matchesModel && matchesCategory && matchesBudget;
    });
  }, [buyers, searchTerm, statusFilter, categoryFilter, sellingModelFilter, budgetFilter]);

  // Check duplicate during form editing
  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    const exists = buyers.find(
      b => b.email.toLowerCase() === email.trim().toLowerCase() && (!editingBuyer || b.id !== editingBuyer.id)
    );
    if (exists) {
      setDuplicateWarning(`Warning: A buyer with email "${email}" already exists (${exists.companyName} - ${exists.buyerCustomId})`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingBuyer(null);
    setFormData(initialFormState);
    setBrandsInput('');
    setCategoriesInput('Beauty & Personal Care, Health & Household');
    setDuplicateWarning(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b: Buyer) => {
    setEditingBuyer(b);
    setFormData({
      contactName: b.contactName,
      companyName: b.companyName,
      email: b.email,
      phone: b.phone,
      whatsapp: b.whatsapp,
      facebookUrl: b.facebookUrl || '',
      linkedinUrl: b.linkedinUrl || '',
      website: b.website || '',
      amazonStoreUrl: b.amazonStoreUrl || '',
      country: b.country,
      state: b.state,
      city: b.city,
      businessType: b.businessType,
      sellingModel: b.sellingModel,
      categories: b.categories,
      interestedBrands: b.interestedBrands,
      requiredProducts: b.requiredProducts,
      purchasingBudget: b.purchasingBudget,
      preferredLocation: b.preferredLocation,
      minProfitRequirement: b.minProfitRequirement,
      monthlyCapacity: b.monthlyCapacity,
      currentSupplierStatus: b.currentSupplierStatus,
      additionalRequirements: b.additionalRequirements || '',
      leadSource: b.leadSource,
      facebookGroupName: b.facebookGroupName || '',
      notes: b.notes,
      status: b.status,
      lastContactDate: b.lastContactDate || '',
      nextFollowUpDate: b.nextFollowUpDate || ''
    });
    setBrandsInput(b.interestedBrands.join(', '));
    setCategoriesInput(b.categories.join(', '));
    setDuplicateWarning(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.contactName) {
      alert('Please fill out Company Name, Contact Name, and Email.');
      return;
    }

    const categoriesArray = categoriesInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    const brandsArray = brandsInput
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      categories: categoriesArray.length > 0 ? categoriesArray : ['General Wholesale'],
      interestedBrands: brandsArray
    };

    if (editingBuyer) {
      updateBuyer(editingBuyer.id, payload);
    } else {
      addBuyer(payload);
    }

    setIsFormOpen(false);
  };

  const handleExport = () => {
    const rows = buyers.map(b => ({
      BuyerID: b.buyerCustomId,
      Company: b.companyName,
      Contact: b.contactName,
      Email: b.email,
      Phone: b.phone,
      WhatsApp: b.whatsapp,
      AmazonStore: b.amazonStoreUrl || '',
      City: b.city,
      State: b.state,
      Country: b.country,
      Model: b.sellingModel,
      Categories: b.categories.join('; '),
      Brands: b.interestedBrands.join('; '),
      PurchasingBudget: b.purchasingBudget,
      MonthlyCapacity: b.monthlyCapacity,
      MinProfitReq: b.minProfitRequirement,
      Status: b.status,
      LeadSource: b.leadSource,
      DateAdded: b.dateAdded,
      NextFollowUp: b.nextFollowUpDate || ''
    }));
    exportToCsv(`WholesaleConnect_Buyers_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        alert('Could not parse CSV. Please ensure standard comma-separated format.');
        return;
      }

      const imported: Buyer[] = parsed.map((row, index) => ({
        id: `buy-import-${Date.now()}-${index}`,
        buyerCustomId: row['BuyerID'] || `BUY-${1050 + index}`,
        companyName: row['Company'] || row['companyName'] || 'Imported Seller',
        contactName: row['Contact'] || row['contactName'] || 'Wholesale Buyer',
        email: row['Email'] || row['email'] || `seller_${index}@import.com`,
        phone: row['Phone'] || row['phone'] || '',
        whatsapp: row['WhatsApp'] || row['whatsapp'] || '',
        amazonStoreUrl: row['AmazonStore'] || '',
        country: row['Country'] || 'United States',
        state: row['State'] || 'TX',
        city: row['City'] || 'Dallas',
        businessType: 'LLC',
        sellingModel: (row['Model'] as AmazonSellingModel) || 'FBA',
        categories: (row['Categories'] || 'General Wholesale').split(';').map(c => c.trim()),
        interestedBrands: (row['Brands'] || '').split(';').map(b => b.trim()).filter(Boolean),
        requiredProducts: '',
        purchasingBudget: Number(row['PurchasingBudget']) || 25000,
        preferredLocation: 'USA',
        minProfitRequirement: Number(row['MinProfitReq']) || 18,
        monthlyCapacity: Number(row['MonthlyCapacity']) || 50000,
        currentSupplierStatus: '',
        leadSource: row['LeadSource'] || 'CSV Import',
        notes: 'Imported via CSV',
        dateAdded: new Date().toISOString().split('T')[0],
        nextFollowUpDate: row['NextFollowUp'] || '',
        status: (row['Status'] as BuyerStatus) || 'Qualified'
      }));

      importBuyers(imported);
    };
    reader.readAsText(file);
  };

  const handleLogComm = () => {
    if (!selectedBuyer || !commNote) return;
    addCommunication({
      entityType: 'Buyer',
      entityId: selectedBuyer.id,
      entityName: selectedBuyer.companyName,
      communicationType: 'Follow-up',
      subject: `Follow-up on product sourcing requirements`,
      content: commNote,
      responseStatus: 'Pending',
      nextFollowUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
    });
    setCommNote('');
    setIsCommModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.buyersTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.buyersSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>

          {/* Import CSV */}
          <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{t.importCsv}</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          {/* Add Buyer */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBuyer}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, contact person, email, city, state, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Status: All</option>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Qualified">Qualified</option>
            <option value="Matching">Matching</option>
            <option value="Introduced">Introduced</option>
            <option value="Active Client">Active Client</option>
            <option value="Inactive">Inactive</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Model Filter */}
          <select
            value={sellingModelFilter}
            onChange={e => setSellingModelFilter(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Model: All</option>
            <option value="FBA">FBA</option>
            <option value="FBM">FBM</option>
            <option value="Both">Both (FBA+FBM)</option>
          </select>

          {/* Budget Filter */}
          <select
            value={budgetFilter}
            onChange={e => setBudgetFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Budget: All</option>
            <option value="under25k">Under $25k</option>
            <option value="25k-50k">$25k - $50k</option>
            <option value="over50k">Over $50k</option>
          </select>
        </div>

        {/* Quick Segmented Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Quick Filter:</span>
          {['all', 'Qualified', 'Matching', 'Active Client', 'New Lead'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Buyers' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Buyers Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Buyer & Company</th>
                <th className="py-3 px-4">Model & Location</th>
                <th className="py-3 px-4">Target Categories & Brands</th>
                <th className="py-3 px-4 text-right">Purchasing Budget</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">{t.noData}</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria or add a new Amazon seller.</p>
                  </td>
                </tr>
              ) : (
                filteredBuyers.map(b => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Buyer & Company */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{b.companyName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{b.buyerCustomId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{b.contactName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {b.email}
                      </div>
                    </td>

                    {/* Model & Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          {b.sellingModel}
                        </span>
                        <span>{b.businessType}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {b.city}, {b.state}
                      </div>
                    </td>

                    {/* Categories & Brands */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        {b.categories.join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Brands: {b.interestedBrands.length > 0 ? b.interestedBrands.join(', ') : 'Open to catalog'}
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        ${b.purchasingBudget.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Cap: ${b.monthlyCapacity.toLocaleString()}/mo
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'Active Client'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : b.status === 'Qualified'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : b.status === 'Matching'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : b.status === 'Contacted'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Next Follow Up */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {b.nextFollowUpDate || 'None scheduled'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedBuyer(b)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Buyer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${b.companyName}?`)) {
                              deleteBuyer(b.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Buyer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* VIEW BUYER DETAIL MODAL */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{selectedBuyer.buyerCustomId}</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedBuyer.companyName}</h2>
                <p className="text-slate-500">{selectedBuyer.contactName} · {selectedBuyer.city}, {selectedBuyer.state}, {selectedBuyer.country}</p>
              </div>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Business Email</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{selectedBuyer.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Phone / WhatsApp</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{selectedBuyer.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Amazon Selling Model</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{selectedBuyer.sellingModel} ({selectedBuyer.businessType})</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Purchasing Budget</span>
                <p className="font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                  ${selectedBuyer.purchasingBudget.toLocaleString()} (Cap: ${selectedBuyer.monthlyCapacity.toLocaleString()})
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Amazon Store Link</span>
              <p className="mt-1 font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                {selectedBuyer.amazonStoreUrl || 'Not provided'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Target Categories</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedBuyer.categories.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Interested Brands</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedBuyer.interestedBrands.length > 0 ? (
                  selectedBuyer.interestedBrands.map((b, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">Open to distributor line cards</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Product Specifications & Notes</span>
              <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedBuyer.notes || 'No specific notes recorded.'}
              </p>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedBuyer(null);
                  setActiveTab('matching');
                }}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Find Matching Suppliers</span>
              </button>

              <button
                onClick={() => setIsCommModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Log Communication</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK COMM LOG MODAL */}
      {isCommModalOpen && selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Log Note for {selectedBuyer.companyName}</h3>
              <button onClick={() => setIsCommModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={commNote}
              onChange={e => setCommNote(e.target.value)}
              placeholder="Record details of email, WhatsApp conversation, ungating status, or wholesale PO requirements..."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCommModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogComm}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BUYER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingBuyer ? `Edit Buyer: ${editingBuyer.companyName}` : 'Add New Amazon Wholesale Seller'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Prime Commerce LLC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="marcus@apexprime.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                    placeholder="+1 (512) 883-2911"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Amazon specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Amazon Storefront URL</label>
                  <input
                    type="url"
                    value={formData.amazonStoreUrl}
                    onChange={e => setFormData({ ...formData, amazonStoreUrl: e.target.value })}
                    placeholder="https://amazon.com/sp?seller=..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Fulfillment Model</label>
                  <select
                    value={formData.sellingModel}
                    onChange={e => setFormData({ ...formData, sellingModel: e.target.value as AmazonSellingModel })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="FBA">FBA (Fulfillment by Amazon)</option>
                    <option value="FBM">FBM (Merchant Fulfilled)</option>
                    <option value="Both">Both FBA & FBM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Structure</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                    placeholder="LLC / Inc / Sole Prop"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Financial parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Opening Purchasing Budget ($)</label>
                  <input
                    type="number"
                    value={formData.purchasingBudget}
                    onChange={e => setFormData({ ...formData, purchasingBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Monthly Capacity ($)</label>
                  <input
                    type="number"
                    value={formData.monthlyCapacity}
                    onChange={e => setFormData({ ...formData, monthlyCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Min Profit Requirement (%)</label>
                  <input
                    type="number"
                    value={formData.minProfitRequirement}
                    onChange={e => setFormData({ ...formData, minProfitRequirement: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Categories & Brands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Product Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={categoriesInput}
                    onChange={e => setCategoriesInput(e.target.value)}
                    placeholder="Beauty & Personal Care, Health & Household, Tools"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Interested Brands (comma-separated)</label>
                  <input
                    type="text"
                    value={brandsInput}
                    onChange={e => setBrandsInput(e.target.value)}
                    placeholder="CeraVe, Neutrogena, KONG, DeWalt"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Austin"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Texas"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as BuyerStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Matching">Matching</option>
                    <option value="Introduced">Introduced</option>
                    <option value="Active Client">Active Client</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Notes & Due Diligence</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Sales tax exemption certificate details, wire readiness, credit references..."
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
                  {editingBuyer ? 'Save Buyer Updates' : 'Add Amazon Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
