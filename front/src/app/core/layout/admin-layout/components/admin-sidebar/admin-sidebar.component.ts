/**
 * Admin Sidebar Component
 * Adapted from existing app.sidebar.ts
 */

import {
  Component,
  inject,
  ElementRef,
  OnInit,
  OnDestroy,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { LayoutService } from '../../../../../layout/service/layout.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [AdminMenuComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-sidebar">
      <app-admin-menu />
    </div>
  `,
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private el = inject(ElementRef);

  private outsideClickListener: ((event: MouseEvent) => void) | null = null;
  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      const state = this.layoutService.layoutState();

      if (this.layoutService.isDesktop()) {
        if (state.overlayMenuActive) {
          this.bindOutsideClickListener();
        } else {
          this.unbindOutsideClickListener();
        }
      } else {
        if (state.mobileMenuActive) {
          this.bindOutsideClickListener();
        } else {
          this.unbindOutsideClickListener();
        }
      }
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.onRouteChange(navEvent.urlAfterRedirects);
      });

    this.onRouteChange(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unbindOutsideClickListener();
  }

  private onRouteChange(path: string): void {
    this.layoutService.layoutState.update((val) => ({
      ...val,
      activePath: path,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      mobileMenuActive: false,
      menuHoverActive: false,
    }));
  }

  private bindOutsideClickListener(): void {
    if (!this.outsideClickListener) {
      this.outsideClickListener = (event: MouseEvent) => {
        if (this.isOutsideClicked(event)) {
          this.layoutService.layoutState.update((val) => ({
            ...val,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            mobileMenuActive: false,
            menuHoverActive: false,
          }));
        }
      };

      document.addEventListener('click', this.outsideClickListener);
    }
  }

  private unbindOutsideClickListener(): void {
    if (this.outsideClickListener) {
      document.removeEventListener('click', this.outsideClickListener);
      this.outsideClickListener = null;
    }
  }

  private isOutsideClicked(event: MouseEvent): boolean {
    const topbarButtonEl = document.querySelector('.layout-menu-button');
    const sidebarEl = this.el.nativeElement;

    return !(
      sidebarEl?.isSameNode(event.target as Node) ||
      sidebarEl?.contains(event.target as Node) ||
      topbarButtonEl?.isSameNode(event.target as Node) ||
      topbarButtonEl?.contains(event.target as Node)
    );
  }
}
