import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  GitCompare,
  MessageSquare,
  Handshake,
  DollarSign,
  CheckSquare,
  BarChart3,
  FolderLock,
  Settings,
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, t, buyers, suppliers, deals, commissions, tasks } = useApp();

  const pendingCommissions = commissions.filter(c => c.status === 'Pending' || c.status === 'Due').length;
  const activeDealsCount = deals.filter(d => d.dealStatus !== 'Deal Completed' && d.dealStatus !== 'Cancelled').length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'buyers', label: t.navBuyers, icon: Users, count: buyers.length },
    { id: 'suppliers', label: t.navSuppliers, icon: Building2, count: suppliers.length },
    { id: 'leads', label: t.navLeads, icon: Compass },
    { id: 'matching', label: t.navMatching, icon: GitCompare, highlight: true },
    { id: 'communications', label: t.navCommunications, icon: MessageSquare },
    { id: 'deals', label: t.navDeals, icon: Handshake, count: activeDealsCount },
    { id: 'commissions', label: t.navCommissions, icon: DollarSign, count: pendingCommissions > 0 ? pendingCommissions : undefined },
    { id: 'tasks', label: t.navTasks, icon: CheckSquare, count: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'reports', label: t.navReports, icon: BarChart3 },
    { id: 'documents', label: t.navDocuments, icon: FolderLock },
    { id: 'settings', label: t.navSettings, icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-blue-400/20">
              WC
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Wholesale Connect</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">USA</span>
              </div>
              <div className="text-[10px] text-slate-400">B2B Referral System</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-blue-950 text-blue-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Business Safeguard Notice */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Referral Attribution Protected</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Written consent verified prior to introductions. All commission agreements logged.
          </p>
        </div>
      </aside>
    </>
  );
};
