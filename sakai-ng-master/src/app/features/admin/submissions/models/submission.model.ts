export type SubmissionStatus = 'pending' | 'reviewed' | 'processed' | 'rejected';

export interface SubmissionAnswer {
    questionId: string;
    questionLabel: string;
    questionType: string;
    value: string | number | boolean | string[] | null;
}

export interface Submission {
    id: string;
    workspaceId: string;
    workspaceName: string;
    formId: string;
    formName: string;
    submittedBy: string;
    submittedAt: string;
    status: SubmissionStatus;
    answers: SubmissionAnswer[];
    notes?: string;
}

export interface SubmissionFilter {
    workspaceId: string;
    formId: string;
    status: SubmissionStatus | '';
    search: string;
    dateFrom: string;
    dateTo: string;
}

export interface SubmissionStatusConfig {
    label: string;
    severity: 'warn' | 'info' | 'success' | 'danger';
    icon: string;
    color: string;
    bg: string;
}

export const SUBMISSION_STATUS_CONFIG: Record<SubmissionStatus, SubmissionStatusConfig> = {
    pending:   { label: 'Pendiente',  severity: 'warn',    icon: 'pi pi-clock',        color: '#d97706', bg: '#fef3c7' },
    reviewed:  { label: 'Revisada',   severity: 'info',    icon: 'pi pi-eye',          color: '#2563eb', bg: '#dbeafe' },
    processed: { label: 'Procesada',  severity: 'success', icon: 'pi pi-check-circle', color: '#059669', bg: '#d1fae5' },
    rejected:  { label: 'Rechazada',  severity: 'danger',  icon: 'pi pi-times-circle', color: '#dc2626', bg: '#fee2e2' },
};
