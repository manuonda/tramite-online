/**
 * Admin Topbar Component
 * Adapted from existing app.topbar.ts with auth integration
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../../../../layout/service/layout.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { getUserInitials } from '../../../../auth/models/user.model';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button
          class="layout-menu-button layout-topbar-action"
          (click)="layoutService.onMenuToggle()"
        >
          <i class="pi pi-bars"></i>
        </button>
        <a class="layout-topbar-logo" routerLink="/admin/dashboard">
          <i class="pi pi-file text-3xl"></i>
          <span>Tramite Online</span>
        </a>
      </div>

      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <button
            type="button"
            class="layout-topbar-action"
            (click)="toggleDarkMode()"
          >
            <i
              [ngClass]="{
                pi: true,
                'pi-moon': layoutService.isDarkTheme(),
                'pi-sun': !layoutService.isDarkTheme()
              }"
            ></i>
          </button>
        </div>

        <!-- User Profile Menu -->
        @if (authService.currentUser(); as user) {
          <div class="relative">
            <button
              type="button"
              class="layout-topbar-action flex items-center gap-2"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
            >
              <p-avatar
                [label]="getUserInitials(user)"
                shape="circle"
                styleClass="bg-primary text-white"
              />
              <span class="hidden lg:inline-block">{{ user.firstName }}</span>
              <i class="pi pi-chevron-down text-xs"></i>
            </button>

            <div
              class="hidden absolute right-0 mt-2 w-48 bg-surface-0 dark:bg-surface-800 rounded-md shadow-lg border border-surface-200 dark:border-surface-700 z-50"
            >
              <div class="p-3 border-b border-surface-200 dark:border-surface-700">
                <p class="font-semibold text-surface-900 dark:text-surface-0">
                  {{ user.firstName }} {{ user.lastName }}
                </p>
                <p class="text-sm text-surface-600 dark:text-surface-400">
                  {{ user.email }}
                </p>
              </div>
              <div class="p-2">
                <button
                  class="w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md flex items-center gap-2"
                  (click)="navigateToProfile()"
                >
                  <i class="pi pi-user"></i>
                  <span>Profile</span>
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md flex items-center gap-2"
                  (click)="navigateToSettings()"
                >
                  <i class="pi pi-cog"></i>
                  <span>Settings</span>
                </button>
                <hr class="my-2 border-surface-200 dark:border-surface-700" />
                <button
                  class="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2"
                  (click)="logout()"
                >
                  <i class="pi pi-sign-out"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminTopbarComponent {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  private router = inject(Router);

  getUserInitials = getUserInitials;

  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  navigateToProfile(): void {
    this.router.navigate(['/admin/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  logout(): void {
    this.authService.logout();
  }
}
