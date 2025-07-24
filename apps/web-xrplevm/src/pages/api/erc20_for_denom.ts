import { NextApiRequest, NextApiResponse } from 'next';
import { getErc20AddressForDenom } from '@/utils/ibc';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const denom = req.query.denom as string;

  if (!denom) {
    return res.status(400).json({ error: 'Missing denom parameter' });
  }

  try {
    const erc20Address = await getErc20AddressForDenom(denom);

    if (erc20Address) {
      res.status(200).json({ erc20Address });
    } else {
      res.status(404).json({ error: 'No ERC20 mapping found for this IBC denom' });
    }
  } catch (error: any) {
    console.error('Error in /api/erc20_for_denom:', error);
    res.status(500).json({ error: error.message });
  }
}
