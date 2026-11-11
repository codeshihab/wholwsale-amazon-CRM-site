import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Buyer,
  Supplier,
  Lead,
  Deal,
  Commission,
  TaskItem,
  CommunicationLog,
  DocumentItem,
  BusinessSettings,
  UserProfile,
  Language,
  Theme,
  BuyerSupplierMatch,
  PaymentRecord
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_BUYERS,
  INITIAL_SUPPLIERS,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_COMMISSIONS,
  INITIAL_TASKS,
  INITIAL_COMMUNICATIONS,
  INITIAL_DOCUMENTS
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface AppContextType {
  user: UserProfile | null;
  settings: BusinessSettings;
  language: Language;
  theme: Theme;
  t: typeof translations.en;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  
  // Auth
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string, businessName: string) => Promise<boolean>;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Buyers
  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, 'id' | 'buyerCustomId' | 'dateAdded'>) => void;
  updateBuyer: (id: string, updates: Partial<Buyer>) => void;
  deleteBuyer: (id: string) => void;
  importBuyers: (newBuyers: Buyer[]) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'supplierCustomId' | 'dateAdded'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  importSuppliers: (newSuppliers: Supplier[]) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'leadCustomId' | 'discoveryDate'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToBuyer: (leadId: string) => void;
  convertLeadToSupplier: (leadId: string) => void;

  // Matches
  matches: BuyerSupplierMatch[];
  saveMatch: (match: BuyerSupplierMatch) => void;

  // Communications
  communications: CommunicationLog[];
  addCommunication: (comm: Omit<CommunicationLog, 'id' | 'date'>) => void;
  deleteCommunication: (id: string) => void;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'dealCustomId' | 'createdAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // Commissions
  commissions: Commission[];
  addCommission: (comm: Omit<Commission, 'id' | 'commissionCustomId'>) => void;
  updateCommission: (id: string, updates: Partial<Commission>) => void;
  recordPayment: (commissionId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  deleteCommission: (id: string) => void;

  // Tasks
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;

  // Data Actions
  clearAllSampleData: () => void;
  loadDefaultSampleData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;

  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'wc_user',
  SETTINGS: 'wc_settings',
  BUYERS: 'wc_buyers',
  SUPPLIERS: 'wc_suppliers',
  LEADS: 'wc_leads',
  DEALS: 'wc_deals',
  COMMISSIONS: 'wc_commissions',
  TASKS: 'wc_tasks',
  COMMUNICATIONS: 'wc_communications',
  DOCUMENTS: 'wc_documents',
  MATCHES: 'wc_matches'
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  email: 'mdshihabhossen.dm@gmail.com',
  displayName: 'Shihab Hossen',
  role: 'owner',
  businessName: 'Wholesale Connect USA',
  phone: '+880 1712-345678',
  location: 'Dhaka, Bangladesh'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Settings
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguageState] = useState<Language>(settings.language || 'en');
  const [theme, setThemeState] = useState<Theme>(settings.theme || 'light');

  // Entities
  const [buyers, setBuyers] = useState<Buyer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUYERS);
    return saved ? JSON.parse(saved) : INITIAL_BUYERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [communications, setCommunications] = useState<CommunicationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMUNICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_COMMUNICATIONS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [matches, setMatches] = useState<BuyerSupplierMatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return saved ? JSON.parse(saved) : [];
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(buyers));
  }, [buyers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(communications));
  }, [communications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  // Handle Theme switching on document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    setSettings(prev => ({ ...prev, theme: t }));
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    showToast(language === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings updated successfully');
  };

  // Auth Operations
  const login = async (email: string): Promise<boolean> => {
    const loggedUser: UserProfile = {
      id: 'usr-1',
      email: email || 'mdshihabhossen.dm@gmail.com',
      displayName: email.split('@')[0] || 'Shihab Hossen',
      role: 'owner',
      businessName: settings.businessName || 'Wholesale Connect USA',
      phone: '+880 1712-345678',
      location: 'Dhaka, Bangladesh'
    };
    setUser(loggedUser);
    showToast(language === 'bn' ? 'সফলভাবে লগইন করেছেন' : 'Signed in successfully');
    return true;
  };

  const register = async (name: string, email: string, _pass: string, bName: string): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      displayName: name,
      role: 'owner',
      businessName: bName || 'Wholesale Connect USA',
      location: 'Dhaka, Bangladesh'
    };
    setUser(newUser);
    setSettings(prev => ({ ...prev, businessName: bName }));
    showToast(language === 'bn' ? 'অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে' : 'Account created successfully');
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast(language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Signed out');
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...profile });
      showToast(language === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
    }
  };

  // Buyer Operations
  const addBuyer = (buyerData: Omit<Buyer, 'id' | 'buyerCustomId' | 'dateAdded'>) => {
    const nextNum = 1000 + buyers.length + 1;
    const newBuyer: Buyer = {
      ...buyerData,
      id: `buy-${Date.now()}`,
      buyerCustomId: `BUY-${nextNum}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setBuyers(prev => [newBuyer, ...prev]);
    showToast(`Amazon seller ${newBuyer.companyName} added`);
  };

  const updateBuyer = (id: string, updates: Partial<Buyer>) => {
    setBuyers(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    showToast(language === 'bn' ? 'বায়ার রেকর্ড আপডেট হয়েছে' : 'Buyer record updated');
  };

  const deleteBuyer = (id: string) => {
    setBuyers(prev => prev.filter(b => b.id !== id));
    showToast(language === 'bn' ? 'বায়ার রেকর্ড মুছে ফেলা হয়েছে' : 'Buyer record deleted');
  };

  const importBuyers = (newBuyers: Buyer[]) => {
    setBuyers(prev => [...newBuyers, ...prev]);
    showToast(`Successfully imported ${newBuyers.length} buyers`);
  };

  // Supplier Operations
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'supplierCustomId' | 'dateAdded'>) => {
    const nextNum = 2000 + suppliers.length + 1;
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      supplierCustomId: `SUP-${nextNum}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    showToast(`Supplier ${newSupplier.companyName} added`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast(language === 'bn' ? 'সাপ্লায়ার তথ্য আপডেট হয়েছে' : 'Supplier updated');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    showToast(language === 'bn' ? 'সাপ্লায়ার মুছে ফেলা হয়েছে' : 'Supplier deleted');
  };

  const importSuppliers = (newSuppliers: Supplier[]) => {
    setSuppliers(prev => [...newSuppliers, ...prev]);
    showToast(`Successfully imported ${newSuppliers.length} suppliers`);
  };

  // Lead Operations
  const addLead = (leadData: Omit<Lead, 'id' | 'leadCustomId' | 'discoveryDate'>) => {
    const nextNum = 3000 + leads.length + 1;
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      leadCustomId: `LEAD-${nextNum}`,
      discoveryDate: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    showToast(`Discovered lead ${newLead.companyName} recorded`);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    showToast(language === 'bn' ? 'লিড আপডেট হয়েছে' : 'Lead updated');
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast(language === 'bn' ? 'লিড মুছে ফেলা হয়েছে' : 'Lead removed');
  };

  const convertLeadToBuyer = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    addBuyer({
      contactName: lead.contactName || 'Primary Contact',
      companyName: lead.companyName,
      email: lead.email || 'pending@contact.com',
      phone: lead.phone || '',
      whatsapp: lead.phone || '',
      country: 'United States',
      state: 'Texas',
      city: 'Austin',
      businessType: 'LLC',
      sellingModel: 'FBA',
      categories: lead.categories || ['General Merchandise'],
      interestedBrands: [],
      requiredProducts: lead.researchNotes || '',
      purchasingBudget: 25000,
      preferredLocation: 'USA Nationwide',
      minProfitRequirement: 18,
      monthlyCapacity: 50000,
      currentSupplierStatus: 'Converted from Lead Research',
      leadSource: lead.leadSource,
      notes: `Converted from Lead ID: ${lead.leadCustomId}. Source URL: ${lead.sourceUrl || 'N/A'}\n${lead.researchNotes}`,
      status: 'Qualified'
    });

    updateLead(leadId, { contactStatus: 'Converted' });
    showToast(`Lead converted to Buyer / Amazon Seller!`);
  };

  const convertLeadToSupplier = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    addSupplier({
      companyName: lead.companyName,
      contactName: lead.contactName || 'Wholesale Manager',
      email: lead.email || 'wholesale@supplier.com',
      phone: lead.phone || '',
      whatsapp: lead.phone || '',
      country: 'United States',
      state: 'New Jersey',
      city: 'Newark',
      companyType: 'Distributor',
      categories: lead.categories || ['Health & Household'],
      availableBrands: [],
      moq: 24,
      minimumOrderValue: 3000,
      shippingLocations: 'Continental USA',
      shippingTerms: 'FOB Warehouse',
      paymentTerms: 'Credit Card / Wire Transfer',
      amazonAcceptance: 'Yes',
      resellerProgram: 'Yes',
      invoiceAvailability: 'Official Commercial Invoices',
      verificationStatus: lead.verificationStatus === 'Verified' ? 'Verified' : 'Verification Pending',
      status: 'Qualified',
      leadSource: lead.leadSource,
      notes: `Converted from Lead ID: ${lead.leadCustomId}\n${lead.researchNotes}`
    });

    updateLead(leadId, { contactStatus: 'Converted' });
    showToast(`Lead converted to Wholesale Supplier!`);
  };

  // Matches
  const saveMatch = (match: BuyerSupplierMatch) => {
    setMatches(prev => {
      const idx = prev.findIndex(m => m.id === match.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = match;
        return copy;
      }
      return [match, ...prev];
    });
    showToast(`Match score ${match.scoreBreakdown.totalScore}% recorded`);
  };

  // Communications
  const addCommunication = (commData: Omit<CommunicationLog, 'id' | 'date'>) => {
    const newComm: CommunicationLog = {
      ...commData,
      id: `comm-${Date.now()}`,
      date: new Date().toISOString()
    };
    setCommunications(prev => [newComm, ...prev]);
    showToast(`Communication log recorded`);
  };

  const deleteCommunication = (id: string) => {
    setCommunications(prev => prev.filter(c => c.id !== id));
  };

  // Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'dealCustomId' | 'createdAt'>) => {
    const nextNum = 4000 + deals.length + 1;
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      dealCustomId: `DEAL-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    setDeals(prev => [newDeal, ...prev]);

    // If deal has commission agreement, auto-generate corresponding commission record
    if (newDeal.actualOrderValue > 0 || newDeal.estimatedOrderValue > 0) {
      const targetVal = newDeal.actualOrderValue || newDeal.estimatedOrderValue;
      const rate = settings.defaultCommissionRate || 3.0;
      const amount = Math.round((targetVal * rate) / 100);
      const nextCommNum = 5000 + commissions.length + 1;

      const newComm: Commission = {
        id: `com-${Date.now()}`,
        commissionCustomId: `COM-${nextCommNum}`,
        dealId: newDeal.id,
        dealCustomId: newDeal.dealCustomId,
        buyerName: newDeal.buyerCompany || newDeal.buyerName,
        supplierName: newDeal.supplierName,
        payer: 'Buyer',
        commissionType: 'Percentage',
        commissionRate: rate,
        orderValue: targetVal,
        commissionAmount: amount,
        paidAmount: 0,
        balanceRemaining: amount,
        currency: 'USD',
        agreementDate: new Date().toISOString().split('T')[0],
        expectedPaymentDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        paymentMethod: 'Wise / Wire Transfer',
        status: 'Pending',
        notes: `Auto-linked from Deal #${newDeal.dealCustomId}`,
        paymentHistory: []
      };
      setCommissions(prev => [newComm, ...prev]);
    }

    showToast(`Deal #${newDeal.dealCustomId} created and tracked!`);
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    showToast(language === 'bn' ? 'ডিল আপডেট হয়েছে' : 'Deal updated');
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    showToast(language === 'bn' ? 'ডিল মুছে ফেলা হয়েছে' : 'Deal removed');
  };

  // Commission Operations
  const addCommission = (commData: Omit<Commission, 'id' | 'commissionCustomId'>) => {
    const nextNum = 5000 + commissions.length + 1;
    const newCommission: Commission = {
      ...commData,
      id: `com-${Date.now()}`,
      commissionCustomId: `COM-${nextNum}`
    };
    setCommissions(prev => [newCommission, ...prev]);
    showToast(`Commission #${newCommission.commissionCustomId} recorded`);
  };

  const updateCommission = (id: string, updates: Partial<Commission>) => {
    setCommissions(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    showToast(language === 'bn' ? 'কমিশন রেকর্ড আপডেট হয়েছে' : 'Commission updated');
  };

  const recordPayment = (commissionId: string, payment: Omit<PaymentRecord, 'id'>) => {
    const comm = commissions.find(c => c.id === commissionId);
    if (!comm) return;

    const newPaymentRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`
    };

    const newPaidAmount = comm.paidAmount + payment.amount;
    const newBalance = Math.max(0, comm.commissionAmount - newPaidAmount);
    const newStatus = newBalance === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : comm.status;

    updateCommission(commissionId, {
      paidAmount: newPaidAmount,
      balanceRemaining: newBalance,
      status: newStatus,
      actualPaymentDate: newBalance === 0 ? payment.date : comm.actualPaymentDate,
      paymentHistory: [...comm.paymentHistory, newPaymentRecord]
    });

    showToast(`Payment of $${payment.amount.toLocaleString()} recorded! Remaining balance: $${newBalance.toLocaleString()}`);
  };

  const deleteCommission = (id: string) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
    showToast(language === 'bn' ? 'কমিশন মুছে ফেলা হয়েছে' : 'Commission record deleted');
  };

  // Task Operations
  const addTask = (taskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Task added to schedule`);
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(language === 'bn' ? 'কাজ মুছে ফেলা হয়েছে' : 'Task removed');
  };

  // Document Operations
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadDate'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    showToast(`Document ${newDoc.fileName} uploaded to vault`);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast(`Document removed`);
  };

  // Data Actions
  const clearAllSampleData = () => {
    setBuyers([]);
    setSuppliers([]);
    setLeads([]);
    setDeals([]);
    setCommissions([]);
    setTasks([]);
    setCommunications([]);
    setDocuments([]);
    setMatches([]);
    showToast(language === 'bn' ? 'সকল নমুনা ডাটা পরিষ্কার করা হয়েছে' : 'All sample records cleared. Database is ready for live entries.');
  };

  const loadDefaultSampleData = () => {
    setBuyers(INITIAL_BUYERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setLeads(INITIAL_LEADS);
    setDeals(INITIAL_DEALS);
    setCommissions(INITIAL_COMMISSIONS);
    setTasks(INITIAL_TASKS);
    setCommunications(INITIAL_COMMUNICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    showToast(language === 'bn' ? 'ডেমো ডাটা সফলভাবে পুনরুদ্ধার হয়েছে' : 'Sample records restored.');
  };

  const exportDatabaseJson = () => {
    const data = {
      exportDate: new Date().toISOString(),
      business: settings.businessName,
      buyers,
      suppliers,
      leads,
      deals,
      commissions,
      tasks,
      communications,
      documents
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `WholesaleConnectUSA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast(`Full JSON database export generated`);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.buyers) setBuyers(parsed.buyers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.leads) setLeads(parsed.leads);
      if (parsed.deals) setDeals(parsed.deals);
      if (parsed.commissions) setCommissions(parsed.commissions);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.communications) setCommunications(parsed.communications);
      if (parsed.documents) setDocuments(parsed.documents);
      showToast('Database successfully restored from backup file');
      return true;
    } catch {
      showToast('Invalid backup JSON format', 'error');
      return false;
    }
  };

  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        language,
        theme,
        t,
        activeTab,
        setActiveTab,
        setLanguage,
        setTheme,
        updateSettings,
        login,
        logout,
        register,
        updateProfile,
        buyers,
        addBuyer,
        updateBuyer,
        deleteBuyer,
        importBuyers,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        importSuppliers,
        leads,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToBuyer,
        convertLeadToSupplier,
        matches,
        saveMatch,
        communications,
        addCommunication,
        deleteCommunication,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        commissions,
        addCommission,
        updateCommission,
        recordPayment,
        deleteCommission,
        tasks,
        addTask,
        updateTask,
        toggleTaskCompleted,
        deleteTask,
        documents,
        addDocument,
        deleteDocument,
        clearAllSampleData,
        loadDefaultSampleData,
        exportDatabaseJson,
        importDatabaseJson,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
