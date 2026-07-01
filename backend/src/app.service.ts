import { Injectable, Optional } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { InjectConnection } from '@nestjs/mongoose';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { Connection } from 'mongoose';
import type { CollectionInfo } from 'mongodb';

type EndpointItem = {
  method: string;
  path: string;
};

type ApiIndex = {
  message: string;
  endpoints: EndpointItem[];
  entities: string[];
  collections: string[];
};

@Injectable()
export class AppService {
  constructor(
    @Optional() private readonly modulesContainer?: ModulesContainer,
    @Optional() private readonly reflector?: Reflector,
    @Optional() @InjectConnection() private readonly connection?: Connection,
  ) {}

  async getApiIndex(): Promise<ApiIndex> {
    const endpoints = this.extractEndpoints();
    const entities = this.extractEntities();
    const collections = await this.extractCollections();

    return {
      message: 'GMAO API index',
      endpoints,
      entities,
      collections,
    };
  }

  private extractEndpoints(): EndpointItem[] {
    if (!this.modulesContainer || !this.reflector) {
      return [];
    }

    const endpoints: EndpointItem[] = [];

    for (const moduleRef of this.modulesContainer.values()) {
      for (const controllerRef of moduleRef.controllers.values()) {
        const { metatype } = controllerRef;
        if (!metatype) {
          continue;
        }

        const controllerPath = this.toPath(
          this.reflector.get<unknown>(PATH_METADATA, metatype),
        );
        const prototype = metatype.prototype as Record<string, unknown>;
        const methodNames = Object.getOwnPropertyNames(prototype).filter(
          (name) =>
            name !== 'constructor' && typeof prototype[name] === 'function',
        );

        for (const methodName of methodNames) {
          const handler = prototype[methodName] as (
            ...args: unknown[]
          ) => unknown;
          const methodPath = this.reflector.get<unknown>(
            PATH_METADATA,
            handler,
          );
          const requestMethod = this.reflector.get<number>(
            METHOD_METADATA,
            handler,
          );

          if (requestMethod === undefined) {
            continue;
          }

          endpoints.push({
            method: this.httpMethodLabel(requestMethod),
            path: this.joinPaths(controllerPath, this.toPath(methodPath)),
          });
        }
      }
    }

    return endpoints.sort((a, b) => {
      const byPath = a.path.localeCompare(b.path);
      if (byPath !== 0) {
        return byPath;
      }
      return a.method.localeCompare(b.method);
    });
  }

  private extractEntities(): string[] {
    if (!this.connection) {
      return [];
    }
    return Object.keys(this.connection.models).sort((a, b) =>
      a.localeCompare(b),
    );
  }

  private async extractCollections(): Promise<string[]> {
    try {
      const db = this.connection?.db;
      if (!db) {
        return [];
      }
      const collections = await db
        .listCollections<Pick<CollectionInfo, 'name'>>({}, { nameOnly: true })
        .toArray();
      return collections
        .map((collection) => collection.name)
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }

  private toPath(pathValue: unknown): string {
    if (typeof pathValue === 'string') {
      return pathValue;
    }

    if (Array.isArray(pathValue)) {
      return (
        pathValue.find(
          (segment): segment is string => typeof segment === 'string',
        ) ?? ''
      );
    }

    if (!pathValue) {
      return '';
    }

    return '';
  }

  private joinPaths(controllerPath: string, methodPath: string): string {
    const raw = `/${controllerPath}/${methodPath}`
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');

    return raw === '' ? '/' : raw;
  }

  private httpMethodLabel(requestMethod: number): string {
    switch (requestMethod) {
      case 0:
        return 'GET';
      case 1:
        return 'POST';
      case 2:
        return 'PUT';
      case 3:
        return 'DELETE';
      case 4:
        return 'PATCH';
      case 5:
        return 'ALL';
      case 6:
        return 'OPTIONS';
      case 7:
        return 'HEAD';
      default:
        return 'UNKNOWN';
    }
  }
}
