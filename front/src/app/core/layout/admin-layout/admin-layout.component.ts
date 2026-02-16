/**
 * Admin Layout Component
 * Main layout for authenticated admin pages
 * ⭐ CRITICAL COMPONENT - Foundation of admin UI
 */

import { Component, inject, OnInit, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, takeUntil, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-wrapper" [ngClass]="containerClass">
      <app-admin-topbar />

      <app-admin-sidebar />

      <div class="layout-main-container">
        <div class="layout-main">
          <router-outlet />
        </div>

        <app-admin-footer />
      </div>

      <div class="layout-mask animate-fadein"></div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  private layoutService = inject(LayoutService);
  private renderer = inject(Renderer2);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  get containerClass() {
    const layoutConfig = this.layoutService.layoutConfig();
    const layoutState = this.layoutService.layoutState();

    return {
      'layout-light': !layoutConfig.darkTheme,
      'layout-dark': layoutConfig.darkTheme,
      'layout-mobile-active': layoutState.mobileMenuActive,
      'layout-static-inactive': !layoutState.staticMenuDesktopInactive,
    };
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.hideMenu();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hideMenu(): void {
    this.layoutService.layoutState.update((state) => ({
      ...state,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      mobileMenuActive: false,
    }));
  }
}
