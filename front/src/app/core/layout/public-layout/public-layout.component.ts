/**
 * Public Layout Component
 * Layout for public-facing pages (home, forms, etc.)
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicHeaderComponent, PublicFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-950">
      <app-public-header />

      <main class="flex-1">
        <router-outlet />
      </main>

      <app-public-footer />
    </div>
  `,
})
export class PublicLayoutComponent {}
