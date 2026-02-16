/**
 * Common Models
 * Shared types and interfaces used across the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for list queries
 */
export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Selection state for data tables
 */
export interface SelectionState<T> {
  selected: T[];
  selectAll: boolean;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation errors from API
 */
export interface ValidationErrors {
  fields: FieldError[];
  message: string;
}

/**
 * Toast message configuration
 */
export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}

/**
 * Confirm dialog configuration
 */
export interface ConfirmDialogConfig {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

/**
 * Date range filter
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Key-value pair
 */
export interface KeyValue<T = any> {
  key: string;
  value: T;
}

/**
 * Option for dropdowns/selects
 */
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}
