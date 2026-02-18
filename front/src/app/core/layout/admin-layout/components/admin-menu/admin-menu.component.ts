/**
 * Admin Menu Component
 * Menu configuration for admin routes with permission filtering
 */

import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../../../../../layout/component/app.menuitem';
import { PermissionService } from '../../../../auth/services/permission.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (item of filteredModel(); track item.label) {
        @if (!item.separator) {
          <li app-menuitem [item]="item" [root]="true"></li>
        } @else {
          <li class="menu-separator"></li>
        }
      }
    </ul>
  `,
})
export class AdminMenuComponent {
  private permissionService = inject(PermissionService);

  // Base menu model
  private get baseModel(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        items: [
          {
            label: 'Overview',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/admin/dashboard'],
          },
        ],
      },
      {
        label: 'Workspaces',
        items: [
          {
            label: 'My Workspaces',
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/admin/workspaces'],
            visible: this.permissionService.hasPermission('workspace', 'read'),
          },
          {
            label: 'Create Workspace',
            icon: 'pi pi-fw pi-plus',
            routerLink: ['/admin/workspaces/create'],
            visible: this.permissionService.hasPermission('workspace', 'create'),
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: 'Forms',
        items: [
          {
            label: 'All Forms',
            icon: 'pi pi-fw pi-file',
            routerLink: ['/admin/forms'],
            visible: this.permissionService.hasPermission('form', 'read'),
          },
          {
            label: 'Create Form',
            icon: 'pi pi-fw pi-file-plus',
            routerLink: ['/admin/forms/create'],
            visible: this.permissionService.hasPermission('form', 'create'),
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: 'Settings',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/admin/profile'],
          },
          {
            label: 'Account Settings',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/admin/settings'],
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: 'Administration',
        visible: this.permissionService.isAdmin(),
        items: [
          {
            label: 'Users',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/admin/users'],
          },
          {
            label: 'Roles & Permissions',
            icon: 'pi pi-fw pi-shield',
            routerLink: ['/admin/roles'],
          },
          {
            label: 'System Logs',
            icon: 'pi pi-fw pi-list',
            routerLink: ['/admin/logs'],
          },
        ],
      },
    ];
  }

  /**
   * Filter menu items based on visibility function
   */
  filteredModel = computed(() => {
    return this.filterMenuItems(this.baseModel);
  });

  private filterMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .map((item) => {
        // Check visibility
        if (item.visible !== undefined && !item.visible) {
          return null;
        }

        // Recursively filter child items
        if (item.items) {
          const filteredItems = this.filterMenuItems(item.items);
          return {
            ...item,
            items: filteredItems,
          };
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null)
      .filter((item) => {
        // Remove sections with no visible children
        if (item.items && item.items.length === 0) {
          return false;
        }
        return true;
      });
  }
}
