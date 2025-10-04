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
  groupMode?: "brand" | "ppg"; // 👈 added
}

// ---- Utility: build query string for normal chart endpoints ----
function buildQuery(params: Filters, includeYear = true) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== "All") search.append(key, v);
      });
    } else {
      if (value !== "All") search.append(key, value);
    }
  });

  // 👇 Inject group_by automatically
  if (includeYear) {
    search.append("group_by", "year");
  }
  search.append("group_by", params.groupMode || "brand"); // default brand

  return search.toString();
}

// ---- API Calls ----
export const fetchSalesValue = (filters: Filters = {}) =>
  api
    .get(`/sales-value?${buildQuery(filters, true)}`)
    .then((res) => res.data);

export const fetchVolumeContribution = (filters: Filters = {}) =>
  api
    .get(`/volume-contribution?${buildQuery(filters, true)}`)
    .then((res) => res.data);

export const fetchYearlySales = (filters: Filters = {}) =>
  api
    .get(`/yearly-sales?${buildQuery(filters, true)}`)
    .then((res) => res.data);

export const fetchSalesTrend = (filters: Filters = {}) =>
  api
    .get(`/trend?${buildQuery(filters, true)}`)
    .then((res) => res.data);

// ---- Market Share (⚡ no year grouping here) ----
export const fetchMarketShare = (
  metric: "sales" | "volume" = "sales",
  filters: Filters = {}
) => {
  const groupBy = filters.groupMode === "ppg" ? "ppg" : "brand"; // ✅ force grouping
  const { year, ...rest } = filters; // ✅ drop year filter
  const query = buildQuery(rest, false); // ⚡ skip year

  return api
    .get(`/market-share?metric=${metric}&group_by=${groupBy}${query ? "&" + query : ""}`)
    .then((res) => res.data);
};
