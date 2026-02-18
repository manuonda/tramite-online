import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceMemberService } from '../../services/workspace-member.service';
import { MemberListComponent } from '../components/member-list/member-list.component';
import { MemberDialogComponent, MemberDialogData } from '../components/member-dialog/member-dialog.component';
import { Workspace, getWorkspaceColor, getWorkspaceIcon } from '../../models/workspace.model';
import { WorkspaceMember } from '../../models/workspace-member.model';
import { WorkspaceRole } from '../../models/workspace-role.enum';

@Component({
  selector: 'app-workspace-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ChipModule,
    ToastModule,
    ConfirmDialogModule,
    MemberListComponent,
    MemberDialogComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceDetailComponent implements OnInit {
  private workspaceService = inject(WorkspaceService);
  private memberService = inject(WorkspaceMemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  workspace = signal<Workspace | null>(null);
  members = this.memberService.members;
  loading = signal(true);
  showMemberDialog = signal(false);
  currentUserId = signal('1'); // TODO: Get from AuthService

  canManage = computed(() => {
    // TODO: Check actual user role in workspace
    return true;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkspace(id);
      this.loadMembers(id);
    }
  }

  loadWorkspace(id: string) {
    this.loading.set(true);
    this.workspaceService.getWorkspace(id).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load workspace'
        });
        this.router.navigate(['/admin/workspaces']);
      }
    });
  }

  loadMembers(workspaceId: string) {
    this.memberService.getMembers(workspaceId).subscribe({
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load members'
        });
      }
    });
  }

  onEdit() {
    const workspace = this.workspace();
    if (workspace) {
      this.router.navigate(['/admin/workspaces', workspace.id, 'edit']);
    }
  }

  onArchive() {
    const workspace = this.workspace();
    if (!workspace) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to archive "${workspace.name}"?`,
      header: 'Archive Workspace',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.workspaceService.archiveWorkspace(workspace.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Workspace archived successfully'
            });
            this.router.navigate(['/admin/workspaces']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to archive workspace'
            });
          }
        });
      }
    });
  }

  onDelete() {
    const workspace = this.workspace();
    if (!workspace) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${workspace.name}"? This action cannot be undone.`,
      header: 'Delete Workspace',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.workspaceService.deleteWorkspace(workspace.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Workspace deleted successfully'
            });
            this.router.navigate(['/admin/workspaces']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete workspace'
            });
          }
        });
      }
    });
  }

  // Member actions
  onAddMember() {
    this.showMemberDialog.set(true);
  }

  onSubmitMember(data: MemberDialogData) {
    const workspace = this.workspace();
    if (!workspace) return;

    this.memberService.addMember(workspace.id, data.email, data.role).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member added successfully'
        });
        this.showMemberDialog.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to add member'
        });
      }
    });
  }

  onChangeRole(event: { member: WorkspaceMember; newRole: WorkspaceRole }) {
    const workspace = this.workspace();
    if (!workspace) return;

    this.memberService.updateMemberRole(workspace.id, event.member.id, event.newRole).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Member role updated successfully'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to update role'
        });
      }
    });
  }

  onRemoveMember(member: WorkspaceMember) {
    const workspace = this.workspace();
    if (!workspace) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${member.userName} from this workspace?`,
      header: 'Remove Member',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.memberService.removeMember(workspace.id, member.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Member removed successfully'
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to remove member'
            });
          }
        });
      }
    });
  }

  getWorkspaceIcon(workspace: Workspace): string {
    return getWorkspaceIcon(workspace);
  }

  getWorkspaceColor(workspace: Workspace): string {
    return getWorkspaceColor(workspace);
  }
}
