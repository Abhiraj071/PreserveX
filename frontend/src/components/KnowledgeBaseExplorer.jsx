import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { fetchPackagingMaterials } from '../api/client';

export default function KnowledgeBaseExplorer() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchPackagingMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBarrierLabel = (val, type) => {
    if (type === 'otr') {
      if (val <= 1.0) return { label: 'Very Low', color: 'text-emerald-700 bg-emerald-50' };
      if (val <= 30.0) return { label: 'Low', color: 'text-emerald-700 bg-emerald-50' };
      if (val <= 150.0) return { label: 'Medium', color: 'text-amber-700 bg-amber-50' };
      return { label: 'High', color: 'text-slate-600 bg-slate-100' };
    } else {
      if (val <= 0.5) return { label: 'Very Low', color: 'text-emerald-700 bg-emerald-50' };
      if (val <= 2.0) return { label: 'Low', color: 'text-emerald-700 bg-emerald-50' };
      if (val <= 10.0) return { label: 'Medium', color: 'text-amber-700 bg-amber-50' };
      return { label: 'High', color: 'text-slate-600 bg-slate-100' };
    }
  };

  const getCostLabel = (cost) => {
    if (cost <= 0.25) return "Low";
    if (cost <= 0.60) return "Medium";
    return "High";
  };

  const filteredMaterials = materials.filter(m => {
    const q = searchFilter.toLowerCase();
    const matchSearch = 
      m.name.toLowerCase().includes(q) ||
      (m.layer_description && m.layer_description.toLowerCase().includes(q)) ||
      (m.typical_applications && m.typical_applications.toLowerCase().includes(q)) ||
      (m.structure_type && m.structure_type.toLowerCase().includes(q));

    const matchStructure = selectedStructure === 'all' || 
      (m.structure_type && m.structure_type.toLowerCase().includes(selectedStructure.toLowerCase()));

    return matchSearch && matchStructure;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Packaging Knowledge Base
        </h1>
        <p className="text-xs text-slate-500">
          Curated polymer structures, barrier coefficients (OTR/WVTR), tensile properties, and circularity ratings.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search materials, structures, applications..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Filter:</span>
          {['all', 'Multilayer', 'Monolayer', 'Bio', 'Permeable'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStructure(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedStructure === st
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Loading Knowledge Base records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Material Structure</th>
                  <th className="py-3 px-4">Thickness</th>
                  <th className="py-3 px-4">OTR (Oxygen)</th>
                  <th className="py-3 px-4">WVTR (Moisture)</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Recyclability</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMaterials.map((m) => {
                  const isExpanded = expandedRow === m.id;
                  const otrInfo = getBarrierLabel(m.otr_cc_m2_day, 'otr');
                  const wvtrInfo = getBarrierLabel(m.wvtr_g_m2_day, 'wvtr');
                  const costLevel = getCostLabel(m.cost_per_sqm);

                  return (
                    <React.Fragment key={m.id}>
                      <tr 
                        onClick={() => setExpandedRow(isExpanded ? null : m.id)}
                        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-emerald-50/40' : 'hover:bg-slate-50/70'}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{m.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs block">{m.layer_description}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">{m.thickness_um} µm</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${otrInfo.color}`}>
                            {otrInfo.label} ({m.otr_cc_m2_day})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${wvtrInfo.color}`}>
                            {wvtrInfo.label} ({m.wvtr_g_m2_day})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {costLevel} <span className="text-[10px] text-slate-400">(${m.cost_per_sqm.toFixed(2)}/m²)</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600 font-medium">
                            {m.is_biodegradable ? "Compostable" : `Grade ${m.recyclability_grade}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center space-x-0.5"
                          >
                            <span>{isExpanded ? "Close" : "Inspect"}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Technical Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="py-4 px-6 border-b border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="font-semibold text-slate-900 block mb-1">Typical Applications:</span>
                                <p className="text-slate-600 leading-relaxed text-[11px]">{m.typical_applications || "Standard packaged retail foods"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-emerald-800 block mb-1">Key Advantages:</span>
                                <p className="text-slate-600 leading-relaxed text-[11px]">{m.key_advantages}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-amber-800 block mb-1">Limitations:</span>
                                <p className="text-slate-600 leading-relaxed text-[11px]">{m.limitations}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200/80 flex flex-wrap gap-4 text-[11px] font-mono text-slate-500">
                              <span>Tensile Strength: <strong>{m.tensile_strength_mpa} MPa</strong></span>
                              <span>Puncture Resistance: <strong>{m.puncture_resistance}</strong></span>
                              <span>Sealability Score: <strong>{m.sealability_score}/10</strong></span>
                              <span>MAP Suitable: <strong>{m.map_suitable ? "Yes" : "No"}</strong></span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
