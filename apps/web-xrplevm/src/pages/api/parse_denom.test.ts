import { createMocks } from 'node-mocks-http';
import handler from './parse_denom';

jest.mock('@/utils/ibc', () => ({
  parseIbcDenom: jest.fn().mockImplementation(async (hash) => {
    if (hash === 'ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518') {
      return 'uosmo';
    }
    throw new Error('Invalid hash');
  }),
}));

describe('/api/parse_denom', () => {
  it('returns 400 if hash is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Missing hash parameter' });
  });

  it('returns parsed denom for valid hash', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { hash: 'ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ baseDenom: 'uosmo' });
  });

  it('returns 500 for errors', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { hash: 'INVALID_HASH' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid hash' });
  });
});
