import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile(envPath: string, overrideExisting = false): void {
  if (!existsSync(envPath)) {
    return;
  }

  const envFile = readFileSync(envPath, 'utf8');

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && (overrideExisting || process.env[key] === undefined)) {
      process.env[key] = value;
    }
  }
}

const currentWorkingDirectory = process.cwd();
loadEnvFile(resolve(currentWorkingDirectory, '.env'));
loadEnvFile(resolve(currentWorkingDirectory, '..', '.env'), true);
