import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HowItWorks({ onStartAnalysis }) {
  const stages = [
    {
      num: "01",
      name: "Food Identification & Composition",
      desc: "User selects a target food product or scans a barcode. The platform retrieves biochemical properties (moisture, fat, pH, water activity, and respiration dynamics) using Open Food Facts and curated baseline databases."
    },
    {
      num: "02",
      name: "Environmental Exposure Definition",
      desc: "Specifies expected storage temperature, relative humidity, planned distribution transit duration, and handling logistics (road, reefer, ocean, air)."
    },
    {
      num: "03",
      name: "Data Enrichment & Source Transparency",
      desc: "Gaps in product composition are transparently resolved with explicit provenance tracking (distinguishing API lookups, curated references, and empirical derivations)."
    },
    {
      num: "04",
      name: "Packaging Requirements Stage",
      desc: "Crucial intermediate determination: Before selecting any packaging material, the engine first calculates the physical performance levels required (e.g. Oxygen Barrier: HIGH, Moisture: HIGH, Sealability: HERMETIC)."
    },
    {
      num: "05",
      name: "Curated Knowledge Base Query",
      desc: "Candidate materials are queried from the verified packaging database containing measured empirical coefficients (OTR, WVTR, thickness, tensile strength, sealability, and recyclability grades)."
    },
    {
      num: "06",
      name: "Scientific Gating + ML Scoring",
      desc: "First-principles scientific rules filter out biological hazards (such as anaerobic rotting in respiring produce). The machine learning ensemble then evaluates multi-criteria compatibility across barrier, shelf-life fit, cost, and circularity."
    },
    {
      num: "07",
      name: "Recommendation & Trade-off Presentation",
      desc: "Generates the optimal primary packaging structure, overall compatibility score, concise scientific rationale, viable alternatives, and an exportable executive PDF dossier."
    },
    {
      num: "08",
      name: "Dynamic What-If Stress Testing",
      desc: "Parameters can be adjusted in real time. Arrhenius degradation kinetics recalculate dynamically, demonstrating how elevated heat or humidity shifts required barrier levels and alters packaging prescriptions."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 sm:py-8">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          Decision Support Methodology
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          How PackAI Evaluates Packaging
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          The platform follows an 8-stage decision pipeline that bridges food biochemical physiology with material barrier engineering.
        </p>
      </div>

      {/* 8-Stage Minimal List */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-subtle">
        {stages.map((st) => (
          <div key={st.num} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
            <span className="font-mono text-xs font-bold text-emerald-800 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 shrink-0">
              STAGE {st.num}
            </span>
            <div className="space-y-0.5 flex-grow">
              <h3 className="text-sm font-bold text-slate-900">
                {st.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Ready to analyze a food product?</h3>
          <p className="text-xs text-slate-500 mt-0.5">Start with standard reference foods or enter custom storage parameters.</p>
        </div>
        <button
          type="button"
          onClick={onStartAnalysis}
          className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <span>Start New Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
