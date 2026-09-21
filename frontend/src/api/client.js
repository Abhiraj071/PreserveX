import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const fetchDataSourcesHealth = async () => {
  const res = await api.get('/health/sources');
  return res.data;
};

export const fetchFoods = async (category = null) => {
  const params = category ? { category } : {};
  const res = await api.get('/foods', { params });
  return res.data;
};

export const fetchFoodCategories = async () => {
  const res = await api.get('/foods/categories');
  return res.data;
};

export const searchFoods = async (query) => {
  const res = await api.get('/foods/search', { params: { q: query } });
  return res.data;
};

export const fetchAutocompleteFoods = async (query) => {
  if (!query || query.trim().length < 1) return [];
  const res = await api.get('/foods/autocomplete', { params: { q: query.trim() } });
  return res.data;
};

export const lookupBarcode = async (barcode) => {
  const res = await api.get(`/foods/barcode/${barcode}`);
  return res.data;
};

export const fetchPackagingMaterials = async (params = {}) => {
  const res = await api.get('/materials', { params });
  return res.data;
};

export const fetchWeatherReference = async (location = "Indore") => {
  const res = await api.get('/weather/reference', { params: { location } });
  return res.data;
};

export const getRecommendation = async (payload) => {
  const res = await api.post('/recommend', payload);
  return res.data;
};

export const runSimulation = async (payload) => {
  const res = await api.post('/simulate', payload);
  return res.data;
};

export const downloadPdfReport = async (recommendation) => {
  const res = await api.post('/report/pdf', recommendation, {
    responseType: 'blob',
  });
  
  // Trigger file download
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Packaging_Dossier_${recommendation.food_name.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export default api;
