import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  RotateCcw,
  Sliders,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { runSimulation } from '../api/client';
import { getFriendlyMaterialInfo } from '../utils/marketPackaging';

export default function WhatIfSimulator({ initialFoodName, initialProperties }) {
  const [foodName, setFoodName] = useState(initialFoodName || "Potato Chips / Crisps");
  const [temperatureC, setTemperatureC] = useState(25.0);
  const [relativeHumidityPct, setRelativeHumidityPct] = useState(60.0);
  const [targetShelfLifeDays, setTargetShelfLifeDays] = useState(180);
  const [properties, setProperties] = useState(
    initialProperties || {
      moisture_pct: 2.0,
      fat_pct: 34.0,
      ph: 5.8,
      water_activity: 0.20,
      respiration_rate: 0.0
    }
  );

  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const executeSim = async () => {
      setIsSimulating(true);
      try {
        const res = await runSimulation({
          food_name: foodName,
          base_properties: properties,
          temperature_c: temperatureC,
          relative_humidity_pct: relativeHumidityPct,
          target_shelf_life_days: targetShelfLifeDays
        });
        if (!isCancelled) {
          setSimResult(res);
        }
      } catch (err) {
        console.error("Simulation error:", err);
      } finally {
        if (!isCancelled) setIsSimulating(false);
      }
    };

    const timer = setTimeout(executeSim, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [foodName, temperatureC, relativeHumidityPct, targetShelfLifeDays, properties]);

  const friendlyMat = simResult ? getFriendlyMaterialInfo(simResult.recommended_material_name, foodName) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            What-If Simulator
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            What happens if the conditions change?
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how elevated temperature or humidity alters degradation kinetics and re-prescribes packaging.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Target Product:</span>
          <select
            value={foodName}
            onChange={(e) => {
              const name = e.target.value;
              setFoodName(name);
              if (name.includes("Strawberries") || name.includes("Apples")) {
                setProperties({ moisture_pct: 88.0, fat_pct: 0.3, ph: 3.6, water_activity: 0.98, respiration_rate: 45.0 });
              } else if (name.includes("Paneer") || name.includes("Chicken")) {
                setProperties({ moisture_pct: 74.5, fat_pct: 2.6, ph: 5.9, water_activity: 0.99, respiration_rate: 0.0 });
              } else if (name.includes("Bread")) {
                setProperties({ moisture_pct: 37.0, fat_pct: 3.5, ph: 5.4, water_activity: 0.95, respiration_rate: 0.0 });
              } else {
                setProperties({ moisture_pct: 2.0, fat_pct: 34.0, ph: 5.8, water_activity: 0.20, respiration_rate: 0.0 });
              }
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="Potato Chips / Crisps">Potato Chips (Dry Snack)</option>
            <option value="Fresh Strawberries">Fresh Strawberries (Living Produce)</option>
            <option value="Sliced White Bread">Sliced White Bread (Bakery)</option>
            <option value="Fresh Paneer / Chicken">Fresh Paneer (Perishable)</option>
          </select>
        </div>
      </div>

      {/* Two-Column Simulation Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Environmental Sliders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Adjust Simulation Parameters
            </span>
            <button
              type="button"
              onClick={() => { setTemperatureC(22.0); setRelativeHumidityPct(55.0); setTargetShelfLifeDays(180); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Temperature</span>
              <span className="font-mono font-bold text-slate-900">{temperatureC}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={temperatureC}
              onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0°C (Cold Chain)</span>
              <span>22°C (Baseline)</span>
              <span>45°C (Peak Summer)</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Relative Humidity</span>
              <span className="font-mono font-bold text-slate-900">{relativeHumidityPct}% RH</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="1"
              value={relativeHumidityPct}
              onChange={(e) => setRelativeHumidityPct(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20% (Dry)</span>
              <span>55% (Moderate)</span>
              <span>95% (Monsoon)</span>
            </div>
          </div>

          {/* Shelf Life Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Target Shelf Life</span>
              <span className="font-mono font-bold text-slate-900">{targetShelfLifeDays} days</span>
            </div>
            <input
              type="range"
              min="14"
              max="365"
              step="7"
              value={targetShelfLifeDays}
              onChange={(e) => setTargetShelfLifeDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>14 days</span>
              <span>180 days</span>
              <span>365 days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Simulation Reaction */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Simulation Outcome
            </span>
            {isSimulating && (
              <span className="text-[11px] font-mono text-emerald-700 flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Recalculating...</span>
              </span>
            )}
          </div>

          {simResult && (
            <div className="space-y-4 text-xs">
              {/* Dynamic Causality Sequence */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Degradation Kinetic Shift:
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {simResult.arrhenius_acceleration_factor}×
                  </span>
                  <span className="text-slate-600">
                    chemical reaction speed relative to 20°C baseline
                  </span>
                </div>
              </div>

              {/* Spoilage Mode */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Critical Failure Mode:
                </span>
                <span className="font-semibold text-slate-900 block">
                  {simResult.critical_failure_mode}
                </span>
              </div>

              {/* Adapted Recommendation Card */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                    Adapted Packaging Match:
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    simResult.suitability_color === 'green'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    Predicted Life: ~{simResult.predicted_shelf_life_days}d
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {simResult.recommended_material_name}
                </h3>
                <p className="text-slate-600 text-[11px] font-mono">
                  {simResult.material_structure}
                </p>

                <p className="text-slate-700 pt-1 text-[11px] leading-relaxed border-t border-emerald-100">
                  {simResult.recalculation_rationale}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
