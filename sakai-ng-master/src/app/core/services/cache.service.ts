import { Injectable } from '@angular/core';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
    private readonly cache = new Map<string, CacheEntry<unknown>>();

    set<T>(key: string, data: T, ttlMs = 300_000): void {
        this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}
