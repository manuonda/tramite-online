import {
    ChangeDetectionStrategy, Component, computed,
    inject, Input, OnInit, signal
} from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MemberService } from '../../services/member.service';
import {
    InviteMemberDto, WorkspaceMember, WorkspaceRole,
    WORKSPACE_ROLE_CONFIG, getAvatarColor
} from '../../models/member.model';

@Component({
    selector: 'app-member-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule, ReactiveFormsModule,
        ButtonModule, DialogModule, InputTextModule, ToastModule,
    ],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />

        <!-- ─── Header ─────────────────────────────────────────────────── -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/40">
                    <i class="pi pi-users text-lg"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xl font-bold text-gray-800 dark:text-white">Miembros</span>
                        <span class="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-semibold">
                            {{ members().length }} total
                        </span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Usuarios con acceso a este workspace
                    </p>
                </div>
            </div>
            <p-button
                label="Invitar miembro"
                icon="pi pi-user-plus"
                severity="warn"
                size="small"
                (onClick)="openInvite()"
            />
        </div>

        <!-- ─── Stats ──────────────────────────────────────────────────── -->
        <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="card p-4 text-center shadow-sm">
                <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ members().length }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Total</div>
            </div>
            <div class="card p-4 text-center shadow-sm border-t-2 border-emerald-400">
                <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ activeCount() }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Activos</div>
            </div>
            <div class="card p-4 text-center shadow-sm border-t-2 border-amber-400">
                <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ pendingCount() }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wide">Pendientes</div>
            </div>
        </div>

        <!-- ─── Search ─────────────────────────────────────────────────── -->
        <div class="mb-4">
            <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                <input
                    type="text"
                    pInputText
                    class="w-full pl-9 text-sm"
                    placeholder="Buscar por nombre o email..."
                    [ngModel]="searchQuery()"
                    (ngModelChange)="searchQuery.set($event)"
                />
            </div>
        </div>

        <!-- ─── Member list ────────────────────────────────────────────── -->
        @if (filteredMembers().length > 0) {
            <div class="card shadow-lg p-0 overflow-hidden">
                @for (member of filteredMembers(); track member.id; let last = $last) {
                    <div
                        class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        [class.border-b]="!last"
                        [class.border-gray-100]="!last"
                        [class.dark:border-gray-700]="!last"
                    >
                        <!-- Avatar -->
                        <div
                            class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 select-none"
                            [style.background]="member.avatarColor"
                            [style.color]="getAvatarText(member.name)"
                        >
                            {{ member.avatarInitials }}
                        </div>

                        <!-- Name + email -->
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-gray-800 dark:text-white text-sm truncate">
                                {{ member.name }}
                            </div>
                            <div class="text-xs text-gray-400 truncate">{{ member.email }}</div>
                        </div>

                        <!-- Joined date -->
                        <div class="hidden lg:block text-xs text-gray-400 flex-shrink-0 w-28 text-right">
                            desde {{ formatDate(member.joinedAt) }}
                        </div>

                        <!-- Role selector (styled as badge) -->
                        <div class="flex-shrink-0">
                            <div class="relative">
                                <select
                                    class="appearance-none pl-2.5 pr-6 py-1 text-xs font-semibold rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
                                    [style.background]="roleConfig[member.role].bg"
                                    [style.color]="roleConfig[member.role].color"
                                    [value]="member.role"
                                    (change)="onRoleChange(member.id, $event)"
                                >
                                    @for (role of roles; track role) {
                                        <option [value]="role">{{ roleConfig[role].label }}</option>
                                    }
                                </select>
                                <i
                                    class="pi pi-chevron-down absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style="font-size: 8px"
                                    [style.color]="roleConfig[member.role].color"
                                ></i>
                            </div>
                        </div>

                        <!-- Status chip -->
                        <div class="flex-shrink-0 hidden sm:block">
                            @if (member.status === 'active') {
                                <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                    Activo
                                </span>
                            } @else {
                                <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                    Pendiente
                                </span>
                            }
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-0.5 flex-shrink-0">
                            @if (member.status === 'pending') {
                                <button
                                    class="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                                    title="Reenviar invitación"
                                    (click)="resendInvitation(member.id)"
                                >
                                    <i class="pi pi-send text-sm"></i>
                                </button>
                            }
                            <button
                                class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                                title="Eliminar miembro"
                                (click)="removeMember(member)"
                            >
                                <i class="pi pi-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                }
            </div>

        } @else if (searchQuery()) {
            <!-- Search empty state -->
            <div class="card p-10 text-center shadow-sm">
                <i class="pi pi-search text-gray-300 dark:text-gray-600 text-4xl mb-3 block"></i>
                <h4 class="font-semibold text-gray-700 dark:text-gray-200 mb-1">Sin resultados</h4>
                <p class="text-sm text-gray-400">
                    No hay miembros que coincidan con
                    <span class="font-medium text-gray-600 dark:text-gray-300">"{{ searchQuery() }}"</span>.
                </p>
            </div>

        } @else {
            <!-- No members empty state -->
            <div class="card border-l-4 border-orange-400 shadow-lg">
                <div class="p-10 text-center">
                    <div class="bg-orange-50 dark:bg-orange-950/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <i class="pi pi-users text-orange-500 text-2xl"></i>
                    </div>
                    <h4 class="font-semibold text-lg text-gray-800 dark:text-white mb-1">Sin miembros adicionales</h4>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Invitá usuarios para colaborar en este workspace.
                    </p>
                    <p-button
                        label="Invitar Miembro"
                        icon="pi pi-user-plus"
                        severity="warn"
                        size="small"
                        (onClick)="openInvite()"
                    />
                </div>
            </div>
        }

        <!-- ─── Invite Dialog ──────────────────────────────────────────── -->
        <p-dialog
            [visible]="showInviteDialog()"
            (visibleChange)="showInviteDialog.set($event)"
            header="Invitar nuevo miembro"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '500px', 'max-width': '95vw' }"
        >
            <form [formGroup]="inviteForm" (ngSubmit)="submitInvite()">

                <!-- Name -->
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Nombre completo <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        pInputText
                        formControlName="name"
                        placeholder="ej. María González"
                        class="w-full text-sm"
                    />
                    @if (inviteForm.controls.name.invalid && inviteForm.controls.name.touched) {
                        <p class="text-xs text-red-500 mt-1">El nombre es requerido.</p>
                    }
                </div>

                <!-- Email -->
                <div class="mb-5">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Correo electrónico <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        pInputText
                        formControlName="email"
                        placeholder="ej. maria@municipio.gob.ar"
                        class="w-full text-sm"
                    />
                    @if (inviteForm.controls.email.invalid && inviteForm.controls.email.touched) {
                        <p class="text-xs text-red-500 mt-1">
                            @if (inviteForm.controls.email.errors?.['required']) {
                                El email es requerido.
                            } @else {
                                El formato del email no es válido.
                            }
                        </p>
                    }
                </div>

                <!-- Role cards -->
                <div class="mb-5">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Rol <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        @for (role of roles; track role) {
                            <button
                                type="button"
                                (click)="selectRole(role)"
                                class="text-left p-3 rounded-xl border-2 transition-all cursor-pointer focus:outline-none"
                                [style.border-color]="inviteRole() === role ? roleConfig[role].color : '#e5e7eb'"
                                [style.background]="inviteRole() === role ? roleConfig[role].bg : 'transparent'"
                            >
                                <div class="flex items-center gap-2 mb-0.5">
                                    <i [class]="roleConfig[role].icon + ' text-sm'" [style.color]="roleConfig[role].color"></i>
                                    <span class="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {{ roleConfig[role].label }}
                                    </span>
                                    @if (inviteRole() === role) {
                                        <span
                                            class="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                            [style.background]="roleConfig[role].color"
                                        >
                                            <i class="pi pi-check text-white" style="font-size: 8px"></i>
                                        </span>
                                    }
                                </div>
                                <p class="text-xs text-gray-400 leading-tight line-clamp-2">
                                    {{ roleConfig[role].description }}
                                </p>
                            </button>
                        }
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p-button
                        label="Cancelar"
                        severity="secondary"
                        [text]="true"
                        size="small"
                        (onClick)="closeInvite()"
                    />
                    <p-button
                        label="Enviar invitación"
                        icon="pi pi-send"
                        severity="warn"
                        size="small"
                        type="submit"
                        [disabled]="inviteForm.invalid || inviting()"
                        [loading]="inviting()"
                    />
                </div>
            </form>
        </p-dialog>
    `
})
export class MemberListComponent implements OnInit {

    @Input() workspaceId!: string;

    private readonly memberSvc  = inject(MemberService);
    private readonly msg        = inject(MessageService);
    private readonly fb         = inject(FormBuilder);

    // ─── State ──────────────────────────────────────────────────────────
    readonly members         = signal<WorkspaceMember[]>([]);
    readonly searchQuery     = signal('');
    readonly showInviteDialog = signal(false);
    readonly inviting        = signal(false);
    readonly inviteRole      = signal<WorkspaceRole>('viewer');

    // ─── Derived ────────────────────────────────────────────────────────
    readonly filteredMembers = computed(() => {
        const q = this.searchQuery().toLowerCase();
        if (!q) return this.members();
        return this.members().filter(m =>
            m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
    });

    readonly activeCount  = computed(() => this.members().filter(m => m.status === 'active').length);
    readonly pendingCount = computed(() => this.members().filter(m => m.status === 'pending').length);

    // ─── Constants ──────────────────────────────────────────────────────
    readonly roleConfig = WORKSPACE_ROLE_CONFIG;
    readonly roles: WorkspaceRole[] = ['admin', 'editor', 'operator', 'viewer'];

    // ─── Form ────────────────────────────────────────────────────────────
    readonly inviteForm = this.fb.nonNullable.group({
        name:  ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role:  ['viewer' as WorkspaceRole, Validators.required],
    });

    // ─── Lifecycle ───────────────────────────────────────────────────────
    ngOnInit(): void {
        this.refreshMembers();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────
    private refreshMembers(): void {
        this.members.set(this.memberSvc.getMembersForWorkspace(this.workspaceId));
    }

    getAvatarText(name: string): string {
        return getAvatarColor(name).text;
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    // ─── Member actions ───────────────────────────────────────────────────
    onRoleChange(memberId: string, event: Event): void {
        const role = (event.target as HTMLSelectElement).value as WorkspaceRole;
        this.memberSvc.changeRole(memberId, role);
        this.refreshMembers();
        this.msg.add({ severity: 'success', summary: 'Rol actualizado', life: 2500 });
    }

    removeMember(member: WorkspaceMember): void {
        this.memberSvc.removeMember(member.id);
        this.refreshMembers();
        this.msg.add({ severity: 'info', summary: `${member.name} eliminado`, life: 2500 });
    }

    resendInvitation(memberId: string): void {
        this.memberSvc.resendInvitation(memberId);
        this.msg.add({ severity: 'success', summary: 'Invitación reenviada', life: 2500 });
    }

    // ─── Invite dialog ────────────────────────────────────────────────────
    openInvite(): void {
        this.inviteForm.reset({ name: '', email: '', role: 'viewer' });
        this.inviteRole.set('viewer');
        this.showInviteDialog.set(true);
    }

    closeInvite(): void {
        this.showInviteDialog.set(false);
    }

    selectRole(role: WorkspaceRole): void {
        this.inviteRole.set(role);
        this.inviteForm.controls.role.setValue(role);
    }

    submitInvite(): void {
        if (this.inviteForm.invalid) return;
        this.inviting.set(true);
        const dto = this.inviteForm.getRawValue() as InviteMemberDto;
        // Simulate network latency (replace with http.post in Phase 3)
        setTimeout(() => {
            this.memberSvc.invite(this.workspaceId, dto);
            this.refreshMembers();
            this.inviting.set(false);
            this.showInviteDialog.set(false);
            this.msg.add({
                severity: 'success',
                summary: 'Invitación enviada',
                detail: `Se invitó a ${dto.email} como ${this.roleConfig[dto.role].label}`,
                life: 3500,
            });
        }, 600);
    }
}
