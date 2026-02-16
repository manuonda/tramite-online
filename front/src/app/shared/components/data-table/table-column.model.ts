/**
 * Table Column Model
 * Configuration for DataTable columns
 */

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'custom';

export interface TableColumn<T = any> {
  field: keyof T | string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;

  // For badge type
  badgeSeverity?: (row: T) => 'success' | 'info' | 'warn' | 'danger' | 'secondary';

  // For custom rendering
  customRender?: (row: T) => string;

  // Date format
  dateFormat?: string;
}

export interface TableConfig {
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  globalFilterFields?: string[];
  selectionMode?: 'single' | 'multiple';
  showGridlines?: boolean;
  stripedRows?: boolean;
  responsive?: boolean;
}
