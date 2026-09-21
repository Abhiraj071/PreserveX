import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getFriendlyMaterialInfo } from '../utils/marketPackaging';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AlternativesComparison({ recommendation }) {
  if (!recommendation || !recommendation.alternatives || recommendation.alternatives.length === 0) {
    return null;
  }

  const { primary_recommendation: primary, alternatives, scores } = recommendation;
  const allOptions = [
    {
      material: primary,
      barrier_score: scores?.barrier_score || 92,
      shelf_life_fit: scores?.shelf_life_fit_score || 90,
      cost_score: scores?.cost_score || 74,
      sustainability_score: scores?.sustainability_score || 68,
      isPrimary: true
    },
    ...alternatives.slice(0, 2).map(a => ({
      ...a,
      isPrimary: false
    }))
  ];

  const radarData = {
    labels: ['Barrier Fit', 'Shelf-Life Fit', 'Cost Score', 'Sustainability'],
    datasets: allOptions.map((opt, i) => {
      const colors = [
        { bg: 'rgba(37, 99, 235, 0.15)', border: '#2563EB' },
        { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
        { bg: 'rgba(217, 119, 6, 0.15)', border: '#D97706' }
      ];
      const c = colors[i % colors.length];
      return {
        label: opt.material.name,
        data: [
          opt.barrier_score || 50,
          opt.shelf_life_fit || 80,
          opt.cost_score || 60,
          opt.sustainability_score || 60
        ],
        backgroundColor: c.bg,
        borderColor: c.border,
        borderWidth: opt.isPrimary ? 2 : 1.5,
        pointBackgroundColor: c.border,
      };
    })
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#E2E8F0' },
        grid: { color: '#E2E8F0' },
        pointLabels: {
          color: '#475569',
          font: { size: 11, weight: '500', family: 'Inter' }
        },
        ticks: {
          display: false,
          max: 100,
          min: 0,
          stepSize: 25
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#334155',
          font: { size: 11, family: 'Inter' },
          boxWidth: 10
        }
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
          Multi-Criteria Comparison Radar
        </span>
        <span className="text-[11px] text-slate-400">Comparing top matches</span>
      </div>
      <div className="h-64">
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
}
