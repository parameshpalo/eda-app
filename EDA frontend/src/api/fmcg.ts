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
  groupMode?: "brand" | "ppg";
  metric?: "sales" | "volume"; // included for trend/yearly endpoints
}

/* -------------------- Utility Functions -------------------- */

/**  Builds URLSearchParams for filters */
function buildQuery(params: Filters, includeYear = true): string {
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
  if (includeYear) search.append("group_by", "year");
  search.append("group_by", params.groupMode || "brand");

  return search.toString();
}

/** Helper for GET requests with query strings */
const get = async (endpoint: string, query: string) => {
  const { data } = await api.get(`${endpoint}?${query}`);
  return data;
};

/* -------------------- API Endpoints -------------------- */

/**  Sales Value */
export const fetchSalesValue = (filters: Filters = {}) =>
  get("/sales-value", buildQuery(filters, true));

/**  Volume Contribution */
export const fetchVolumeContribution = (filters: Filters = {}) =>
  get("/volume-contribution", buildQuery(filters, true));

/**  Yearly Sales (sales or volume metric) */
export const fetchYearlySales = (filters: Filters = {}) =>
  get("/yearly-sales", buildQuery(filters, true));

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
  const query = buildQuery(rest, false);

  const fullQuery = [`metric=${metric}`, `group_by=${groupBy}`, query]
    .filter(Boolean)
    .join("&");

  return get("/market-share", fullQuery);
};
