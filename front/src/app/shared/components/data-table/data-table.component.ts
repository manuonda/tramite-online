/**
 * Data Table Component
 * Reusable table component with common features
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableColumn, TableConfig } from './table-column.model';
import { formatDate } from '../../utils/helpers';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-table
      [value]="data"
      [columns]="visibleColumns"
      [paginator]="config.paginator ?? true"
      [rows]="config.rows ?? 10"
      [rowsPerPageOptions]="config.rowsPerPageOptions ?? [5, 10, 25, 50]"
      [globalFilterFields]="config.globalFilterFields"
      [selectionMode]="config.selectionMode"
      [showGridlines]="config.showGridlines ?? false"
      [stripedRows]="config.stripedRows ?? true"
      [responsive]="config.responsive ?? true"
      [(selection)]="selection"
      (selectionChange)="selectionChange.emit($event)"
      [loading]="loading"
      styleClass="p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          @for (col of visibleColumns; track col.field) {
            <th
              [pSortableColumn]="col.sortable ? col.field : null"
              [style.width]="col.width"
              [style.text-align]="col.align || 'left'"
            >
              {{ col.header }}
              @if (col.sortable) {
                <p-sortIcon [field]="col.field" />
              }
            </th>
          }
          @if (hasActions) {
            <th style="width: 150px; text-align: center">Actions</th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr>
          @for (col of visibleColumns; track col.field) {
            <td [style.text-align]="col.align || 'left'">
              @switch (col.type) {
                @case ('badge') {
                  <p-tag
                    [value]="getFieldValue(row, col.field)"
                    [severity]="col.badgeSeverity ? col.badgeSeverity(row) : 'info'"
                  />
                }
                @case ('date') {
                  {{ formatDateValue(getFieldValue(row, col.field), col.dateFormat) }}
                }
                @case ('boolean') {
                  <i
                    [class]="
                      getFieldValue(row, col.field)
                        ? 'pi pi-check text-green-500'
                        : 'pi pi-times text-red-500'
                    "
                  ></i>
                }
                @case ('custom') {
                  @if (col.customRender) {
                    {{ col.customRender(row) }}
                  }
                }
                @default {
                  {{ getFieldValue(row, col.field) }}
                }
              }
            </td>
          }
          @if (hasActions) {
            <td style="text-align: center">
              <ng-content select="[actions]" />
            </td>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="visibleColumns.length + (hasActions ? 1 : 0)">
            <div class="text-center py-8 text-surface-500">
              <i class="pi pi-inbox text-4xl mb-3"></i>
              <p>{{ emptyMessage }}</p>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class DataTableComponent<T = any> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() config: TableConfig = {};
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No records found';
  @Input() hasActions: boolean = false;
  @Input() selection: T | T[] | null = null;

  @Output() selectionChange = new EventEmitter<T | T[]>();

  get visibleColumns(): TableColumn<T>[] {
    return this.columns.filter((col) => !col.hidden);
  }

  getFieldValue(row: T, field: string | keyof T): any {
    const keys = String(field).split('.');
    let value: any = row;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    return value;
  }

  formatDateValue(value: any, format?: string): string {
    if (!value) return '';
    return formatDate(value, format || 'yyyy-MM-dd HH:mm');
  }
}
