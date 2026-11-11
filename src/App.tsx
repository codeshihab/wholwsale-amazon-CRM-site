/**
 * Wholesale Connect USA – Business Management System
 * B2B CRM for connecting Amazon Wholesale Sellers with Verified USA Distributors
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { BuyerManagement } from './components/buyers/BuyerManagement';
import { SupplierManagement } from './components/suppliers/SupplierManagement';
import { LeadResearchCenter } from './components/leads/LeadResearchCenter';
import { MatchingMatrix } from './components/matching/MatchingMatrix';
import { CommunicationCenter } from './components/communications/CommunicationCenter';
import { DealManagement } from './components/deals/DealManagement';
import { CommissionManagement } from './components/commissions/CommissionManagement';
import { TaskManager } from './components/tasks/TaskManager';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { DocumentVault } from './components/documents/DocumentVault';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { user, activeTab, theme } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* View Content Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'buyers' && <BuyerManagement />}
          {activeTab === 'suppliers' && <SupplierManagement />}
          {activeTab === 'leads' && <LeadResearchCenter />}
          {activeTab === 'matching' && <MatchingMatrix />}
          {activeTab === 'communications' && <CommunicationCenter />}
          {activeTab === 'deals' && <DealManagement />}
          {activeTab === 'commissions' && <CommissionManagement />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'reports' && <ReportsAnalytics />}
          {activeTab === 'documents' && <DocumentVault />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Quiet Professional Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Wholesale Connect USA · Amazon Wholesale B2B Referral Network
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Dhaka Operations: UTC+6</span>
            <span aria-hidden="true">·</span>
            <span>Referral Attribution Protected</span>
          </div>
        </footer>
      </div>

      {/* Global Modals and Alerts */}
      <AuthModal isOpen={!user || isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
