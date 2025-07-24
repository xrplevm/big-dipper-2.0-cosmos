/**
 * @jest-environment node
 */
import { extractIbcHash, parseIbcDenom } from './index';

jest.mock('@/chainConfig', () => ({
  __esModule: true,
  default: () => ({
    endpoints: {
      cosmosRpc: 'http://cosmos.testnet.xrplevm.org:26657',
    },
  }),
}));

describe('utils: parseIbcDenom (integration)', () => {
  it('should return a baseDenom for a valid IBC denom', async () => {
    const ibcDenom = 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518';
    const hash = extractIbcHash(ibcDenom);
    const result = await parseIbcDenom(hash);

    expect(typeof result).toBe('string');
    expect(result).toBe('uosmo');
    expect(result).toBeTruthy();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
