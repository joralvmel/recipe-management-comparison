export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  label: string;
  id: string;
  options: FilterOption[];
}
