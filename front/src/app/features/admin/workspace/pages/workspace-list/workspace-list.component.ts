import { Component, OnInit, ViewChild, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Menu, MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace, getWorkspaceColor, getWorkspaceIcon } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    CheckboxModule,
    ChipModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    MenuModule,
    BreadcrumbModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './workspace-list.component.html',
  styleUrls: ['./workspace-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceListComponent implements OnInit {
  @ViewChild('contextMenu') contextMenu!: Menu;

  private workspaceService = inject(WorkspaceService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Breadcrumb items
  breadcrumbItems: MenuItem[] = [
    { label: 'Inicio', routerLink: '/admin/dashboard', icon: 'pi pi-home' },
    { label: 'Workspaces' }
  ];

  workspaces = this.workspaceService.workspaces;
  loading = signal(false);
  searchQuery = signal('');
  showArchived = signal(false);
  filtersExpanded = signal(false);
  selectedWorkspaces = signal<Workspace[]>([]);
  menuItems: MenuItem[] = [];

  // Computed filtered workspaces
  filteredWorkspaces = computed(() => {
    let filtered = this.workspaces();

    // Filter by archived status
    if (!this.showArchived()) {
      filtered = filtered.filter(w => !w.isArchived);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.loading.set(true);
    this.workspaceService.getWorkspaces().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los workspaces'
        });
      }
    });
  }

  toggleFilters() {
    this.filtersExpanded.set(!this.filtersExpanded());
  }

  onExport() {
    // TODO: Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad de exportación próximamente'
    });
  }

  onView(workspace: Workspace) {
    this.router.navigate(['/admin/workspaces', workspace.id]);
  }

  onEdit(workspace: Workspace) {
    this.router.navigate(['/admin/workspaces', workspace.id, 'edit']);
  }

  onArchive(workspace: Workspace) {
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

  onDelete(workspace: Workspace) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar permanentemente "${workspace.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar Workspace',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.workspaceService.deleteWorkspace(workspace.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Workspace eliminado correctamente'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el workspace'
            });
          }
        });
      }
    });
  }

  showMenu(event: Event, workspace: Workspace) {
    this.menuItems = [
      {
        label: 'Ver detalles',
        icon: 'pi pi-eye',
        command: () => this.onView(workspace)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.onEdit(workspace)
      },
      {
        separator: true
      },
      {
        label: workspace.isArchived ? 'Desarchivar' : 'Archivar',
        icon: 'pi pi-inbox',
        command: () => this.onArchive(workspace)
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.onDelete(workspace)
      }
    ];
    this.contextMenu.toggle(event);
  }

  onCreate() {
    this.router.navigate(['/admin/workspaces/create']);
  }

  getWorkspaceIcon(workspace: Workspace): string {
    return getWorkspaceIcon(workspace);
  }

  getWorkspaceColor(workspace: Workspace): string {
    return getWorkspaceColor(workspace);
  }
}
