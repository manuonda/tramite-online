import { Component, ViewChild, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceFormComponent } from '../components/workspace-form/workspace-form.component';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    BreadcrumbModule,
    ButtonModule,
    WorkspaceFormComponent
  ],
  providers: [MessageService],
  templateUrl: './workspace-create.component.html',
  styleUrls: ['./workspace-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceCreateComponent {
  @ViewChild('workspaceForm') workspaceForm!: WorkspaceFormComponent;

  private workspaceService = inject(WorkspaceService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(false);

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [
    { label: 'Inicio', routerLink: '/admin/dashboard', icon: 'pi pi-home' },
    { label: 'Workspaces', routerLink: '/admin/workspaces' },
    { label: 'Crear Workspace' }
  ];

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/admin/dashboard',
    title: 'Ir al inicio'
  };

  onSubmit() {
    // Trigger form submission from the child component
    if (this.workspaceForm && this.workspaceForm.workspaceForm.valid) {
      const formData = this.workspaceForm.workspaceForm.value;

      this.loading.set(true);
      this.workspaceService.createWorkspace(formData).subscribe({
        next: (workspace) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Workspace creado correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/admin/workspaces', workspace.id]);
          }, 1000);
        },
        error: (err) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'No se pudo crear el workspace'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });

      // Mark all fields as touched to show validation errors
      Object.keys(this.workspaceForm.workspaceForm.controls).forEach(key => {
        this.workspaceForm.workspaceForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.router.navigate(['/admin/workspaces']);
  }
}
