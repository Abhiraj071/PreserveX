import React, { useState } from 'react';
import { 
  FileDown, 
  RotateCcw, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Check,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { downloadPdfReport } from '../../api/client';
import AlternativesComparison from '../AlternativesComparison';
import { 
  getFriendlyMaterialInfo, 
  translateWhyToHuman, 
  formatHumanFreshness,
  getStorageConditionsTable 
} from '../../utils/marketPackaging';

export default function Step3Results({
  recommendation,
  onReset,
  onOpenSimulator,
  loading = false
}) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-3xl mx-auto text-center space-y-4 shadow-subtle animate-pulse">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-spin">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analyzing Packaging Requirements...</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Evaluating food chemical properties, Arrhenius environmental kinetics, barrier thresholds and matching optimal laminate materials.
        </p>
      </div>
    );
  }

  if (!recommendation || !recommendation.primary_recommendation) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-4 shadow-subtle">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Recommendation Generated Yet</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Please configure your food product and storage conditions in Steps 1 &amp; 2, then click &quot;Generate Packaging Recommendation&quot;.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Go to Step 1 &amp; Start Analysis</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    food_name = "Food Product",
    primary_recommendation: rec = {},
    barrier_requirements = {},
    packaging_requirements: pkgReqs = {},
    estimated_shelf_life_days = 180,
    why_explanations = [],
    alternatives = [],
    provenance = {},
    scores = {}
  } = recommendation;

  const primaryInfo = getFriendlyMaterialInfo(rec, food_name);
  const storageTable = getStorageConditionsTable(estimated_shelf_life_days, food_name);

  const handleDownload = async () => {
    setDownloadingPdf(true);
    try {
      await downloadPdfReport(recommendation);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const overallScore = Math.round(scores?.compatibility_score || 87);
  const barrierFit = Math.round(scores?.barrier_score || 92);
  const shelfLifeFit = Math.round(scores?.shelf_life_fit_score || 90);
  const costFit = Math.round(scores?.cost_score || 74);
  const ecoFit = Math.round(scores?.sustainability_score || 68);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Analysis Output
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Recommended Packaging for {food_name}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadingPdf}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? "Generating..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Main Recommended Material Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Primary Match · {overallScore}/100 Compatibility</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Expected Shelf Life: ~{estimated_shelf_life_days} days
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {rec.name}
          </h2>

          <p className="text-sm text-slate-700 font-medium">
            <span className="font-bold text-emerald-800">{primaryInfo.friendlyName}</span> · <span className="text-slate-500 font-mono text-xs">{rec.layer_description}</span>
          </p>

          {primaryInfo.commonMarketName && (
            <p className="text-xs text-slate-600 italic">
              Commercial Description: {primaryInfo.commonMarketName}
            </p>
          )}
        </div>

        {/* Practical Packaging Instructions & Operational SOP */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/90 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Step-by-Step Packaging Instructions
            </span>
            <span className="text-xs font-bold text-slate-800">Operational Packing & Sealing Guidelines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Recommended Sealing Method</span>
              <p className="font-semibold text-slate-900">{primaryInfo.sealingMethod || "Impulse Heat Sealer or Food Clip"}</p>
              <span className="text-[10px] text-slate-500 block">Ensure seal area is completely free of crumbs/oil moisture.</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">2. Estimated Unit Packaging Cost</span>
              <p className="font-bold text-emerald-700">{primaryInfo.approxCostPiece || (rec?.cost_per_sqm ? `~ ₹${(rec.cost_per_sqm * 0.08).toFixed(2)} / pouch` : "₹1.50 – ₹3.00 / piece")}</p>
              <span className="text-[10px] text-slate-500 block">Typical commercial raw conversion cost.</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Vendor Procurement Specification</span>
              <p className="font-mono text-slate-800 font-semibold text-[11px] leading-snug">{primaryInfo.wholesaleAsk || `Ask vendor for ${rec?.thickness_um || 50}µm ${rec?.name || 'packaging'}`}</p>
              <span className="text-[10px] text-slate-500 block">Use this exact line when ordering from packaging suppliers.</span>
            </div>
          </div>

          {primaryInfo.warningTip && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start space-x-2">
              <span className="font-bold text-amber-700 shrink-0">⚠️ Critical Instruction:</span>
              <span className="leading-relaxed">{primaryInfo.warningTip}</span>
            </div>
          )}
        </div>

        {/* Derived Packaging Requirements Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
              Technical Barrier Tolerances (First-Principles Engine)
            </span>
            <span className="text-[11px] text-slate-500">Limits required to prevent physical & biochemical spoilage</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-sky-50/60 border border-sky-200/80 rounded-xl hover:-translate-y-0.5 transition-transform shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-sky-700 font-semibold block uppercase tracking-wide">Oxygen Barrier</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                  {pkgReqs?.oxygen_barrier_level || "HIGH"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  {pkgReqs?.target_otr_range || `≤ ${barrier_requirements?.max_otr_cc_m2_day || 10} cc/m²·d`}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 pt-1 border-t border-sky-200/50 leading-tight">
                {pkgReqs?.oxygen_barrier_level === "BREATHABLE" 
                  ? "Allows produce to breathe O₂ so it doesn't ferment." 
                  : "Prevents oxygen from turning oils and fats rancid."}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl hover:-translate-y-0.5 transition-transform shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold block uppercase tracking-wide">Moisture Barrier</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                  {pkgReqs?.moisture_barrier_level || "HIGH"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  {pkgReqs?.target_wvtr_range || `≤ ${barrier_requirements?.max_wvtr_g_m2_day || 3} g/m²·d`}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 pt-1 border-t border-emerald-200/50 leading-tight">
                {pkgReqs?.moisture_barrier_level === "LOW"
                  ? "Permits water vapor escape to prevent sweat & mold."
                  : "Blocks humid air so product doesn't become soggy."}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl hover:-translate-y-0.5 transition-transform shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-amber-700 font-semibold block uppercase tracking-wide">Seal Integrity</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                  {pkgReqs?.sealability_level || "HIGH"}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {barrier_requirements?.map_required ? "Hermetic Gas Seal" : "Standard Heat / Clip"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 pt-1 border-t border-amber-200/50 leading-tight">
                {barrier_requirements?.map_required
                  ? "Airtight lock to hold nitrogen gas flushing."
                  : "Simple tape neck sealer, twist tie or hand heat sealer."}
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl hover:-translate-y-0.5 transition-transform shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 font-semibold block uppercase tracking-wide">Light Shielding</span>
                <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                  {pkgReqs?.light_barrier_level || "MODERATE"}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {barrier_requirements?.light_barrier_required ? "Blocks Light / UV" : "Transparent Allowed"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 pt-1 border-t border-indigo-200/50 leading-tight">
                {barrier_requirements?.light_barrier_required
                  ? "Opaque or silver layer to block photo-oxidation."
                  : "Clear packaging allows retail customers to see contents."}
              </p>
            </div>
          </div>
        </div>

        {/* Why This Recommendation? */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
            Why this recommendation?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {why_explanations.map((text, i) => (
              <div key={i} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-start space-x-2.5 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{translateWhyToHuman(text, food_name)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging Evaluation Bar Breakdown */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
            Packaging Evaluation
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-3">
              <span className="w-28 text-slate-600">Barrier Fit</span>
              <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${barrierFit}%` }}></div>
              </div>
              <span className="w-8 font-mono text-right font-medium text-slate-900">{barrierFit}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="w-28 text-slate-600">Shelf-Life Fit</span>
              <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${shelfLifeFit}%` }}></div>
              </div>
              <span className="w-8 font-mono text-right font-medium text-slate-900">{shelfLifeFit}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="w-28 text-slate-600">Cost Efficiency</span>
              <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full" style={{ width: `${costFit}%` }}></div>
              </div>
              <span className="w-8 font-mono text-right font-medium text-slate-900">{costFit}</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="w-28 text-slate-600">Sustainability</span>
              <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ecoFit}%` }}></div>
              </div>
              <span className="w-8 font-mono text-right font-medium text-slate-900">{ecoFit}</span>
            </div>
          </div>
        </div>

        {/* Action Link to What-If */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Want to see how temperature or moisture changes alter this recommendation?
          </span>
          <button
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center space-x-1.5 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>Open Packaging What-If Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alternatives Comparison Table */}
      {alternatives && alternatives.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Candidate Alternatives Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation of viable secondary structures and their commercial trade-offs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Packaging Material</th>
                  <th className="py-2.5 px-3">Compatibility</th>
                  <th className="py-2.5 px-3">Barrier Level</th>
                  <th className="py-2.5 px-3">Est. Life</th>
                  <th className="py-2.5 px-3">Trade-off Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-emerald-50/50 font-medium">
                  <td className="py-2.5 px-3 text-slate-900 font-bold">
                    {rec.name} <span className="text-[10px] text-emerald-800 block font-normal">(Primary)</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">{overallScore}/100</td>
                  <td className="py-2.5 px-3 font-medium">Optimal</td>
                  <td className="py-2.5 px-3 font-mono">~{estimated_shelf_life_days}d</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">Primary prescription meeting all barrier criteria.</td>
                </tr>
                {alternatives.slice(0, 3).map((alt) => (
                  <tr key={alt.material.name} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {alt.material.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {Math.round(alt.compatibility_score)}/100
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {alt.barrier_score > 85 ? "High" : "Moderate"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      ~{alt.estimated_shelf_life_days}d
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {alt.trade_off_summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collapsible Deep Technical Details */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-900">
              View Technical Details & Data Provenance
            </span>
            <span className="text-[11px] text-slate-500">
              (OTR, WVTR limits, provenance origin & multi-climate matrix)
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/40 space-y-6">
            {/* Raw Barrier Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Oxygen Barrier (OTR)</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{rec?.otr_cc_m2_day ?? "—"} cc/m²·d</span>
                <span className="text-[10px] text-slate-400 block">Limit: ≤ {barrier_requirements?.max_otr_cc_m2_day ?? "—"}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Moisture (WVTR)</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{rec?.wvtr_g_m2_day ?? "—"} g/m²·d</span>
                <span className="text-[10px] text-slate-400 block">Limit: ≤ {barrier_requirements?.max_wvtr_g_m2_day ?? "—"}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Thickness</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{rec?.thickness_um ?? "—"} µm</span>
                <span className="text-[10px] text-slate-400 block">Req: ≥ {barrier_requirements?.min_thickness_um ?? "—"} µm</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 block uppercase">Mechanical</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{rec?.tensile_strength_mpa ?? "—"} MPa</span>
                <span className="text-[10px] text-slate-400 block">Puncture: {rec?.puncture_resistance ?? "Standard"}</span>
              </div>
            </div>

            {/* Storage Conditions Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
                Multi-Climate Freshness Matrix
              </span>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Condition</th>
                      <th className="py-2 px-3">Expected Life</th>
                      <th className="py-2 px-3">Guidance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {storageTable.map((row, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-medium text-slate-900">{row.condition}</td>
                        <td className="py-2 px-3 font-mono font-medium text-slate-900">{row.duration}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{row.advice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Provenance */}
            {provenance && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
                  Data Provenance Tracking
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  {Object.entries(provenance).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white border border-slate-200 rounded-md">
                      <span className="text-slate-400 text-[10px] block uppercase truncate">{k.replace('_', ' ')}</span>
                      <span className="text-slate-900 font-bold block truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives Radar Chart */}
            <div className="pt-2">
              <AlternativesComparison recommendation={recommendation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
