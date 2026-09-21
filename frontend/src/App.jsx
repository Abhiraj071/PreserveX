import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import GuidedWizard from './components/wizard/GuidedWizard';
import WhatIfSimulator from './components/WhatIfSimulator';
import KnowledgeBaseExplorer from './components/KnowledgeBaseExplorer';
import HowItWorks from './components/HowItWorks';
import { checkHealth, getRecommendation } from './api/client';

export default function App() {
  // Default tab is landing page for first-time visitors
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'recommender' | 'simulator' | 'knowledge' | 'howitworks'
  const [apiHealthy, setApiHealthy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Core Product & Formulation State
  const [foodName, setFoodName] = useState("Potato Chips / Crisps");
  const [category, setCategory] = useState("Dry Snacks");
  const [properties, setProperties] = useState({
    moisture_pct: 2.0,
    fat_pct: 34.0,
    ph: 5.8,
    water_activity: 0.20,
    respiration_rate: 0.0
  });
  const [provenance, setProvenance] = useState({
    moisture_pct: "USDA/FAO Reference Database",
    fat_pct: "USDA/FAO Reference Database",
    ph: "USDA/FAO Reference Database",
    water_activity: "USDA/FAO Reference Database",
    respiration_rate: "USDA/FAO Reference Database"
  });
  const [isRespiring, setIsRespiring] = useState(false);

  // Storage & Environmental Conditions
  const [storageType, setStorageType] = useState("ambient");
  const [temperatureC, setTemperatureC] = useState(22.0);
  const [relativeHumidityPct, setRelativeHumidityPct] = useState(55.0);
  const [targetShelfLifeDays, setTargetShelfLifeDays] = useState(180);
  const [transportMode, setTransportMode] = useState("store_storage");
  const [budgetPriority, setBudgetPriority] = useState("balanced");
  const [sustainabilityPriority, setSustainabilityPriority] = useState("standard");

  // Output State
  const [recommendation, setRecommendation] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Health check on mount
  useEffect(() => {
    checkHealth()
      .then(() => setApiHealthy(true))
      .catch((err) => {
        console.warn("Backend not yet connected:", err);
        setApiHealthy(false);
      });
  }, []);

  const handleFoodSelected = (data) => {
    if (!data) return;
    setFoodName(data.food_name || foodName);
    setCategory(data.category || category);
    
    if (data.properties) {
      setProperties(prev => ({
        ...prev,
        ...data.properties
      }));
    }
    if (data.provenance) {
      setProvenance(prev => ({
        ...prev,
        ...data.provenance
      }));
    }
    if (data.is_respiring !== undefined) {
      setIsRespiring(data.is_respiring);
    }
    if (data.ideal_storage_temp !== undefined) {
      setTemperatureC(data.ideal_storage_temp);
    }
    if (data.ideal_rh !== undefined) {
      setRelativeHumidityPct(data.ideal_rh);
    }
    if (data.typical_shelf_life_days !== undefined) {
      setTargetShelfLifeDays(data.typical_shelf_life_days);
    }
  };

  const handleGenerateRecommendation = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        food_name: foodName,
        category: category,
        storage_type: storageType,
        temperature_c: temperatureC,
        relative_humidity_pct: relativeHumidityPct,
        target_shelf_life_days: targetShelfLifeDays,
        transport_mode: transportMode,
        budget_priority: budgetPriority,
        sustainability_priority: sustainabilityPriority,
        moisture_pct: properties.moisture_pct,
        fat_pct: properties.fat_pct,
        ph: properties.ph,
        water_activity: properties.water_activity,
        respiration_rate: properties.respiration_rate,
        is_respiring: isRespiring,
        property_sources: provenance
      };

      const result = await getRecommendation(payload);
      setRecommendation(result);
      setApiHealthy(true);

      // Trigger celebratory micro-confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#14b8a6', '#38bdf8', '#10b981']
      });
      return true;
    } catch (err) {
      console.error("Failed to generate recommendation:", err);
      const errMsg = err?.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail))
        : (err.message || "Failed to connect to recommendation service. Please ensure the backend server is running on port 8000.");
      setApiError(errMsg);
      setApiHealthy(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-[#F8FAFC] to-[#F8FAFC] text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiHealthy={apiHealthy} 
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
        {/* Landing Page View */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartRecommender={() => setActiveTab('recommender')}
            onOpenSimulator={() => setActiveTab('simulator')}
            onOpenKnowledgeBase={() => setActiveTab('knowledge')}
          />
        )}

        {/* 3-Step Guided Wizard Recommender */}
        {activeTab === 'recommender' && (
          <GuidedWizard
            foodName={foodName}
            setFoodName={setFoodName}
            category={category}
            setCategory={setCategory}
            onFoodSelected={handleFoodSelected}
            storageType={storageType}
            setStorageType={setStorageType}
            temperatureC={temperatureC}
            setTemperatureC={setTemperatureC}
            relativeHumidityPct={relativeHumidityPct}
            setRelativeHumidityPct={setRelativeHumidityPct}
            targetShelfLifeDays={targetShelfLifeDays}
            setTargetShelfLifeDays={setTargetShelfLifeDays}
            budgetPriority={budgetPriority}
            setBudgetPriority={setBudgetPriority}
            sustainabilityPriority={sustainabilityPriority}
            setSustainabilityPriority={setSustainabilityPriority}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            properties={properties}
            setProperties={setProperties}
            provenance={provenance}
            setProvenance={setProvenance}
            recommendation={recommendation}
            onGenerateRecommendation={handleGenerateRecommendation}
            loading={loading}
            onOpenSimulator={() => setActiveTab('simulator')}
            apiError={apiError}
            onClearError={() => setApiError(null)}
          />
        )}

        {/* Dynamic What-If Simulator */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator
            initialFoodName={foodName}
            initialProperties={properties}
          />
        )}

        {/* Knowledge Base Explorer */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer />
        )}

        {/* How It Works Architecture Pipeline */}
        {activeTab === 'howitworks' && (
          <HowItWorks onStartAnalysis={() => setActiveTab('recommender')} />
        )}
      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 font-sans text-sm">
              PACK<span className="text-blue-600">AI</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-600">Intelligent Food Packaging Decision Support (SIH26236)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Data-driven barrier engineering &bull; Shelf-life prediction &bull; FSSAI compliance
          </div>
        </div>
      </footer>
    </div>
  );
}
