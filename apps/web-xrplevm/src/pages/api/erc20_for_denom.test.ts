import { createMocks } from 'node-mocks-http';
import handler from './erc20_for_denom';

jest.mock('@/utils/ibc', () => ({
  getErc20AddressForDenom: jest.fn().mockImplementation(async (denom) => {
    if (denom === 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518') {
      return '0xaF43A2dA8E4790Ede12566649D0c2F97716b8518';
    }
    if (denom === 'ibc/NOT_REGISTERED_DENOM') {
      return undefined;
    }
    if (denom === 'ibc/ERROR_DENOM') {
      throw new Error('Failed to query token pairs');
    }
    return undefined;
  }),
}));

describe('/api/erc20_for_denom', () => {
  it('returns 400 if denom parameter is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Missing denom parameter' });
  });

  it('returns the ERC20 address for a valid IBC denom', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { denom: 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      erc20Address: '0xaF43A2dA8E4790Ede12566649D0c2F97716b8518',
    });
  });

  it('returns 404 when no ERC20 mapping exists for the denom', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { denom: 'ibc/NOT_REGISTERED_DENOM' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'No ERC20 mapping found for this IBC denom',
    });
  });

  it('returns 500 when an error occurs during processing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { denom: 'ibc/ERROR_DENOM' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Failed to query token pairs',
    });
  });
});
