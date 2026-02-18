import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { WorkspaceMember, getRoleLabel } from '../../../models/workspace-member.model';
import { WorkspaceRole, WORKSPACE_ROLE_LABELS } from '../../../models/workspace-role.enum';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ChipModule,
    AvatarModule,
    Select,
    TooltipModule
  ],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberListComponent {
  @Input() members: WorkspaceMember[] = [];
  @Input() canManage = false;
  @Input() currentUserId?: string;

  @Output() addMember = new EventEmitter<void>();
  @Output() changeRole = new EventEmitter<{ member: WorkspaceMember; newRole: WorkspaceRole }>();
  @Output() removeMember = new EventEmitter<WorkspaceMember>();

  roleOptions = Object.entries(WORKSPACE_ROLE_LABELS).map(([value, label]) => ({
    label,
    value: value as WorkspaceRole
  }));

  getRoleLabel(role: WorkspaceRole): string {
    return getRoleLabel(role);
  }

  getRoleSeverity(role: WorkspaceRole): string {
    switch (role) {
      case WorkspaceRole.OWNER:
        return 'danger';
      case WorkspaceRole.ADMIN:
        return 'warning';
      case WorkspaceRole.MEMBER:
        return 'info';
      case WorkspaceRole.VIEWER:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  onAddMember() {
    this.addMember.emit();
  }

  onChangeRole(member: WorkspaceMember, newRole: WorkspaceRole) {
    if (newRole !== member.role) {
      this.changeRole.emit({ member, newRole });
    }
  }

  onRemoveMember(member: WorkspaceMember) {
    this.removeMember.emit(member);
  }

  canChangeRole(member: WorkspaceMember): boolean {
    return this.canManage && member.role !== WorkspaceRole.OWNER && member.userId !== this.currentUserId;
  }

  canRemove(member: WorkspaceMember): boolean {
    return this.canManage && member.role !== WorkspaceRole.OWNER && member.userId !== this.currentUserId;
  }

  getAvatarLabel(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
