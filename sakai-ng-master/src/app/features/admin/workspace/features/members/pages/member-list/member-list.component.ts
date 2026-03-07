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
    InviteMemberDto, MemberStatus, UpdateMemberDto, WorkspaceMember, WorkspaceRole,
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
                <div class="bg-linear-to-br from-orange-500 to-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/40">
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

        <!-- ─── Search ─────────────────────────────────────────────────── -->
        <div class="mb-4">
            <div class="relative">
                <span class="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none z-10">
                    <i class="pi pi-search text-gray-400 text-sm"></i>
                </span>
                <input
                    type="text"
                    pInputText
                    class="w-full pl-10 text-sm"
                    placeholder="Buscar por nombre o email..."
                    [ngModel]="searchQuery()"
                    (ngModelChange)="onSearchQueryChange($event)"
                />
            </div>
        </div>

        <!-- ─── Member list ────────────────────────────────────────────── -->
        @if (filteredMembers().length > 0) {
            <div class="card shadow-lg p-0 overflow-hidden">
                @for (member of paginatedMembers(); track member.id; let last = $last) {
                    <div
                        class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        [class.border-b]="!last"
                        [class.border-gray-100]="!last"
                        [class.dark:border-gray-700]="!last"
                    >
                        <!-- Avatar -->
                        <div
                            class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
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
                        <div class="hidden lg:block text-xs text-gray-400 shrink-0 w-28 text-right">
                            desde {{ formatDate(member.joinedAt) }}
                        </div>

                        <!-- Role selector (styled as badge) -->
                        <div class="shrink-0">
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
                        <div class="shrink-0 hidden sm:block">
                            @if (member.status === 'active') {
                                <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    Activo
                                </span>
                            } @else {
                                <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                    Pendiente
                                </span>
                            }
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-1 shrink-0">
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
                                class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                title="Editar miembro"
                                (click)="openEdit(member)"
                            >
                                <i class="pi pi-pencil text-sm"></i>
                            </button>
                            <button
                                class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 transition-colors"
                                title="Eliminar miembro"
                                (click)="removeMember(member)"
                            >
                                <i class="pi pi-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                }
            </div>
            <div class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-3 px-1">
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    Mostrando {{ pageStart() }}-{{ pageEnd() }} de {{ filteredMembers().length }} miembros
                </div>
                <div class="flex items-center gap-1.5">
                    <button
                        class="px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        [disabled]="currentPage() === 1"
                        (click)="goToPreviousPage()"
                    >
                        Anterior
                    </button>
                    @for (page of pages(); track page) {
                        <button
                            class="w-8 h-8 text-xs rounded-md border transition-colors"
                            [class.border-orange-500]="currentPage() === page"
                            [class.bg-orange-500]="currentPage() === page"
                            [class.text-white]="currentPage() === page"
                            [class.border-gray-200]="currentPage() !== page"
                            [class.dark:border-gray-700]="currentPage() !== page"
                            [class.text-gray-600]="currentPage() !== page"
                            [class.dark:text-gray-300]="currentPage() !== page"
                            [class.hover:bg-gray-50]="currentPage() !== page"
                            [class.dark:hover:bg-gray-800]="currentPage() !== page"
                            (click)="goToPage(page)"
                        >
                            {{ page }}
                        </button>
                    }
                    <button
                        class="px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        [disabled]="currentPage() === totalPages()"
                        (click)="goToNextPage()"
                    >
                        Siguiente
                    </button>
                </div>
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
                                            class="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0"
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

        <!-- ─── Edit Dialog ─────────────────────────────────────────────── -->
        <p-dialog
            [visible]="showEditDialog()"
            (visibleChange)="showEditDialog.set($event)"
            header="Editar miembro"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '500px', 'max-width': '95vw' }"
        >
            <form [formGroup]="editForm" (ngSubmit)="submitEdit()">
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Nombre completo <span class="text-red-500">*</span>
                    </label>
                    <input type="text" pInputText formControlName="name" class="w-full text-sm" />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Correo electrónico <span class="text-red-500">*</span>
                    </label>
                    <input type="email" pInputText formControlName="email" class="w-full text-sm" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Rol <span class="text-red-500">*</span>
                        </label>
                        <select pInputText formControlName="role" class="w-full text-sm">
                            @for (role of roles; track role) {
                                <option [value]="role">{{ roleConfig[role].label }}</option>
                            }
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Estado <span class="text-red-500">*</span>
                        </label>
                        <select pInputText formControlName="status" class="w-full text-sm">
                            <option value="active">Activo</option>
                            <option value="pending">Pendiente</option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p-button
                        label="Cancelar"
                        severity="secondary"
                        [text]="true"
                        size="small"
                        (onClick)="closeEdit()"
                    />
                    <p-button
                        label="Guardar cambios"
                        icon="pi pi-check"
                        severity="warn"
                        size="small"
                        type="submit"
                        [disabled]="editForm.invalid || savingEdit()"
                        [loading]="savingEdit()"
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
    readonly showEditDialog  = signal(false);
    readonly inviting        = signal(false);
    readonly savingEdit      = signal(false);
    readonly inviteRole      = signal<WorkspaceRole>('viewer');
    readonly editingMemberId = signal<string | null>(null);
    readonly currentPage     = signal(1);
    readonly pageSize        = 5;

    // ─── Derived ────────────────────────────────────────────────────────
    readonly filteredMembers = computed(() => {
        const q = this.searchQuery().toLowerCase();
        if (!q) return this.members();
        return this.members().filter(m =>
            m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
    });
    readonly totalPages = computed(() =>
        Math.max(1, Math.ceil(this.filteredMembers().length / this.pageSize))
    );
    readonly paginatedMembers = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredMembers().slice(start, end);
    });
    readonly pageStart = computed(() => {
        if (this.filteredMembers().length === 0) return 0;
        return (this.currentPage() - 1) * this.pageSize + 1;
    });
    readonly pageEnd = computed(() =>
        Math.min(this.currentPage() * this.pageSize, this.filteredMembers().length)
    );
    readonly pages = computed(() =>
        Array.from({ length: this.totalPages() }, (_, i) => i + 1)
    );

    // ─── Constants ──────────────────────────────────────────────────────
    readonly roleConfig = WORKSPACE_ROLE_CONFIG;
    readonly roles: WorkspaceRole[] = ['admin', 'editor', 'operator', 'viewer'];

    // ─── Form ────────────────────────────────────────────────────────────
    readonly inviteForm = this.fb.nonNullable.group({
        name:  ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role:  ['viewer' as WorkspaceRole, Validators.required],
    });
    readonly editForm = this.fb.nonNullable.group({
        name:   ['', Validators.required],
        email:  ['', [Validators.required, Validators.email]],
        role:   ['viewer' as WorkspaceRole, Validators.required],
        status: ['active' as MemberStatus, Validators.required],
    });

    // ─── Lifecycle ───────────────────────────────────────────────────────
    ngOnInit(): void {
        this.refreshMembers();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────
    private refreshMembers(): void {
        this.members.set(this.memberSvc.getMembersForWorkspace(this.workspaceId));
        this.ensureValidPage();
    }

    private ensureValidPage(): void {
        if (this.currentPage() > this.totalPages()) {
            this.currentPage.set(this.totalPages());
        }
        if (this.currentPage() < 1) {
            this.currentPage.set(1);
        }
    }

    getAvatarText(name: string): string {
        return getAvatarColor(name).text;
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    onSearchQueryChange(value: string): void {
        this.searchQuery.set(value);
        this.currentPage.set(1);
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

    openEdit(member: WorkspaceMember): void {
        this.editingMemberId.set(member.id);
        this.editForm.reset({
            name: member.name,
            email: member.email,
            role: member.role,
            status: member.status,
        });
        this.showEditDialog.set(true);
    }

    closeEdit(): void {
        this.showEditDialog.set(false);
        this.editingMemberId.set(null);
    }

    submitEdit(): void {
        const memberId = this.editingMemberId();
        if (!memberId || this.editForm.invalid) return;

        this.savingEdit.set(true);
        const dto = this.editForm.getRawValue() as UpdateMemberDto;
        this.memberSvc.updateMember(memberId, dto);
        this.refreshMembers();
        this.savingEdit.set(false);
        this.closeEdit();
        this.msg.add({
            severity: 'success',
            summary: 'Miembro actualizado',
            detail: `${dto.name} fue actualizado correctamente`,
            life: 3000,
        });
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
    }

    goToPreviousPage(): void {
        this.goToPage(this.currentPage() - 1);
    }

    goToNextPage(): void {
        this.goToPage(this.currentPage() + 1);
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
