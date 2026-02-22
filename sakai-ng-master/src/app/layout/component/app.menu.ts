import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Principal',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin/dashboard']
                    }
                ]
            },
            {
                label: 'Tramites',
                items: [
                    {
                        label: 'Workspaces',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/admin/workspaces']
                    },
                    {
                        label: 'Nuevo Workspace',
                        icon: 'pi pi-fw pi-plus-circle',
                        routerLink: ['/admin/workspaces/create']
                    }
                ]
            },
            {
                label: 'Formularios',
                items: [
                    {
                        label: 'Solicitudes',
                        icon: 'pi pi-fw pi-inbox',
                        routerLink: ['/admin/formularios/solicitudes']
                    },
                    {
                        label: 'Habilitaciones',
                        icon: 'pi pi-fw pi-check-circle',
                        routerLink: ['/admin/formularios/habilitaciones']
                    }
                ]
            },
            {
                label: 'Administración',
                items: [
                    {
                        label: 'Usuarios',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/admin/usuarios']
                    },
                    {
                        label: 'Roles y Permisos',
                        icon: 'pi pi-fw pi-lock',
                        routerLink: ['/admin/roles']
                    },
                    {
                        label: 'Configuración',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/admin/configuracion']
                    }
                ]
            },
            {
                label: 'Reportes',
                items: [
                    {
                        label: 'Estadísticas',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/admin/reportes/estadisticas']
                    },
                    {
                        label: 'Exportar',
                        icon: 'pi pi-fw pi-download',
                        routerLink: ['/admin/reportes/exportar']
                    }
                ]
            }
        ];
    }
}
