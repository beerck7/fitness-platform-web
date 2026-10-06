import { spawn } from 'node:child_process';

const executable = process.env.DOTNET_EXECUTABLE || 'dotnet';
const server = spawn(
  executable,
  [
    'run',
    '--no-build',
    '--configuration',
    'Release',
    '--project',
    'backend/Fit.Api/Fit.Api.csproj',
    '--urls',
    'http://127.0.0.1:5080',
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'Development' },
  },
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
process.on('SIGTERM', () => server.kill());
process.on('SIGINT', () => server.kill());
