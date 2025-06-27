/**
 * @jest-environment node
 */
const mockChainConfigs = {
  testnet: {
    chainType: 'Testnet',
    endpoints: {
      cosmosRpc: 'http://cosmos.testnet.xrplevm.org:26657',
    },
  },
  mainnet: {
    chainType: 'Mainnet',
    endpoints: {
      cosmosRpc: 'https://cosmos-rpc.xrplevm.org',
    },
  },
};

jest.mock('@/chainConfig', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('utils: parseIbcDenom (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('mainnet environment', () => {
    beforeEach(() => {
      // Re-import after reset and set up mock
      const mockChainConfig = require('@/chainConfig').default;
      mockChainConfig.mockReturnValue(mockChainConfigs.mainnet);
    });

    it('should use correct RPC endpoint for mainnet', () => {
      const { getCurrentRpcEndpoint } = require('./index');
      const endpoint = getCurrentRpcEndpoint();

      expect(endpoint).toBe('https://cosmos-rpc.xrplevm.org');
    });

    it('should return a baseDenom for a valid IBC denom (mainnet)', async () => {
      const { extractIbcHash, parseIbcDenom } = require('./index');
      const ibcDenom = 'ibc/9117A26BA81E29FA4F78F57DC2BD90CD3D26848101BA880445F119B22A1E254E';
      const hash = extractIbcHash(ibcDenom);
      const result = await parseIbcDenom(hash);

      expect(typeof result).toBe('string');
      expect(result).toBe('uatom');
      expect(result).toBeTruthy();
    });

    it('should fetch an ERC20 address for a valid IBC denom (mainnet)', async () => {
      const { getErc20AddressForDenom } = require('./index');
      const ibcDenom = 'ibc/4457C4FE143DA253CBBE998681F090B51F67E0A6AFDC8D9347516DB519712C2F';
      const result = await getErc20AddressForDenom(ibcDenom);

      expect(result).toBe('0x81F090B51f67e0A6afdC8d9347516dB519712c2f');
    });
  });

  describe('testnet environment', () => {
    beforeEach(() => {
      // Re-import after reset and set up mock
      const mockChainConfig = require('@/chainConfig').default;
      mockChainConfig.mockReturnValue(mockChainConfigs.testnet);
    });

    it('should return a baseDenom for a valid IBC denom', async () => {
      const { extractIbcHash, parseIbcDenom } = require('./index');
      const ibcDenom = 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518';
      const hash = extractIbcHash(ibcDenom);
      const result = await parseIbcDenom(hash);

      expect(typeof result).toBe('string');
      expect(result).toBe('uosmo');
      expect(result).toBeTruthy();
    });

    it('should fetch an ERC20 address for a valid IBC denom (testnet)', async () => {
      const { getErc20AddressForDenom } = require('./index');
      const ibcDenom = 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518';
      const result = await getErc20AddressForDenom(ibcDenom);

      expect(result).toBe('0xaF43A2dA8E4790Ede12566649D0c2F97716b8518');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
