/**
 * @jest-environment node
 */
import { extractIbcHash, fetchParseIbcDenom } from './index';

global.fetch = jest.fn();

describe('fetchParseIbcDenom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('returns original denom for non-IBC denominations', async () => {
    const result = await fetchParseIbcDenom('uatom');
    expect(result).toBe('uatom');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches base denomination for IBC denominations', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ baseDenom: 'uosmo' }),
    });

    const ibcDenom = 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518';
    const result = await fetchParseIbcDenom(ibcDenom);

    expect(global.fetch).toHaveBeenCalledWith(
      `/xrplevm/api/parse_denom?hash=${extractIbcHash(ibcDenom)}`
    );
    expect(result).toBe('uosmo');
  });

  it('returns original denom when API returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to parse' }),
    });

    const ibcDenom = 'ibc/INVALID_HASH';
    const result = await fetchParseIbcDenom(ibcDenom);

    expect(global.fetch).toHaveBeenCalledWith(
      `/xrplevm/api/parse_denom?hash=${extractIbcHash(ibcDenom)}`
    );
    expect(result).toBe(ibcDenom);
  });
});
