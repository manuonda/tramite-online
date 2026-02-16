/**
 * Public Footer Component
 * Minimal footer for public pages
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Company Info -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-file text-primary text-xl"></i>
              <span class="text-lg font-bold text-surface-900 dark:text-surface-0">
                Tramite Online
              </span>
            </div>
            <p class="text-surface-600 dark:text-surface-400 text-sm">
              Simplifying form management and workflow automation.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="font-semibold text-surface-900 dark:text-surface-0 mb-3">
              Quick Links
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-surface-600 dark:text-surface-400 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <!-- Social Links -->
          <div>
            <h3 class="font-semibold text-surface-900 dark:text-surface-0 mb-3">
              Follow Us
            </h3>
            <div class="flex gap-3">
              <a
                href="#"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-primary hover:text-white transition-colors"
              >
                <i class="pi pi-twitter"></i>
              </a>
              <a
                href="#"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-primary hover:text-white transition-colors"
              >
                <i class="pi pi-github"></i>
              </a>
              <a
                href="#"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-primary hover:text-white transition-colors"
              >
                <i class="pi pi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
          <p class="text-center text-surface-600 dark:text-surface-400 text-sm">
            © {{ currentYear }} Tramite Online. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
}
