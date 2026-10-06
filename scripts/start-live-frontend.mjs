import { createServer } from 'vite';

process.env.VITE_DEMO_MODE = 'false';
const server = await createServer({ server: { port: 5174, strictPort: true, host: '127.0.0.1' } });
await server.listen();
server.printUrls();
