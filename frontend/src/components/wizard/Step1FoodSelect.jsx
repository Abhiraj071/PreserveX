import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Barcode, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sliders,
  Sparkles,
  Globe,
  Database,
  Layers,
  X
} from 'lucide-react';
import { searchFoods, lookupBarcode, fetchFoods, fetchAutocompleteFoods } from '../../api/client';

const getFoodEmoji = (name = "", category = "") => {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("chip") || n.includes("crisp")) return "🥔";
  if (n.includes("paneer")) return "🧀";
  if (n.includes("ghee") || n.includes("butter")) return "🧈";
  if (n.includes("cheese")) return "🧀";
  if (n.includes("milk")) return "🥛";
  if (n.includes("bread") || n.includes("bakery")) return "🍞";
  if (n.includes("strawberry") || n.includes("berries")) return "🍓";
  if (n.includes("apple")) return "🍎";
  if (n.includes("mushroom")) return "🍄";
  if (n.includes("spinach") || n.includes("green")) return "🥬";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("beef") || n.includes("meat")) return "🥩";
  if (n.includes("fish") || n.includes("salmon") || c.includes("seafood")) return "🐟";
  if (n.includes("coffee")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("turmeric") || n.includes("spice") || n.includes("haldi")) return "🧂";
  if (n.includes("rice")) return "🍚";
  if (n.includes("flour") || n.includes("atta")) return "🌾";
  if (n.includes("dal") || n.includes("lentil") || n.includes("pulse")) return "🥣";
  if (n.includes("kaju") || n.includes("katli") || n.includes("sweet")) return "🍬";
  if (n.includes("jamun") || n.includes("sweet")) return "🍯";
  if (n.includes("khakhra") || n.includes("flatbread")) return "🫓";
  if (n.includes("bhujia") || n.includes("sev") || n.includes("snack")) return "🥨";
  if (n.includes("honey")) return "🍯";
  if (n.includes("peanut") || n.includes("cashew") || n.includes("nut")) return "🥜";
  if (n.includes("noodle") || n.includes("pasta")) return "🍜";
  if (n.includes("chilli") || n.includes("pepper")) return "🌶️";
  if (n.includes("tomato") || n.includes("puree")) return "🍅";
  if (n.includes("jam")) return "🍓";
  if (n.includes("chocolate")) return "🍫";
  if (n.includes("corn") || n.includes("puff")) return "🍿";
  if (n.includes("biscuit") || n.includes("cookie")) return "🍪";
  if (c.includes("dairy")) return "🥛";
  if (c.includes("produce")) return "🥗";
  if (c.includes("snack")) return "🍿";
  return "🍲";
};

