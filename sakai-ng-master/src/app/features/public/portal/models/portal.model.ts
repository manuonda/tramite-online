/** Máximo de secciones para usar wizard horizontal; ≥ umbral → vertical */
export const HORIZONTAL_LAYOUT_MAX_SECTIONS = 3;

export type AnswerValue = string | number | boolean | string[] | null;
export type AnswerMap   = Record<string, AnswerValue>;
export type FormLayoutMode = 'horizontal' | 'vertical';

export interface AnswerChangeEvent {
    questionId: string;
    value: AnswerValue;
}
