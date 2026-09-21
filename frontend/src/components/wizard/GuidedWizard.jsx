import React, { useState } from 'react';
import WizardProgress from './WizardProgress';
import Step1FoodSelect from './Step1FoodSelect';
import Step2Storage from './Step2Storage';
import Step3Results from './Step3Results';

export default function GuidedWizard({
  foodName,
  setFoodName,
  category,
  setCategory,
  onFoodSelected,
  storageType,
  setStorageType,
  temperatureC,
  setTemperatureC,
  relativeHumidityPct,
  setRelativeHumidityPct,
  targetShelfLifeDays,
  setTargetShelfLifeDays,
  budgetPriority,
  setBudgetPriority,
  sustainabilityPriority,
  setSustainabilityPriority,
  transportMode,
  setTransportMode,
  properties,
  setProperties,
  provenance,
  setProvenance,
  recommendation,
  onGenerateRecommendation,
  loading,
  onOpenSimulator,
  apiError = null,
  onClearError = () => {}
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextFromStep1 = () => {
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleGenerate = async () => {
    const success = await onGenerateRecommendation();
    if (success !== false) {
      setCurrentStep(3);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 3-Step Wizard Progress Bar */}
      <WizardProgress
        currentStep={currentStep}
        setStep={setCurrentStep}
        foodSelected={!!foodName}
        hasRecommendation={!!recommendation}
      />

      {/* Global API or Network Error Banner */}
      {apiError && (
        <div className="max-w-4xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-subtle animate-shake">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] px-2 py-0.5 bg-rose-200/70 rounded">Error</span>
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-rose-600 hover:text-rose-900 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Choose Food Product */}
      {currentStep === 1 && (
        <Step1FoodSelect
          foodName={foodName}
          category={category}
          properties={properties}
          setProperties={setProperties}
          provenance={provenance}
          setProvenance={setProvenance}
          onFoodSelected={onFoodSelected}
          onNext={handleNextFromStep1}
        />
      )}

      {/* Step 2: Storage & Environmental Conditions */}
      {currentStep === 2 && (
        <Step2Storage
          foodName={foodName}
          storageType={storageType}
          setStorageType={setStorageType}
          temperatureC={temperatureC}
          setTemperatureC={setTemperatureC}
          relativeHumidityPct={relativeHumidityPct}
          setRelativeHumidityPct={setRelativeHumidityPct}
          targetShelfLifeDays={targetShelfLifeDays}
          setTargetShelfLifeDays={setTargetShelfLifeDays}
          transportMode={transportMode}
          setTransportMode={setTransportMode}
          budgetPriority={budgetPriority}
          setBudgetPriority={setBudgetPriority}
          sustainabilityPriority={sustainabilityPriority}
          setSustainabilityPriority={setSustainabilityPriority}
          onBack={handleBackToStep1}
          onSubmit={handleGenerate}
          loading={loading}
        />
      )}

      {/* Step 3: Packaging Recommendation & Analysis */}
      {currentStep === 3 && (
        <Step3Results
          recommendation={recommendation}
          onReset={handleReset}
          onOpenSimulator={onOpenSimulator}
          loading={loading}
        />
      )}
    </div>
  );
}
