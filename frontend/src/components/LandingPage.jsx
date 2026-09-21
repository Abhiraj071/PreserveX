import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  Sparkles,
  FileText,
  Search,
  Thermometer,
  Layers,
  Award,
  Zap,
  TrendingUp,
  Cpu,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export default function LandingPage({ onStartRecommender, onOpenSimulator, onOpenKnowledgeBase }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const referenceExamples = [
    {
      food: "Potato Chips / Crisps",
      category: "Dry Snacks",
      type: "snacks",
      icon: "🥔",
      condition: "Ambient · 22°C · 55% RH",
      packaging: "Met-BOPP / CPP",
      packagingDesc: "Silver Barrier Foil Laminate",
      barrier: "High O₂ & Moisture Barrier",
      shelfLife: "180 days"
    },
    {
      food: "Fresh Apples",
      category: "Fresh Produce",
      type: "produce",
      icon: "🍎",
      condition: "Ambient · Vented Crates",
      packaging: "Perforated LDPE Film",
      packagingDesc: "Clear Punched Bag with Vents",
      barrier: "Breathable / Micro-Porous",
      shelfLife: "14 days"
    },
    {
      food: "Fresh Paneer",
      category: "Dairy & Chilled",
      type: "dairy",
      icon: "🧀",
      condition: "Chilled · 4°C · Cold Chain",
      packaging: "PA / PE Multilayer",
      packagingDesc: "Vacuum Barrier Pouch",
      barrier: "Airtight Hermetic Seal",
      shelfLife: "21 days"
    },
    {
      food: "Sliced White Bread",
      category: "Bakery",
      type: "bakery",
      icon: "🍞",
      condition: "Ambient · 22°C",
      packaging: "BOPP Monolayer",
      packagingDesc: "Clear Display Bag",
      barrier: "Moderate Moisture & Dust",
      shelfLife: "7 days"
    },
    {
      food: "Roasted Ground Coffee",
      category: "Beverages & Spices",
      type: "beverages",
      icon: "☕",
      condition: "Ambient · 20°C",
      packaging: "Triplex Foil Laminate",
      packagingDesc: "Aluminium High Barrier",
      barrier: "Total Light & Aroma Lock",
      shelfLife: "365 days"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Food Selection",
      desc: "Composition & aw",
      icon: Search,
      badge: "Biochemical",
      isPrimary: true
    },
    {
      step: "02",
      title: "Environment",
      desc: "Temp & humidity",
      icon: Thermometer,
      badge: "Logistics",
      isPrimary: true
    },
    {
      step: "03",
      title: "Requirements",
      desc: "OTR / WVTR limits",
      icon: ShieldCheck,
      badge: "Target Limits",
      isPrimary: true
    },
    {
      step: "04",
      title: "Candidate Match",
      desc: "Polymer search",
      icon: Layers,
      badge: "Knowledge Base",
      isPrimary: true
    },
    {
      step: "05",
      title: "Recommendation",
      desc: "Material & trade-offs",
      icon: Award,
      badge: "Prescription",
      isPrimary: true
    }
  ];

  const filteredExamples = selectedCategory === "all"
    ? referenceExamples
    : referenceExamples.filter(e => e.type === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* First Screen: Hero Section Centered to Fill the Viewport */}
      <section className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between items-center py-4 sm:py-6">
        <div className="w-full my-auto">
          {/* Hero Section Container with Seamless Matching Background */}
          <div className="relative">
            {/* Subtle ambient matching gradient glow behind container */}
            <div className="absolute -inset-x-3 -top-2 -bottom-4 bg-gradient-to-b from-emerald-100/50 via-teal-50/25 to-transparent rounded-2xl blur-lg -z-10 pointer-events-none" />

            <div 
              className="relative rounded-2xl overflow-hidden border border-emerald-200/80 shadow-md p-6 sm:py-8 sm:px-10 bg-gradient-to-br from-white/95 via-emerald-50/50 to-teal-50/30 backdrop-blur-md text-center max-w-3xl mx-auto"
            >
              {/* Subtle atmospheric accents */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-200/25 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-100/25 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/90 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Intelligent Food Packaging Decision Support</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Better packaging decisions,{' '}
                  <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    backed by data.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto font-normal">
                  Analyze food biochemical properties, storage environments, and target shelf life to prescribe compliant packaging materials and evaluate performance trade-offs.
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onStartRecommender}
                    className="btn-emerald inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-bold transition-all shadow-sm hover:scale-[1.01]"
                  >
                    <span>Start an analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenKnowledgeBase}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-900 text-sm font-semibold transition-all shadow-2xs"
                  >
                    <span>Browse Knowledge Base</span>
                  </button>
                </div>

                {/* Feature Highlights */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>First-Principles Barrier Physics</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Arrhenius Kinetic Modeling</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FSSAI & ASTM Compliant</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator for the next screen */}
        <button
          type="button"
          onClick={() => {
            const nextElem = document.getElementById('sequence-section');
            if (nextElem) nextElem.scrollIntoView({ behavior: 'smooth' });
          }}
          className="pt-2 pb-2 inline-flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer group select-none"
          title="Scroll down to explore"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors">
            Explore Analytical Workflow
          </span>
          <ChevronDown className="w-4 h-4 mt-0.5 animate-bounce text-emerald-600" />
        </button>
      </section>

      {/* Screen 2 & Beyond: Analytical Sequence & Subsequent Elements */}
      <div id="sequence-section" className="space-y-16 pt-10 pb-16">
        {/* Analytical Decision Sequence (Interactive Cards) */}
        <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Analytical Decision Sequence
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">5-Stage Methodology</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-1 ${s.isPrimary
                  ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${s.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {s.step}
                  </span>
                  <Icon className={`w-4 h-4 ${s.isPrimary ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-xs leading-snug">
                  {s.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reference Baselines Showcase Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Curated Reference Baselines</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                5 Samples
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirically verified benchmarks computed by the first-principles barrier engine.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'snacks', label: 'Snacks' },
              { id: 'produce', label: 'Produce' },
              { id: 'dairy', label: 'Dairy' },
              { id: 'bakery', label: 'Bakery' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${selectedCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Food Product</th>
                <th className="py-3 px-4">Storage Condition</th>
                <th className="py-3 px-4">Prescribed Packaging</th>
                <th className="py-3 px-4">Barrier Need</th>
                <th className="py-3 px-4">Target Life</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExamples.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                  onClick={onStartRecommender}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl shrink-0 p-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                        {row.icon}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
                          {row.food}
                        </span>
                        <span className="text-[11px] text-slate-400">{row.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.condition}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{row.packaging}</span>
                    <span className="text-[11px] text-slate-400">{row.packagingDesc}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-medium">
                      {row.barrier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ~{row.shelfLife}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 inline-flex items-center space-x-0.5 transition-transform">
                      <span>Analyze</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Principles / 3 Pillars as Rich Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Requirements Before Material
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform calculates exact physical barrier tolerances (OTR, WVTR, light, seal) rather than guessing polymer films blindly.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Data Provenance Transparency
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every chemical property carries clear origin tracking, distinguishing Open Food Facts API data from verified curated reference baselines.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Unified What-If Simulation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Test how elevated summer heat or humidity alters degradation kinetics and re-prescribes packaging structures using the same core logic.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
