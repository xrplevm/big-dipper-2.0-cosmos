import { NextApiRequest, NextApiResponse } from 'next';
import { parseIbcDenom } from '@/utils/ibc';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hash = req.query.hash as string;

  if (!hash) {
    return res.status(400).json({ error: 'Missing hash parameter' });
  }

  try {
    const baseDenom = await parseIbcDenom(hash);
    return res.status(200).json({ baseDenom });
  } catch (error: unknown) {
    console.error('Error in /api/parse_denom:', error);
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