export default function Step1FoodSelect({
  foodName,
  category,
  properties,
  setProperties,
  provenance,
  setProvenance,
  onFoodSelected,
  onNext
}) {
  const [searchInput, setSearchInput] = useState(foodName || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeError, setBarcodeError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [matchedSource, setMatchedSource] = useState("reference_db");
  const [productMetadata, setProductMetadata] = useState(null);

  // Catalog & Autocomplete State
  const [dbFoods, setDbFoods] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Load all pre-calibrated foods on mount
  useEffect(() => {
    fetchFoods()
      .then((foods) => {
        if (foods && foods.length > 0) {
          setDbFoods(foods);
        }
      })
      .catch((err) => console.warn("Failed to load DB foods:", err));
  }, []);

  // Debounced Autocomplete Live Search
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const results = await fetchAutocompleteFoods(trimmed);
        setAutocompleteSuggestions(results || []);
      } catch (err) {
        console.warn("Autocomplete error:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSelectFood = async (name, cat) => {
    setSearchInput(name);
    setIsSearching(true);
    try {
      const data = await searchFoods(name);
      onFoodSelected(data);
      setMatchedSource(data.matched_source || "reference_db");
      setProductMetadata(data);
    } catch (e) {
      console.error(e);
      onFoodSelected({
        food_name: name,
        category: cat,
        properties: { moisture_pct: 15.0, fat_pct: 5.0, ph: 6.0, water_activity: 0.50, respiration_rate: 0.0 }
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (item) => {
    setSearchInput(item.original_name || item.name);
    
    // If it's a live Open Food Facts product with barcode, use direct barcode resolution for highest accuracy
    if (item.barcode) {
      setIsSearching(true);
      try {
        const data = await lookupBarcode(item.barcode);
        onFoodSelected(data);
        setMatchedSource("open_food_facts");
        setProductMetadata(data);
        return;
      } catch (e) {
        console.warn("Barcode resolution fallback:", e);
      } finally {
        setIsSearching(false);
      }
    }

    // Default to searchFoods for full biochemical parameter derivation
    handleSelectFood(item.original_name || item.name, item.category);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    try {
      // Also fetch matching suggestions to ensure the search list shows related results
      const results = await fetchAutocompleteFoods(searchInput.trim());
      if (results && results.length > 0) {
        setAutocompleteSuggestions(results);
      }

      const data = await searchFoods(searchInput);
      onFoodSelected(data);
      setMatchedSource(data.matched_source || "open_food_facts");
      setProductMetadata(data);
    } catch (err) {
      console.error(err);
      onFoodSelected({
        food_name: searchInput,
        category: "General Food",
        properties: { moisture_pct: 20.0, fat_pct: 5.0, ph: 6.0, water_activity: 0.60, respiration_rate: 0.0 }
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleBarcodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    setIsSearching(true);
    setBarcodeError(null);
    try {
      const data = await lookupBarcode(code);
      onFoodSelected(data);
      setSearchInput(data.food_name);
      setMatchedSource("open_food_facts");
      setProductMetadata(data);
      setShowBarcodeModal(false);
      setBarcodeInput('');
    } catch (err) {
      setBarcodeError("Barcode not found in Open Food Facts or catalog. Search by food name instead.");
    } finally {
      setIsSearching(false);
    }
  };

  // Helper for provenance display
  const getProvenanceBadge = (propKey) => {
    const prov = provenance?.[propKey];
    if (!prov) return { label: "Standard Ref", color: "bg-slate-100 text-slate-600 border-slate-200" };
    
    const src = typeof prov === 'object' ? prov.source : String(prov);
    const status = typeof prov === 'object' ? prov.status : '';

    if (src.includes("OPEN_FOOD_FACTS")) {
      return { label: `Open Food Facts · ${status || 'Ref'}`, color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (src.includes("FAOSTAT")) {
      return { label: `FAOSTAT/INFOODS · ${status || 'Ref'}`, color: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (src.includes("CURATED") || src.includes("reference")) {
      return { label: `Lab Benchmark · ${status || 'Measured'}`, color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (src.includes("USER")) {
      return { label: `User Overridden`, color: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    return { label: `Derived · ${status || 'Est'}`, color: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search & Selection Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Food Product</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search any branded food worldwide (Open Food Facts API) or choose from {dbFoods.length || 36} pre-calibrated benchmarks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBarcodeModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Barcode className="w-3.5 h-3.5 text-slate-500" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type any food name or brand (e.g. Paneer, Lay's, Maggi, Ghee, Kaju Katli, Rice)..."
              className="w-full pl-10 pr-28 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setAutocompleteSuggestions([]);
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Search</span>}
            </button>
          </form>
        </div>

        {/* Dynamic Search Results List (Shown when user types or searches) */}
        {searchInput.trim().length >= 1 ? (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Search Results for "{searchInput.trim()}"
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  {isSuggesting ? "Searching..." : `${autocompleteSuggestions.length} found`}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any item to select
              </span>
            </div>

            {isSuggesting && autocompleteSuggestions.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs font-medium text-slate-600">Searching lab benchmarks & Open Food Facts API...</span>
              </div>
            ) : autocompleteSuggestions.length > 0 ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {autocompleteSuggestions.map((item, idx) => {
                  const isSelected = (foodName || "").toLowerCase() === (item.name || "").toLowerCase();
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400 shadow-xs"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                          {getFoodEmoji(item.name, item.category)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                            <span>{item.category}</span>
                            {item.barcode ? (
                              <>
                                <span>·</span>
                                <span className="font-mono text-[10px] text-slate-400">Barcode: {item.barcode}</span>
                              </>
                            ) : (
                              <>
                                <span>·</span>
                                <span className="text-[10px] text-emerald-600">Lab Benchmark</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          item.source === 'reference_db'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                            : 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                        }`}>
                          {item.source === 'reference_db' ? 'Verified Lab DB' : 'Open Food Facts API'}
                        </span>
                        <button
                          type="button"
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white font-semibold shadow-xs"
                              : "bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-4 space-y-1.5">
                <p className="font-semibold text-slate-700">No matching food found for "{searchInput}"</p>
                <p className="text-[11px] text-slate-400">
                  Click the <strong>Search</strong> button to run a deep lookup, or customize biochemical parameters below.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Clean Default View: Minimal Popular Picks */
          <div className="pt-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Popular Quick Picks:</span>
              <span className="text-[11px] text-slate-400">Type above to search 3M+ items</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Potato Chips / Crisps", category: "Dry Snacks", emoji: "🥔" },
                { name: "Fresh Paneer (Cottage Cheese)", category: "Dairy", emoji: "🧀" },
                { name: "Fresh Pasteurized Milk", category: "Dairy", emoji: "🥛" },
                { name: "Sliced White Bread", category: "Bakery", emoji: "🍞" },
                { name: "Fresh Strawberries", category: "Fresh Produce", emoji: "🍓" },
                { name: "Roasted Whole Coffee Beans", category: "Beverages & Coffee", emoji: "☕" }
              ].map((item) => {
                const isSelected = (foodName || "").toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectFood(item.name, item.category)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center space-x-1.5 hover:-translate-y-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Food Identified Confirmation Card (Rich Highlight) */}
      {foodName && (
        <div className="bg-gradient-to-r from-emerald-50/60 via-white to-white border border-emerald-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Food Identified
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {category || "Standard Food Item"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {foodName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs text-slate-500">
                  {matchedSource === "open_food_facts" 
                    ? "Enriched via Open Food Facts v3 API" 
                    : matchedSource === "faostat_reference_fallback"
                    ? "FAOSTAT / INFOODS Harmonized Baseline"
                    : "Curated Food Laboratory Reference Database"}
                </span>
                {productMetadata?.brand && (
                  <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    Brand: {productMetadata.brand}
                  </span>
                )}
                {productMetadata?.current_packaging && productMetadata.current_packaging !== "Not specified on product label" && (
                  <span className="text-[11px] font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800">
                    Current Retail Pack: {productMetadata.current_packaging}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="btn-emerald w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-xs transition-all shadow-sm shrink-0"
          >
            <span>Next: Storage Conditions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Advanced Technical Properties (Optional Accordion) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-800">
              Technical Food Properties & Data Provenance (Optional)
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              — Verified source & confidence for each parameter
            </span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && properties && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-600 block">Moisture (%)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={properties.moisture_pct ?? 10}
                onChange={(e) => {
                  setProperties(p => ({ ...p, moisture_pct: parseFloat(e.target.value) || 0 }));
                  if (setProvenance) setProvenance(pr => ({ ...pr, moisture_pct: "USER_PROVIDED" }));
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium ${getProvenanceBadge("moisture_pct").color}`}>
                {getProvenanceBadge("moisture_pct").label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-600 block">Fat (%)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={properties.fat_pct ?? 5}
                onChange={(e) => {
                  setProperties(p => ({ ...p, fat_pct: parseFloat(e.target.value) || 0 }));
                  if (setProvenance) setProvenance(pr => ({ ...pr, fat_pct: "USER_PROVIDED" }));
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium ${getProvenanceBadge("fat_pct").color}`}>
                {getProvenanceBadge("fat_pct").label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-600 block">pH</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="1"
                max="14"
                value={properties.ph ?? 6.0}
                onChange={(e) => {
                  setProperties(p => ({ ...p, ph: parseFloat(e.target.value) || 7 }));
                  if (setProvenance) setProvenance(pr => ({ ...pr, ph: "USER_PROVIDED" }));
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium ${getProvenanceBadge("ph").color}`}>
                {getProvenanceBadge("ph").label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-600 block">Water Activity (aw)</label>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="1.0"
                value={properties.water_activity ?? 0.50}
                onChange={(e) => {
                  setProperties(p => ({ ...p, water_activity: parseFloat(e.target.value) || 0.5 }));
                  if (setProvenance) setProvenance(pr => ({ ...pr, water_activity: "USER_PROVIDED" }));
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium ${getProvenanceBadge("water_activity").color}`}>
                {getProvenanceBadge("water_activity").label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-600 block">Respiration Rate</label>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                value={properties.respiration_rate ?? 0}
                onChange={(e) => {
                  setProperties(p => ({ ...p, respiration_rate: parseFloat(e.target.value) || 0 }));
                  if (setProvenance) setProvenance(pr => ({ ...pr, respiration_rate: "USER_PROVIDED" }));
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium ${getProvenanceBadge("respiration_rate").color}`}>
                {getProvenanceBadge("respiration_rate").label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-200 space-y-4 shadow-float">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Barcode className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Scan / Enter Barcode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBarcodeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter any retail product barcode (UPC / EAN-13) to auto-fill nutrition and composition via Open Food Facts.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 3017620422003 or 737628064502"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Sample Barcode:</span>
                <button type="button" onClick={() => handleBarcodeSubmit("3017620422003")} className="text-blue-600 hover:underline">
                  Nutella (3017620422003)
                </button>
              </div>
            </div>

            {barcodeError && (
              <div className="flex items-center space-x-1.5 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{barcodeError}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBarcodeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBarcodeSubmit()}
                disabled={isSearching}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm"
              >
                {isSearching ? "Searching..." : "Fetch Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
