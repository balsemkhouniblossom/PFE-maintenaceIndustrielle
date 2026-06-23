import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns API health payload', () => {
    const service = new HealthService({} as any);

    const result = service.getApiHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('api');
    expect(typeof result.timestamp).toBe('string');
  });

  it('returns aggregated health payload', async () => {
    const ping = jest.fn().mockResolvedValue(undefined);
    const service = new HealthService({ db: { admin: () => ({ ping }) } } as any);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.checks.api.service).toBe('api');
    expect(result.checks.database.service).toBe('database');
    expect(ping).toHaveBeenCalledTimes(1);
  });
});
