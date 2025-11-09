// types.ts
export interface Filters {
  brand?: string[];
  year?: string[];
  pack_type?: string[];
  ppg?: string[];
  channel?: string[];
  groupMode?: "brand" | "ppg" | "channel";  
}


export type Tab = "Trends" | "CSF Results" | "Scenario Planning" ;


export interface FilterOption {
  label: string;
  value: string;
}
