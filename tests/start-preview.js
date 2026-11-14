import { preview } from 'vite';

export default async function startPreview() {
  // Own the server in-process so teardown works without platform-specific
  // process-tree termination, including on restricted Windows environments.
  const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
  return async () => { await server.close(); };
}
