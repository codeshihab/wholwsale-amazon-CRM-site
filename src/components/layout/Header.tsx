import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Globe,
  Sun,
  Moon,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Database
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, settings, language, setLanguage, theme, setTheme, logout, setActiveTab, t } = useApp();
  const [dhakaTime, setDhakaTime] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setDhakaTime(formatter.format(now));
      } catch {
        setDhakaTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left zone: Mobile toggle & Breadcrumb / Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{settings.businessName}</span>
          <span aria-hidden="true">·</span>
          <span>Amazon Wholesale CRM</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-blue-400">
            <Clock className="w-3.5 h-3.5" />
            Dhaka {dhakaTime}
          </span>
        </div>
      </div>

      {/* Right zone: Quick actions, Search, Language, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Match / Deal Button */}
        <button
          onClick={() => setActiveTab('matching')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? 'ম্যাচ ও ডিল খুঁজুন' : 'New Match / Deal'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Switch Language / ভাষা পরিবর্তন"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">{language === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* User Account / Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'SH'}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {user?.displayName || 'Shihab Hossen'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {user?.role || 'Owner'}
              </div>
            </div>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Dhaka, Bangladesh</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setUserMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>{t.businessProfile}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setUserMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Database className="w-4 h-4 text-slate-400" />
                <span>{t.backupRestore}</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
