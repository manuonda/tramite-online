export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface EntityBase {
    id: number;
    createdAt?: string;
    updatedAt?: string;
}
