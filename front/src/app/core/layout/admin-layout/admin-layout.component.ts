/**
 * Admin Layout Component
 * Main layout for authenticated admin pages
 * ⭐ CRITICAL COMPONENT - Foundation of admin UI
 */

import { Component, inject, computed, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './components/admin-footer/admin-footer.component';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminTopbarComponent,
    AdminSidebarComponent,
    AdminFooterComponent,
  ],
  template: `
    <div class="layout-wrapper" [ngClass]="containerClass()">
      <app-admin-topbar />
      <app-admin-sidebar />
      <div class="layout-main-container">
        <div class="layout-main">
          <router-outlet />
        </div>
        <app-admin-footer />
      </div>
      <div class="layout-mask"></div>
    </div>
  `,
})
export class AdminLayoutComponent {
  layoutService = inject(LayoutService);

  constructor() {
    effect(() => {
      const state = this.layoutService.layoutState();
      if (state.mobileMenuActive) {
        document.body.classList.add('blocked-scroll');
      } else {
        document.body.classList.remove('blocked-scroll');
      }
    });
  }

  containerClass = computed(() => {
    const config = this.layoutService.layoutConfig();
    const state = this.layoutService.layoutState();
    return {
      'layout-overlay': config.menuMode === 'overlay',
      'layout-static': config.menuMode === 'static',
      'layout-static-inactive': state.staticMenuDesktopInactive && config.menuMode === 'static',
      'layout-overlay-active': state.overlayMenuActive,
      'layout-mobile-active': state.mobileMenuActive,
    };
  });
}
