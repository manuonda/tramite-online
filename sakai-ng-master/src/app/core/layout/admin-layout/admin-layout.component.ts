import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppTopbar } from '@/app/layout/component/app.topbar';
import { AppSidebar } from '@/app/layout/component/app.sidebar';
import { AppFooter } from '@/app/layout/component/app.footer';
import { AdminBreadcrumbComponent } from '../admin-breadcrumb/admin-breadcrumb.component';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'app-admin-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AppTopbar, AppSidebar, RouterModule, AppFooter, AdminBreadcrumbComponent],
    template: `
        <div class="layout-wrapper" [class]="containerClass()">
            <app-topbar />
            <app-sidebar />
            <div class="layout-main-container">
                <div class="layout-main">
                    <app-admin-breadcrumb />
                    <router-outlet />
                </div>
                <app-footer />
            </div>
            <div class="layout-mask"></div>
        </div>
    `
})
export class AdminLayoutComponent {
    readonly layoutService = inject(LayoutService);

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
        const classes: string[] = ['layout-wrapper'];
        if (config.menuMode === 'overlay') classes.push('layout-overlay');
        if (config.menuMode === 'static') classes.push('layout-static');
        if (state.staticMenuDesktopInactive && config.menuMode === 'static') classes.push('layout-static-inactive');
        if (state.overlayMenuActive) classes.push('layout-overlay-active');
        if (state.mobileMenuActive) classes.push('layout-mobile-active');
        return classes.join(' ');
    });
}
