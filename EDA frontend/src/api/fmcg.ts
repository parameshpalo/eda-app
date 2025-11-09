import axios from "axios";
import { getAuthToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:8000/api/fmcg",
  // baseURL : "https://eda-app-068n.onrender.com/api/fmcg"
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Filters {
  brand?: string[];
  year?: string[];
  pack_type?: string[];
  ppg?: string[];
  channel?: string[];
  groupMode?: "brand" | "ppg" | "channel";
  metric?: "sales" | "volume"; // included for trend/yearly endpoints
}

/* -------------------- Utility Functions -------------------- */

/**  Builds URLSearchParams for filters */
function buildQuery(params: Filters, includeGroupBy = true, includeMonth : boolean = false,includedYear = true): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value
        .filter((v) => v !== "All")
        .forEach((v) => search.append(key, v));
    } else if (value !== "All") {
      search.append(key, value);
    }
  });

  // Include grouping
  if (includedYear)  search.append("group_by", "year");
  if (includeMonth) search.append("group_by", "month");
  if(params.groupMode && includeGroupBy) search.append("group_by", params.groupMode);

  return search.toString();
}

/** Helper for GET requests with query strings */
const get = async (endpoint: string, query: string) => {
  const { data } = await api.get(`${endpoint}?${query}`);
  return data;
};

/* -------------------- API Endpoints -------------------- */


/** Generic Aggregation Fetcher */
export const fetchAggregate = (
  metric: "sales" | "volume" = "sales",
  filters: Filters = {},
  includeGroupBy = true,
  includeMonth = false,
  includedYear = true,
) => {
  const query = buildQuery(filters, includeGroupBy,includeMonth,includedYear);
  const fullQuery = [`metric=${metric}`, query].filter(Boolean).join("&");
  return get("/aggregate", fullQuery);
};


/**  Sales or Volume Trend (with year + month grouping) */
export const fetchSalesTrend = (filters: Filters = {}) => {
  const groupBy = ["year", "month", filters.groupMode || "brand"];
  const query = buildQuery(filters, false);
  const metric = filters.metric || "sales";

  const fullQuery = [
    `metric=${metric}`,
    ...groupBy.map((g) => `group_by=${g}`),
    query,
  ]
    .filter(Boolean)
    .join("&");

  return get("/trend", fullQuery);
};

/**  Market Share ( no year grouping) */
export const fetchMarketShare = (
  metric: "sales" | "volume" = "sales",
  filters: Filters = {}
) => {
  const groupBy = filters.groupMode === "ppg" ? "ppg" : "brand";
  const { year, ...rest } = filters;
  const query = buildQuery(rest,true,false,false);

  const fullQuery = [`metric=${metric}`, `group_by=${groupBy}`, query]
    .filter(Boolean)
    .join("&");

  return get("/market-share", fullQuery);
};


/** Aggregate statistics (min, max, sum, avg, count) without grouping */
export const fetchAggregateStats = (
  metric: "sales" | "volume" = "sales",
  filters: Filters = {}
) => {
  // No grouping or time breakdown for this endpoint
  const query = buildQuery(filters, false, false, false);
  const fullQuery = [`metric=${metric}`, query].filter(Boolean).join("&");
  return get("/aggregate-stats", fullQuery);
};







// /**  Sales Value */
// export const fetchSalesValue = (filters: Filters = {}) =>
//   get("/sales-value", buildQuery(filters, true));

// /**  Volume Contribution */
// export const fetchVolumeContribution = (filters: Filters = {}) =>
//   get("/volume-contribution", buildQuery(filters, true));

// /**  Yearly Sales (sales or volume metric) */
// export const fetchYearlySales = (filters: Filters = {}) =>
//   get("/yearly-sales", buildQuery(filters, true));
