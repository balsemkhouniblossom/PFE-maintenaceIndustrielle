import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type RequestStore = Map<string, unknown>;

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

  run<T>(callback: () => T): T {
    return this.asyncLocalStorage.run(new Map<string, unknown>(), callback);
  }

  get<T>(key: string): T | undefined {
    const store = this.asyncLocalStorage.getStore();
    if (!store) {
      return undefined;
    }

    return store.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    const store = this.asyncLocalStorage.getStore();
    if (!store) {
      return;
    }

    store.set(key, value);
  }

  getOrSet<T>(key: string, factory: () => T): T {
    const existing = this.get<T>(key);
    if (existing !== undefined) {
      return existing;
    }

    const next = factory();
    this.set(key, next);
    return next;
  }
}
