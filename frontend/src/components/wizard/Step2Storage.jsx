import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Thermometer, 
  Droplets, 
  Calendar, 
  Truck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { fetchWeatherReference } from '../../api/client';

const STORAGE_TYPES = [
  { id: "ambient", label: "Ambient", icon: "🏠", desc: "Room shelf / warehouse (20°C–25°C)", defaultTemp: 22.0, defaultRH: 55.0 },
  { id: "refrigerated", label: "Refrigerated", icon: "❄️", desc: "Chiller / cold showcase (2°C–6°C)", defaultTemp: 4.0, defaultRH: 85.0 },
  { id: "frozen", label: "Frozen", icon: "🧊", desc: "Deep freezer storage (-18°C)", defaultTemp: -18.0, defaultRH: 90.0 },
  { id: "tropical", label: "Tropical / Hot", icon: "☀️", desc: "Summer heat / transit (35°C–40°C)", defaultTemp: 38.0, defaultRH: 80.0 },
];

const TRANSPORT_MODES = [
  { id: "ambient_road", label: "Road Transport", icon: "🚛", desc: "Highway trucking" },
  { id: "reefer_truck", label: "Refrigerated Van", icon: "🚚", desc: "Chilled cold chain" },
  { id: "sea_freight", label: "Sea Cargo", icon: "🚢", desc: "Marine container" },
  { id: "air_cargo", label: "Air Freight", icon: "✈️", desc: "Express air cargo" },
];

const SHELF_LIFE_PRESETS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 180, label: "180 days" },
  { days: 365, label: "365 days" }
];

