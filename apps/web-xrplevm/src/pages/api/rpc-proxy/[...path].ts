import type { NextApiRequest, NextApiResponse } from 'next';

const RPC_BASE = process.env.NEXT_PUBLIC_COSMOS_RPC ?? 'https://cosmos-rpc.testnet.xrplevm.org';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '' } = req.query;
  const rpcPath = Array.isArray(path) ? path.join('/') : path;
  const url = `${RPC_BASE}/${rpcPath}`;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    console.log(`[rpc-proxy] ${req.method} ${url} -> ${upstream.status}`);

    const data = await upstream.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', detail: String(err) });
  }
}
