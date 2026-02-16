/**
 * Admin Footer Component
 * Simple footer for admin pages
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-footer">
      <div class="layout-footer-left">
        <span>Tramite Online</span>
      </div>
      <div class="layout-footer-right">
        <span>© {{ currentYear }} All rights reserved</span>
      </div>
    </div>
  `,
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
}
