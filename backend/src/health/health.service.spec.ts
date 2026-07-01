import { describe, expect, it, jest } from '@jest/globals';
import { HealthService } from './health.service';
import { Connection } from 'mongoose';

describe('HealthService', () => {
  it('returns API health payload', () => {
    const mockConnection = {} as Connection;
    const service = new HealthService(mockConnection);

    const result = service.getApiHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('api');
    expect(typeof result.timestamp).toBe('string');
  });

  it('returns aggregated health payload', async () => {
    const ping = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const mockConnection = {
      db: {
        admin: () => ({ ping }),
      },
    } as unknown as Connection;
    const service = new HealthService(mockConnection);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.checks.api.service).toBe('api');
    expect(result.checks.database.service).toBe('database');
    expect(ping).toHaveBeenCalledTimes(1);
  });
});
