import { Component, OnInit, ViewChild, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceFormComponent } from '../components/workspace-form/workspace-form.component';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ToastModule,
    BreadcrumbModule,
    ConfirmDialogModule,
    WorkspaceFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './workspace-edit.component.html',
  styleUrls: ['./workspace-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceEditComponent implements OnInit {
  @ViewChild('workspaceForm') workspaceForm!: WorkspaceFormComponent;

  private workspaceService = inject(WorkspaceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  workspace = signal<Workspace | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal(false);

  // Computed signals
  isLoading = computed(() => this.loading());
  hasError = computed(() => this.error());

  // Breadcrumb dinámico
  breadcrumbItems = computed<MenuItem[]>(() => {
    const ws = this.workspace();
    return [
      { label: 'Inicio', routerLink: '/admin/dashboard', icon: 'pi pi-home' },
      { label: 'Workspaces', routerLink: '/admin/workspaces' },
      { label: ws ? ws.name : 'Editar Workspace' }
    ];
  });

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/admin/dashboard',
    title: 'Ir al inicio'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkspace(id);
    }
  }

  loadWorkspace(id: string) {
    this.loading.set(true);
    this.error.set(false);

    this.workspaceService.getWorkspace(id).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(true);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el workspace'
        });
      }
    });
  }

  onSubmit() {
    const workspace = this.workspace();
    if (!workspace) return;

    // Validate form
    if (this.workspaceForm && this.workspaceForm.workspaceForm.valid) {
      const formData = this.workspaceForm.workspaceForm.value;

      this.saving.set(true);
      this.workspaceService.updateWorkspace(workspace.id, formData).subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Workspace actualizado correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/admin/workspaces', updated.id]);
          }, 1000);
        },
        error: (err) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'No se pudo actualizar el workspace'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });

      // Mark all fields as touched
      Object.keys(this.workspaceForm.workspaceForm.controls).forEach(key => {
        this.workspaceForm.workspaceForm.get(key)?.markAsTouched();
      });
    }
  }

  onArchive() {
    const workspace = this.workspace();
    if (!workspace) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de archivar "${workspace.name}"?`,
      header: 'Archivar Workspace',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, archivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.workspaceService.archiveWorkspace(workspace.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Workspace archivado correctamente'
            });
            this.router.navigate(['/admin/workspaces']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo archivar el workspace'
            });
          }
        });
      }
    });
  }

  onCancel() {
    const workspace = this.workspace();
    if (workspace) {
      this.router.navigate(['/admin/workspaces', workspace.id]);
    } else {
      this.router.navigate(['/admin/workspaces']);
    }
  }
}
