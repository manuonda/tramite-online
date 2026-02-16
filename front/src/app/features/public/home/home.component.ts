/**
 * Public Home Page Component
 * Landing page for public users
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface-50 dark:bg-surface-950">
      <!-- Hero Section -->
      <section class="py-20 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-surface-900 dark:text-surface-0 mb-6">
            Simplify Your Form Management
          </h1>
          <p class="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto">
            Create, manage, and automate your forms with ease. Streamline workflows
            and boost productivity.
          </p>
          <div class="flex gap-4 justify-center">
            <p-button
              label="Get Started"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="large"
              routerLink="/auth/register"
            />
            <p-button
              label="Learn More"
              [outlined]="true"
              size="large"
              routerLink="/forms"
            />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 px-4 bg-surface-0 dark:bg-surface-900">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-surface-900 dark:text-surface-0 mb-12">
            Why Choose Tramite Online?
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-bolt text-primary text-3xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-3">
                Fast & Efficient
              </h3>
              <p class="text-surface-600 dark:text-surface-400">
                Create forms in minutes with our intuitive drag-and-drop builder.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-shield text-primary text-3xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-3">
                Secure & Reliable
              </h3>
              <p class="text-surface-600 dark:text-surface-400">
                Enterprise-grade security with role-based access control.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-users text-primary text-3xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-3">
                Team Collaboration
              </h3>
              <p class="text-surface-600 dark:text-surface-400">
                Work together seamlessly with workspace and permission management.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 px-4">
        <div class="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary to-primary-700 rounded-lg p-12">
          <h2 class="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p class="text-primary-100 mb-8 text-lg">
            Join thousands of teams already using Tramite Online.
          </p>
          <p-button
            label="Create Free Account"
            icon="pi pi-user-plus"
            severity="secondary"
            size="large"
            routerLink="/auth/register"
          />
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent {}
