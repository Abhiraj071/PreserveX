import React from 'react';
import { 
  Cpu, 
  Database, 
  Workflow, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Sliders, 
  Leaf, 
  Code
} from 'lucide-react';

export default function ArchitectureInfo() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="glass-panel p-8 rounded-3xl border border-brand-500/30 text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-950 text-brand-300 border border-brand-700/60 inline-block">
          PreserveX Intelligent Decision Support Platform
        </span>
        <h2 className="text-3xl font-extrabold text-white">
          AI-Based Intelligent Food Packaging Decision-Support System
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          "The user tells us what food they want to package and the conditions it will face; our system determines what packaging is suitable and explains why."
        </p>
      </div>

      {/* 3 Core Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            1. Hybrid AI Packaging Engine
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Combines known physical-chemical laws (Arrhenius $Q_{10}$, water activity sorption, lipid oxidation, produce respiration quotient) with a Scikit-learn multi-output Random Forest model.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-700/60 flex items-center justify-center text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">
            2. Dynamic What-If Simulator
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Users can drag Temperature (0-45°C), Humidity (20-95%), and Shelf-life sliders to prove recommendations are condition-dependent, not static lookups.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            3. Circularity & Cost Analytics
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-Criteria Decision Analysis (MCDA) balances barrier protection, material cost ($/m²), carbon footprint, and recyclability grades (A+, A, Compostable).
          </p>
        </div>
      </div>

      {/* Data Flow & External API Strategy */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-sky-400" />
          <span>External API Strategy & Data Provenance Handling</span>
        </h3>
        
        <p className="text-xs text-slate-300 leading-relaxed">
          Because typical food users do not know technical properties (e.g. moisture %, pH, water activity $a_w$, or respiration rate), our system supplements user input using external reference APIs while explicitly tracking data provenance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-brand-300">Open Food Facts API</span>
            <p className="text-[11px] text-slate-400">
              Live product lookup, barcode identification, nutrient mass balance (fats, moisture, proteins), ingredients, and existing packaging tags.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-sky-300">FAOSTAT / USDA Reference</span>
            <p className="text-[11px] text-slate-400">
              Commodity-level biological baselines for fresh produce respiration, perishability guidelines, and agricultural metrics.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-teal-300">Curated Knowledge Base</span>
            <p className="text-[11px] text-slate-400">
              Engineering database of 16+ industrial polymer films with verified OTR, WVTR, thickness, sealability, and cost metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Pitch Card */}
      <div className="glass-panel p-6 rounded-3xl border border-teal-500/40 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
          <Code className="w-4 h-4" />
          <span>Technical Architecture Summary</span>
        </div>
        <h4 className="text-sm font-bold text-white">
          "What technologies are you using?"
        </h4>
        <blockquote className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
          “We are building a React-based web application with FastAPI and Python on the backend. The intelligence layer uses a hybrid Rule Engine and ML models such as Scikit-learn and XGBoost, with PostgreSQL as our database. Since our initial dataset is limited, we supplement our food data using sources such as Open Food Facts, FAOSTAT and USDA FoodData Central, while maintaining our own validated packaging knowledge base.”
        </blockquote>
      </div>
    </div>
  );
}
