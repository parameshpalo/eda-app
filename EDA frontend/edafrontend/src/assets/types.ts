// types.ts
export interface Filters {
  brand?: string;
  year?: string;
  pack_type?: string;
  ppg?: string;
  channel?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}