export default function Step2Storage({
  foodName,
  storageType,
  setStorageType,
  temperatureC,
  setTemperatureC,
  relativeHumidityPct,
  setRelativeHumidityPct,
  targetShelfLifeDays,
  setTargetShelfLifeDays,
  transportMode,
  setTransportMode,
  budgetPriority,
  setBudgetPriority,
  sustainabilityPriority,
  setSustainabilityPriority,
  onBack,
  onSubmit,
  loading
}) {
  const [locationInput, setLocationInput] = useState("Indore");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherUsageMode, setWeatherUsageMode] = useState("reference");

  // Transportation Toggle: Whether product requires shipping/transit or is stored normally at store
  const isTransportActive = transportMode && transportMode !== "store_storage" && transportMode !== "none";
  const [savedTransitMode, setSavedTransitMode] = useState(
    isTransportActive ? transportMode : "ambient_road"
  );

  const handleToggleTransport = () => {
    if (isTransportActive) {
      setSavedTransitMode(transportMode);
      setTransportMode("store_storage");
    } else {
      setTransportMode(savedTransitMode || "ambient_road");
    }
  };

  const handleFetchWeather = async (e) => {
    if (e) e.preventDefault();
    if (!locationInput.trim()) return;

    setWeatherLoading(true);
    try {
      const res = await fetchWeatherReference(locationInput);
      setWeatherData(res);
      if (weatherUsageMode === "apply") {
        setTemperatureC(res.temperature_c);
        setRelativeHumidityPct(res.relative_humidity_pct);
      }
    } catch (err) {
      console.error("Failed to fetch weather reference:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleWeatherUsageChange = (mode) => {
    setWeatherUsageMode(mode);
    if (mode === "apply" && weatherData) {
      setTemperatureC(weatherData.temperature_c);
      setRelativeHumidityPct(weatherData.relative_humidity_pct);
    }
  };

  const handleStorageTypeSelect = (t) => {
    setStorageType(t.id);
    if (weatherUsageMode !== "apply") {
      setTemperatureC(t.defaultTemp);
      setRelativeHumidityPct(t.defaultRH);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle space-y-1">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          Step 2 of 3
        </span>
        <h2 className="text-xl font-bold text-slate-900">
          Storage Conditions & Logistics for <span className="text-emerald-700">{foodName}</span>
        </h2>
        <p className="text-xs text-slate-500">
          Define environmental exposure and duration to derive barrier requirements.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle space-y-6 divide-y divide-slate-100">
        {/* Section 1: Storage Type */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
            Storage Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STORAGE_TYPES.map((t) => {
              const isSelected = storageType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleStorageTypeSelect(t)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-1 ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 text-emerald-950 font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.defaultTemp}°C
                    </span>
                  </div>
                  <span className="text-xs font-bold block">{t.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Temperature & Humidity Sliders */}
        <div className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Thermometer className="w-4 h-4 text-slate-500" />
                  <span>Temperature</span>
                </span>
                <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {temperatureC}°C
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="1"
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-18°C (Frozen)</span>
                <span>4°C (Chilled)</span>
                <span>22°C (Ambient)</span>
                <span>40°C (Hot)</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-slate-500" />
                  <span>Relative Humidity</span>
                </span>
                <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {relativeHumidityPct}% RH
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="95"
                step="1"
                value={relativeHumidityPct}
                onChange={(e) => setRelativeHumidityPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20% (Dry)</span>
                <span>55% (Moderate)</span>
                <span>85% (Humid/Monsoon)</span>
              </div>
            </div>
          </div>

          {/* Environmental Reference Box with 24h Hourly Range */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/40 via-slate-50 to-white border border-emerald-200/80 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Environmental Weather Reference</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    Open-Meteo v1 (24h Forecast)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Assess regional diurnal thermal amplitude and monsoon moisture exposure before setting warehouse limits.
                </span>
              </div>

              <form onSubmit={handleFetchWeather} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="City (e.g. Indore)"
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 w-32 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={weatherLoading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
                >
                  {weatherLoading ? "Checking..." : "Fetch Weather →"}
                </button>
              </form>
            </div>

            {weatherData && (
              <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {weatherData.location}
                    </span>
                    <span className="ml-2 font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      Now: {weatherData.temperature_c}°C · {weatherData.relative_humidity_pct}% RH
                    </span>
                  </div>

                  {weatherData.risk_condition && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Stress Factor: {weatherData.risk_condition}
                    </span>
                  )}
                </div>

                {weatherData.forecast_24h && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">24h Min Temp</span>
                      <span className="font-mono font-bold text-slate-800">{weatherData.forecast_24h.temp_min}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">24h Peak Heat</span>
                      <span className="font-mono font-bold text-amber-700">{weatherData.forecast_24h.temp_max}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">24h Min RH</span>
                      <span className="font-mono font-bold text-slate-800">{weatherData.forecast_24h.rh_min}% RH</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">24h Peak Moisture</span>
                      <span className="font-mono font-bold text-blue-700">{weatherData.forecast_24h.rh_max}% RH</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-[11px]">
                  <span className="text-slate-500 italic">
                    *Reference only. Real warehouse conditions may be climate-controlled.
                  </span>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="radio"
                        name="wmode"
                        checked={weatherUsageMode === "reference"}
                        onChange={() => handleWeatherUsageChange("reference")}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Keep as Reference</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 hover:bg-emerald-100 transition-colors">
                      <input
                        type="radio"
                        name="wmode"
                        checked={weatherUsageMode === "apply"}
                        onChange={() => handleWeatherUsageChange("apply")}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Apply to Sliders</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Shelf Life & Transportation */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shelf Life */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Target Shelf Life</span>
              </span>
              <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
                {targetShelfLifeDays} days
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {SHELF_LIFE_PRESETS.map((p) => {
                const isSelected = targetShelfLifeDays === p.days;
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setTargetShelfLifeDays(p.days)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transportation / In-Store Storage Toggle */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-slate-500" />
                <span>Logistics & Handling</span>
              </label>

              {/* In-Transit Toggle Switch */}
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-semibold transition-colors ${
                  isTransportActive ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  {isTransportActive ? "Transit Mode Active" : "In-Store Storage"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isTransportActive}
                  onClick={handleToggleTransport}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isTransportActive ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={isTransportActive ? "Click to set Normal In-Store Storage" : "Click to enable Transportation Transit Mode"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isTransportActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Segmented Mode Toggle Buttons */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (isTransportActive) {
                    setSavedTransitMode(transportMode);
                    setTransportMode("store_storage");
                  }
                }}
                className={`py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  !isTransportActive
                    ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🏪</span>
                <span className="truncate">Store / Shelf Storage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isTransportActive) {
                    setTransportMode(savedTransitMode || "ambient_road");
                  }
                }}
                className={`py-2 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isTransportActive
                    ? 'bg-white text-emerald-950 shadow-xs border border-emerald-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-base">🚛</span>
                <span className="truncate">Transportation Mode</span>
              </button>
            </div>

            {!isTransportActive ? (
              /* State 1: Normal In-Store / Shelf Storage */
              <div 
                onClick={handleToggleTransport}
                className="p-3.5 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-white flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                    🏪
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                      <span>Normal In-Store / Shelf Storage</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Product is stored normally at retail store shelves or pantry. No long-distance freight transit, vibration, or shipping stress.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTransport();
                  }}
                  className="text-[11px] text-emerald-700 group-hover:text-emerald-800 font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  + Add Transit Mode
                </button>
              </div>
            ) : (
              /* State 2: Transportation Active (4 modes selectable) */
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {TRANSPORT_MODES.map((m) => {
                    const isSelected = transportMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTransportMode(m.id)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-all duration-150 flex items-center space-x-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-xs'
                        }`}
                      >
                        <span className="text-xl shrink-0">{m.icon}</span>
                        <div className="min-w-0">
                          <span className="block truncate font-semibold">{m.label}</span>
                          <span className="text-[10px] text-slate-400 block truncate font-normal">
                            {m.desc || "Freight transit"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Vibration & transit thermal protection calibrated.</span>
                  <button
                    type="button"
                    onClick={handleToggleTransport}
                    className="text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    Switch to In-Store Storage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Optimization Priority */}
        <div className="pt-6 space-y-2">
          <label className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
            Optimization Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setBudgetPriority("balanced"); setSustainabilityPriority("standard"); }}
              className={`p-4 rounded-xl border text-left transition-all duration-150 hover:-translate-y-0.5 ${
                budgetPriority === "balanced" && sustainabilityPriority === "standard"
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 text-emerald-950 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold block">⚖️ Balanced</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-snug">Barrier safety + standard commercial cost.</span>
            </button>

            <button
              type="button"
              onClick={() => { setBudgetPriority("economy"); setSustainabilityPriority("standard"); }}
              className={`p-4 rounded-xl border text-left transition-all duration-150 hover:-translate-y-0.5 ${
                budgetPriority === "economy"
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 text-emerald-950 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold block">💰 Cost Priority</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-snug">Prioritizes lower material unit cost.</span>
            </button>

            <button
              type="button"
              onClick={() => { setSustainabilityPriority("zero_plastic_compostable"); setBudgetPriority("balanced"); }}
              className={`p-4 rounded-xl border text-left transition-all duration-150 hover:-translate-y-0.5 ${
                sustainabilityPriority === "zero_plastic_compostable"
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 text-emerald-950 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold block">🌱 Eco Priority</span>
              </div>
              <span className="text-[11px] text-slate-500 block leading-snug">Favors biodegradable or recyclable films.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="btn-emerald inline-flex items-center space-x-2.5 px-7 py-3 text-xs shadow-md disabled:opacity-50"
        >
          {loading ? (
            <span>Analyzing Packaging Requirements...</span>
          ) : (
            <>
              <span>Generate Packaging Recommendation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
