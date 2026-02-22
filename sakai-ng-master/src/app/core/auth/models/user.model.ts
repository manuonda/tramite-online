import { Role } from './role.model';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    avatar?: string;
    active: boolean;
}

export function getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
}
