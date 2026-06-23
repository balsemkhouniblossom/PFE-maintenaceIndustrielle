import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getApiHealth() {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth() {
    const startedAt = Date.now();
    if (!this.connection.db) {
      throw new Error('Database connection is not ready');
    }

    await this.connection.db.admin().ping();

    return {
      status: 'ok',
      service: 'database',
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  }

  async getHealth() {
    const [api, database] = await Promise.all([
      Promise.resolve(this.getApiHealth()),
      this.getDatabaseHealth(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        api,
        database,
      },
    };
  }
}
