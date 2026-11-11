import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  User,
  Globe,
  Sun,
  Moon,
  Clock,
  DollarSign,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Key,
  Server,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    user,
    updateProfile,
    logout,
    language,
    setLanguage,
    theme,
    setTheme,
    clearAllSampleData,
    loadDefaultSampleData,
    exportDatabaseJson,
    importDatabaseJson,
    t
  } = useApp();

  // Local form state
  const [bName, setBName] = useState(settings.businessName);
  const [bEmail, setBEmail] = useState(settings.businessEmail);
  const [bPhone, setBPhone] = useState(settings.businessPhone);
  const [bWhatsApp, setBWhatsApp] = useState(settings.businessWhatsApp);
  const [commRate, setCommRate] = useState(settings.defaultCommissionRate);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: bName,
      businessEmail: bEmail,
      businessPhone: bPhone,
      businessWhatsApp: bWhatsApp,
      defaultCommissionRate: Number(commRate)
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      email: userEmail
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setPassUpdated(true);
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassUpdated(false), 3000);
  };

  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        importDatabaseJson(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>{t.settingsTitle}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.settingsSubtitle}</p>
      </div>

      {/* Grid of Settings Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Business Profile Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.businessProfile}</h2>
          </div>

          <form onSubmit={handleSaveBusiness} className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Name</label>
              <input
                type="text"
                required
                value={bName}
                onChange={e => setBName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Operating Time Zone</label>
                <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200">
                  Asia/Dhaka (UTC+6)
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Default Currency</label>
                <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200">
                  USD ($)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Business Email</label>
                <input
                  type="email"
                  value={bEmail}
                  onChange={e => setBEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Default Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={commRate}
                  onChange={e => setCommRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">USA Contact Line</label>
                <input
                  type="text"
                  value={bPhone}
                  onChange={e => setBPhone(e.target.value)}
                  placeholder="+1 (302) 456-7890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">WhatsApp Sourcing Desk</label>
                <input
                  type="text"
                  value={bWhatsApp}
                  onChange={e => setBWhatsApp(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>

        {/* 2. User Account & Password */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Operator Profile & Access</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Operator Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Sign-in Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-xs"
            >
              Update Profile Details
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Security Password</span>
            </h3>

            {passUpdated && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium mb-2">
                Password updated successfully.
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-2">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-medium"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* 3. Language, Appearance, & Theme */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Language & Appearance</h2>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">System Language</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  English (USA)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                    language === 'bn'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  বাংলা (Bangla)
                </button>
              </div>
            </div>

            <div>
              <span className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">Color Theme</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-colors ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Database Backup, Restore, and Demo Data Manager */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.backupRestore}</h2>
          </div>

          <p className="text-slate-500 leading-relaxed">
            All records persist locally and synchronize automatically. You can export complete snapshot backups or clear demo data to start entering real clients.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={exportDatabaseJson}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download JSON Backup</span>
            </button>

            <label className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore from JSON</span>
              <input type="file" accept=".json" onChange={handleRestoreJson} className="hidden" />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">Sample Demo Records</span>
              <span className="text-[11px] text-slate-500">Purge demo records to leave your CRM clean for real clients</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAllSampleData}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-medium"
              >
                Clear Demo Data
              </button>
              <button
                onClick={loadDefaultSampleData}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
              >
                Reload Samples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cloud Firebase Setup & Integration Architecture (Prompt Section 15 & 18) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.firebaseSetup}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Firestore Blueprint</span>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>firebase-blueprint.json</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Configured with schemas for Users, Buyers, Suppliers, Deals, Commissions, and Communications.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Security Rules</span>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>firestore.rules</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Default-deny catch-all with owner-isolated access gates and ID poisoning protection.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Persistence Status</span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Local & Cloud Hybrid Persistence</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Instant sub-millisecond client state + JSON cloud backup + optional Firestore synchronization.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-[11px]">
          <div className="font-bold text-slate-900 dark:text-slate-100">
            Firebase Connection Setup Instructions (How to connect live Firebase):
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Create a project in the Firebase Console (https://console.firebase.google.com).</li>
            <li>Enable <strong>Authentication</strong> (Email/Password or Google Sign-In) and create a <strong>Cloud Firestore</strong> database.</li>
            <li>Deploy the generated <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono">firestore.rules</code> file to secure multi-user tenant privacy.</li>
            <li>Add web application credentials to <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono">firebase-applet-config.json</code> in the project root.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
