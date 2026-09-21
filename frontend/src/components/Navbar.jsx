import React, { useState } from 'react';
import { ArrowRight, Leaf, Database, Activity, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { fetchDataSourcesHealth } from '../api/client';

export default function Navbar({ activeTab, setActiveTab, apiHealthy = true }) {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [sourcesData, setSourcesData] = useState(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  const handleOpenSources = async () => {
    setShowSourcesModal(true);
    setSourcesLoading(true);
    try {
      const data = await fetchDataSourcesHealth();
      setSourcesData(data);
    } catch (e) {
      console.warn("Failed to fetch data sources status:", e);
    } finally {
      setSourcesLoading(false);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'recommender', label: 'New Analysis' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'howitworks', label: 'How It Works' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none" 
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                PACK<span className="text-emerald-600">AI</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal hidden sm:inline ml-2 pl-2 border-l border-slate-200">
                Food Packaging Decision Support
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & External Sources Health Status */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenSources}
              title={apiHealthy ? "Inspect External API Provenance & Health" : "Backend server is offline"}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                apiHealthy 
                  ? 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-800' 
                  : 'border-rose-200 bg-rose-50/50 text-rose-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{apiHealthy ? 'Data Sources' : 'Backend Offline'}</span>
            </button>

            {activeTab !== 'recommender' ? (
              <button
                type="button"
                onClick={() => setActiveTab('recommender')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Back to Overview
              </button>
            )}
          </div>
        </div>

        {/* Sources Health Modal */}
        {showSourcesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white max-w-lg w-full p-6 rounded-2xl border border-slate-200 space-y-4 shadow-float">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">External Data Provenance & Health</h3>
                    <p className="text-[11px] text-slate-500">Live connectivity & fallback hierarchy status</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSourcesModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sourcesLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <Activity className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Checking live external APIs...</span>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {sourcesData?.sources?.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s.name} <span className="text-[10px] text-slate-400 font-mono">({s.version})</span></span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {s.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{s.role}</p>
                      <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Fallback Hierarchy:</span>
                        <span className="font-medium text-slate-700">{s.active_fallback}</span>
                      </div>
                    </div>
                  ))}

                  <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Separation Principle:</strong> External APIs enrich nutritional/ambient data only. Polymer barrier standards (OTR, WVTR) are strictly determined by PackAI's internal engineering rule engine.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-1.5 border-t border-slate-100 space-x-1 no-scrollbar text-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
