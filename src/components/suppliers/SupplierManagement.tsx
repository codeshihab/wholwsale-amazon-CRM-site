import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierType, SupplierVerificationStatus, SupplierPipelineStatus, TriState } from '../../types';
import { exportToCsv, parseCsv } from '../../utils/csv';
import {
  Building2,
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
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Package,
  MessageSquare
} from 'lucide-react';

export const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, importSuppliers, addCommunication, t, language, setActiveTab } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [pipelineFilter, setPipelineFilter] = useState<string>('all');
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>('all');
  const [amazonAcceptanceFilter, setAmazonAcceptanceFilter] = useState<string>('all');

  // Modals
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const initialFormState: Omit<Supplier, 'id' | 'supplierCustomId' | 'dateAdded'> = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    facebookPage: '',
    linkedinUrl: '',
    country: 'United States',
    state: '',
    city: '',
    companyType: 'Distributor',
    categories: ['Beauty & Personal Care'],
    availableBrands: [],
    catalogUrl: '',
    priceListUrl: '',
    moq: 24,
    minimumOrderValue: 3500,
    shippingLocations: 'Continental USA',
    shippingTerms: 'FOB Warehouse, Free Freight over $6,000',
    paymentTerms: 'Credit Card, Wire Transfer, ACH',
    amazonAcceptance: 'Yes',
    resellerProgram: 'Yes',
    authorizationDocuments: '',
    invoiceAvailability: 'Official Itemized Commercial Invoices',
    verificationStatus: 'Verified',
    status: 'Active Supplier',
    leadSource: 'Thomasnet',
    contactDate: new Date().toISOString().split('T')[0],
    nextFollowUpDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categoriesInput, setCategoriesInput] = useState('');
  const [brandsInput, setBrandsInput] = useState('');

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch =
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplierCustomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.availableBrands.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesVerification = verificationFilter === 'all' || s.verificationStatus === verificationFilter;
      const matchesPipeline = pipelineFilter === 'all' || s.status === pipelineFilter;
      const matchesType = companyTypeFilter === 'all' || s.companyType === companyTypeFilter;
      const matchesAmazon = amazonAcceptanceFilter === 'all' || s.amazonAcceptance === amazonAcceptanceFilter;

      return matchesSearch && matchesVerification && matchesPipeline && matchesType && matchesAmazon;
    });
  }, [suppliers, searchTerm, verificationFilter, pipelineFilter, companyTypeFilter, amazonAcceptanceFilter]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(initialFormState);
    setCategoriesInput('Beauty & Personal Care, Health & Household');
    setBrandsInput('CeraVe, Neutrogena, Dove');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      companyName: s.companyName,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      whatsapp: s.whatsapp,
      website: s.website || '',
      facebookPage: s.facebookPage || '',
      linkedinUrl: s.linkedinUrl || '',
      country: s.country,
      state: s.state,
      city: s.city,
      companyType: s.companyType,
      categories: s.categories,
      availableBrands: s.availableBrands,
      catalogUrl: s.catalogUrl || '',
      priceListUrl: s.priceListUrl || '',
      moq: s.moq,
      minimumOrderValue: s.minimumOrderValue,
      shippingLocations: s.shippingLocations,
      shippingTerms: s.shippingTerms,
      paymentTerms: s.paymentTerms,
      amazonAcceptance: s.amazonAcceptance,
      resellerProgram: s.resellerProgram,
      authorizationDocuments: s.authorizationDocuments || '',
      invoiceAvailability: s.invoiceAvailability,
      verificationStatus: s.verificationStatus,
      status: s.status,
      leadSource: s.leadSource,
      contactDate: s.contactDate || '',
      nextFollowUpDate: s.nextFollowUpDate || '',
      notes: s.notes
    });
    setCategoriesInput(s.categories.join(', '));
    setBrandsInput(s.availableBrands.join(', '));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.contactName) {
      alert('Please fill out Company Name, Contact Name, and Email.');
      return;
    }

    const categoriesArray = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);
    const brandsArray = brandsInput.split(',').map(b => b.trim()).filter(Boolean);

    const payload = {
      ...formData,
      categories: categoriesArray.length > 0 ? categoriesArray : ['General Wholesale'],
      availableBrands: brandsArray
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, payload);
    } else {
      addSupplier(payload);
    }
    setIsFormOpen(false);
  };

  const handleExport = () => {
    const rows = suppliers.map(s => ({
      SupplierID: s.supplierCustomId,
      Company: s.companyName,
      Contact: s.contactName,
      Email: s.email,
      Phone: s.phone,
      WhatsApp: s.whatsapp,
      Website: s.website || '',
      Type: s.companyType,
      City: s.city,
      State: s.state,
      Country: s.country,
      Categories: s.categories.join('; '),
      Brands: s.availableBrands.join('; '),
      MOQ: s.moq,
      MOV: s.minimumOrderValue,
      AmazonAcceptance: s.amazonAcceptance,
      ResellerProgram: s.resellerProgram,
      VerificationStatus: s.verificationStatus,
      PipelineStatus: s.status,
      InvoiceAvailability: s.invoiceAvailability,
      LeadSource: s.leadSource
    }));
    exportToCsv(`WholesaleConnect_Suppliers_${new Date().toISOString().split('T')[0]}`, rows);
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
        alert('Could not parse CSV.');
        return;
      }

      const imported: Supplier[] = parsed.map((row, index) => ({
        id: `sup-import-${Date.now()}-${index}`,
        supplierCustomId: row['SupplierID'] || `SUP-${2050 + index}`,
        companyName: row['Company'] || 'Imported Wholesale Dist',
        contactName: row['Contact'] || 'Sales Manager',
        email: row['Email'] || `supplier_${index}@wholesale.com`,
        phone: row['Phone'] || '',
        whatsapp: row['WhatsApp'] || '',
        website: row['Website'] || '',
        country: row['Country'] || 'United States',
        state: row['State'] || 'NJ',
        city: row['City'] || 'Newark',
        companyType: (row['Type'] as SupplierType) || 'Distributor',
        categories: (row['Categories'] || 'General').split(';').map(c => c.trim()),
        availableBrands: (row['Brands'] || '').split(';').map(b => b.trim()).filter(Boolean),
        moq: Number(row['MOQ']) || 24,
        minimumOrderValue: Number(row['MOV']) || 3000,
        shippingLocations: 'Continental USA',
        shippingTerms: 'FOB Warehouse',
        paymentTerms: 'Credit Card / Wire',
        amazonAcceptance: (row['AmazonAcceptance'] as TriState) || 'Yes',
        resellerProgram: (row['ResellerProgram'] as TriState) || 'Yes',
        invoiceAvailability: row['InvoiceAvailability'] || 'Itemized Invoices',
        verificationStatus: (row['VerificationStatus'] as SupplierVerificationStatus) || 'Verified',
        status: (row['PipelineStatus'] as SupplierPipelineStatus) || 'Active Supplier',
        leadSource: row['LeadSource'] || 'CSV Import',
        dateAdded: new Date().toISOString().split('T')[0],
        notes: 'Imported via CSV batch'
      }));

      importSuppliers(imported);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t.suppliersTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.suppliersSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>

          <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{t.importCsv}</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by supplier name, contact, brands carried, state, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Verification Status */}
          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Verification: All</option>
            <option value="Verified">Verified Only</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Not Verified">Not Verified</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Amazon Acceptance */}
          <select
            value={amazonAcceptanceFilter}
            onChange={e => setAmazonAcceptanceFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Amazon Policy: All</option>
            <option value="Yes">Amazon Allowed (Yes)</option>
            <option value="No">Amazon Restricted (No)</option>
            <option value="Unknown">Policy Unknown</option>
          </select>

          {/* Type Filter */}
          <select
            value={companyTypeFilter}
            onChange={e => setCompanyTypeFilter(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Type: All</option>
            <option value="Distributor">Distributor</option>
            <option value="Brand">Brand</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Wholesaler">Wholesaler</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Supplier & Location</th>
                <th className="py-3 px-4">Type & Verification</th>
                <th className="py-3 px-4">Available Brands & Catalog</th>
                <th className="py-3 px-4 text-right">MOQ & MOV</th>
                <th className="py-3 px-4">Amazon Seller Status</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">{t.noData}</p>
                    <p className="text-xs mt-1">No wholesale suppliers match your current filter settings.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Company & Location */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.companyName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{s.supplierCustomId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{s.city}, {s.state}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {s.contactName} ({s.email})
                      </div>
                    </td>

                    {/* Type & Verification */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{s.companyType}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {s.verificationStatus === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Legit
                          </span>
                        ) : s.verificationStatus === 'Verification Pending' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Unverified</span>
                        )}
                      </div>
                    </td>

                    {/* Brands */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-[11px] text-slate-900 dark:text-slate-100 font-medium truncate">
                        {s.availableBrands.length > 0 ? s.availableBrands.join(', ') : 'Broad Catalog Lines'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {s.categories.join(', ')}
                      </div>
                      {s.catalogUrl && (
                        <a
                          href={s.catalogUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Catalog Link</span>
                        </a>
                      )}
                    </td>

                    {/* MOQ & MOV */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        MOV: ${s.minimumOrderValue.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        MOQ: {s.moq} units
                      </div>
                    </td>

                    {/* Amazon Policy */}
                    <td className="py-3 px-4">
                      {s.amazonAcceptance === 'Yes' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Amazon Approved
                        </span>
                      ) : s.amazonAcceptance === 'No' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          Amazon Restricted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600">
                          Policy Unknown
                        </span>
                      )}
                    </td>

                    {/* Pipeline Status */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSupplier(s)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Supplier Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete supplier ${s.companyName}?`)) {
                              deleteSupplier(s.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Supplier"
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

      {/* VIEW SUPPLIER DETAIL MODAL */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedSupplier.supplierCustomId}</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedSupplier.companyName}</h2>
                <p className="text-slate-500">{selectedSupplier.companyType} · {selectedSupplier.city}, {selectedSupplier.state}, {selectedSupplier.country}</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Contact Person & Email</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedSupplier.contactName} ({selectedSupplier.email})
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Phone / WhatsApp</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{selectedSupplier.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Minimum Order Value (MOV)</span>
                <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                  ${selectedSupplier.minimumOrderValue.toLocaleString()} (MOQ: {selectedSupplier.moq} units)
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Amazon Reseller Policy</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                  Accepts Amazon Sellers: <span className="font-bold">{selectedSupplier.amazonAcceptance}</span>
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Invoice & Ungating Eligibility</span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {selectedSupplier.invoiceAvailability || 'Standard commercial invoices'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Brands Carried in Stock</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSupplier.availableBrands.map((b, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Shipping Terms</span>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">{selectedSupplier.shippingTerms}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Methods Accepted</span>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">{selectedSupplier.paymentTerms}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Due Diligence Notes</span>
              <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedSupplier.notes || 'No notes on file.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedSupplier(null);
                  setActiveTab('matching');
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Match with Amazon Buyers
              </button>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SUPPLIER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingSupplier ? `Edit Supplier: ${editingSupplier.companyName}` : 'Add Wholesale Supplier / Distributor'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. NorthEast Wholesale Distribution Corp"
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
                    placeholder="e.g. Robert Sterling"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@northeastdist.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                    placeholder="+1 (201) 843-9000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Type, Verification, and Amazon Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company Type</label>
                  <select
                    value={formData.companyType}
                    onChange={e => setFormData({ ...formData, companyType: e.target.value as SupplierType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Distributor">Distributor</option>
                    <option value="Brand">Brand</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Verification Status</label>
                  <select
                    value={formData.verificationStatus}
                    onChange={e => setFormData({ ...formData, verificationStatus: e.target.value as SupplierVerificationStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Verified">Verified (EIN & Legitimacy confirmed)</option>
                    <option value="Verification Pending">Verification Pending</option>
                    <option value="Not Verified">Not Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Amazon Seller Policy</label>
                  <select
                    value={formData.amazonAcceptance}
                    onChange={e => setFormData({ ...formData, amazonAcceptance: e.target.value as TriState })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Yes">Yes (Amazon sellers permitted)</option>
                    <option value="No">No (Amazon sellers strictly banned)</option>
                    <option value="Unknown">Unknown (Policy to be verified)</option>
                  </select>
                </div>
              </div>

              {/* Order Minimums & Invoices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Minimum Order Value ($)</label>
                  <input
                    type="number"
                    value={formData.minimumOrderValue}
                    onChange={e => setFormData({ ...formData, minimumOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Minimum Order Qty (units)</label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={e => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Invoice Standard</label>
                  <input
                    type="text"
                    value={formData.invoiceAvailability}
                    onChange={e => setFormData({ ...formData, invoiceAvailability: e.target.value })}
                    placeholder="Brand Direct Itemized Invoices"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Brands & Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Available Brands (comma-separated)</label>
                  <input
                    type="text"
                    value={brandsInput}
                    onChange={e => setBrandsInput(e.target.value)}
                    placeholder="CeraVe, Dove, Neutrogena, L'Oreal"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={categoriesInput}
                    onChange={e => setCategoriesInput(e.target.value)}
                    placeholder="Beauty & Personal Care, Health & Household"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Catalog URL & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Catalog PDF / Link</label>
                  <input
                    type="url"
                    value={formData.catalogUrl}
                    onChange={e => setFormData({ ...formData, catalogUrl: e.target.value })}
                    placeholder="https://northeastdist.com/catalog.pdf"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://northeastdist.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Newark"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="New Jersey"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Pipeline Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as SupplierPipelineStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Active Supplier">Active Supplier</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Notes & Due Diligence Record</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Verification details, warehouse FOB specifics, sales representative communication..."
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
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {editingSupplier ? 'Save Supplier Updates' : 'Add Wholesale Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
