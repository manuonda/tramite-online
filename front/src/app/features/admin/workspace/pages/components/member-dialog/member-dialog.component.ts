import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { WorkspaceRole, WORKSPACE_ROLE_LABELS } from '../../../models/workspace-role.enum';

export interface MemberDialogData {
  email: string;
  role: WorkspaceRole;
}

@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Dialog,
    InputTextModule,
    Select,
    ButtonModule
  ],
  templateUrl: './member-dialog.component.html',
  styleUrls: ['./member-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberDialogComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submit = new EventEmitter<MemberDialogData>();

  form!: FormGroup;

  roleOptions = Object.entries(WORKSPACE_ROLE_LABELS)
    .filter(([value]) => value !== WorkspaceRole.OWNER) // Can't directly assign owner role
    .map(([value, label]) => ({
      label,
      value: value as WorkspaceRole,
      description: this.getRoleDescription(value as WorkspaceRole)
    }));

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [WorkspaceRole.MEMBER, Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value as MemberDialogData);
      this.closeDialog();
      this.form.reset({ role: WorkspaceRole.MEMBER });
    }
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  get emailControl() {
    return this.form.get('email');
  }

  private getRoleDescription(role: WorkspaceRole): string {
    switch (role) {
      case WorkspaceRole.ADMIN:
        return 'Can manage workspace, members, and all forms';
      case WorkspaceRole.MEMBER:
        return 'Can create and manage their own forms';
      case WorkspaceRole.VIEWER:
        return 'Can only view forms';
      default:
        return '';
    }
  }
}
