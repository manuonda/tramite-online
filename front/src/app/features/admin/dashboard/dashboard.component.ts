/**
 * Admin Dashboard Component
 * Main dashboard for authenticated users
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../../core/auth/services/auth.service';
import { getUserFullName } from '../../../core/auth/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      <!-- Welcome Card -->
      <div class="col-12">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                @if (authService.currentUser(); as user) {
                  Welcome back, {{ getUserFullName(user) }}!
                }
              </h2>
              <p class="text-surface-600 dark:text-surface-400">
                Here's what's happening with your projects today.
              </p>
            </div>
            <i class="pi pi-home text-6xl text-primary/20"></i>
          </div>
        </p-card>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 md:col-6 lg:col-3">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <span class="block text-surface-600 dark:text-surface-400 font-medium mb-2">
                Workspaces
              </span>
              <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                5
              </div>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <i class="pi pi-briefcase text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <span class="block text-surface-600 dark:text-surface-400 font-medium mb-2">
                Forms
              </span>
              <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                12
              </div>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <i class="pi pi-file text-green-600 dark:text-green-400 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <span class="block text-surface-600 dark:text-surface-400 font-medium mb-2">
                Submissions
              </span>
              <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                48
              </div>
            </div>
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <i class="pi pi-inbox text-orange-600 dark:text-orange-400 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <span class="block text-surface-600 dark:text-surface-400 font-medium mb-2">
                Team Members
              </span>
              <div class="text-3xl font-bold text-surface-900 dark:text-surface-0">
                8
              </div>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <i class="pi pi-users text-purple-600 dark:text-purple-400 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 lg:col-6">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-4 border-b border-surface-200 dark:border-surface-700">
              <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
                Quick Actions
              </h3>
            </div>
          </ng-template>
          <div class="flex flex-col gap-3">
            <p-button
              label="Create New Workspace"
              icon="pi pi-plus"
              [outlined]="true"
              styleClass="w-full"
            />
            <p-button
              label="Create New Form"
              icon="pi pi-file-plus"
              [outlined]="true"
              styleClass="w-full"
            />
            <p-button
              label="View All Forms"
              icon="pi pi-list"
              [outlined]="true"
              styleClass="w-full"
            />
          </div>
        </p-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 lg:col-6">
        <p-card>
          <ng-template pTemplate="header">
            <div class="p-4 border-b border-surface-200 dark:border-surface-700">
              <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0">
                Recent Activity
              </h3>
            </div>
          </ng-template>
          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-file text-primary"></i>
              </div>
              <div>
                <p class="font-medium text-surface-900 dark:text-surface-0">
                  New form created
                </p>
                <p class="text-sm text-surface-600 dark:text-surface-400">
                  "Customer Feedback" - 2 hours ago
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-check text-green-600"></i>
              </div>
              <div>
                <p class="font-medium text-surface-900 dark:text-surface-0">
                  Form submitted
                </p>
                <p class="text-sm text-surface-600 dark:text-surface-400">
                  "Registration Form" - 5 hours ago
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-users text-blue-600"></i>
              </div>
              <div>
                <p class="font-medium text-surface-900 dark:text-surface-0">
                  New member added
                </p>
                <p class="text-sm text-surface-600 dark:text-surface-400">
                  John Doe joined "Marketing Team" - 1 day ago
                </p>
              </div>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);
  getUserFullName = getUserFullName;
}
