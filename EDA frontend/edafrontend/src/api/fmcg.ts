import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/fmcg",
});

export interface Filters {
  brand?: string[];
  year?: string[];
  pack_type?: string[];
  ppg?: string[];
  channel?: string[];
}

// Utility: build query string from filters
// Utility: build query string from filters
function buildQuery(params: Filters) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      // multiple selections → repeat query param
      value.forEach((v) => {
        if (v !== "All") search.append(key, v);
      });
    } else {
      // fallback (in case some filter is still a string)
      if (value !== "All") search.append(key, value);
    }
  });
  console.log(search.toString())
  return search.toString();
}


export const fetchSalesValue = (filters: Filters = {}) =>
  api.get(`/sales-value${buildQuery(filters) ? "?" + buildQuery(filters) : ""}`).then(res => res.data);

export const fetchVolumeContribution = (filters: Filters = {}) =>
  api.get(`/volume-contribution${buildQuery(filters) ? "?" + buildQuery(filters) : ""}`).then(res => res.data);

export const fetchYearlySales = (filters: Filters = {}) =>
  api.get(`/yearly-sales${buildQuery(filters) ? "?" + buildQuery(filters) : ""}`).then(res => res.data);

export const fetchSalesTrend = (filters: Filters = {}) =>
  api.get(`/trend${buildQuery(filters) ? "?" + buildQuery(filters) : ""}`).then(res => res.data);

export const fetchMarketShare = (metric: string = "sales", filters: Filters = {}) => {
  const query = buildQuery(filters);
  return api.get(`/market-share?metric=${metric}${query ? "&" + query : ""}`).then(res => res.data);
};
