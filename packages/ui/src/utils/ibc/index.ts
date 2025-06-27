import chainConfig from '@/chainConfig';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import type { IbcExtension } from '@cosmjs/stargate';
import { QueryClient, setupIbcExtension } from '@cosmjs/stargate';

const { endpoints, chainType } = chainConfig();

/**
 * Gets the current RPC endpoint for Cosmos from chain configuration
 * @returns The URL of the Cosmos RPC endpoint
 */
export function getCurrentRpcEndpoint() {
  if (!endpoints.cosmosRpc) {
    throw new Error('Cosmos RPC endpoint is not defined in chainConfig.');
  }
  return endpoints.cosmosRpc;
}

let ibcQueryClient: (QueryClient & IbcExtension) | null = null;

/**
 * Gets a QueryClient with IBC transfer extension
 * @returns A query client with IBC extension
 */
async function getIbcQueryClient(): Promise<QueryClient & IbcExtension> {
  if (!ibcQueryClient) {
    const tmClient = (await Tendermint34Client.connect(getCurrentRpcEndpoint())) as any;

    ibcQueryClient = QueryClient.withExtensions(tmClient, setupIbcExtension);
  }
  return ibcQueryClient;
}

/**
 * Checks if a denomination is an IBC denomination
 * @param denom The denomination to check
 * @returns boolean indicating if the denom is an IBC denom
 */
export function isIbcDenom(denom: string): boolean {
  return /^ibc\//i.test(denom);
}

/**
 * Extracts the hash part from an IBC denomination
 * @param denom The IBC denomination (e.g., 'ibc/HASH123')
 * @returns The extracted hash (e.g., 'HASH123')
 */
export function extractIbcHash(denom: string): string {
  return denom.replace(/^ibc\//i, '');
}

/**
 * Query the on-chain denom trace and metadata for an IBC hash
 * @param hash The hash part extracted from an IBC denomination (without the 'ibc/' prefix)
 * @returns baseDenom (on-chain unit) if found
 */
export async function parseIbcDenom(hash: string): Promise<string | undefined> {
  const ibcClient = await getIbcQueryClient();

  const denomTraceResponse = await ibcClient.ibc.transfer.denomTrace(hash);
  const trace = denomTraceResponse?.denomTrace;

  if (trace && typeof trace.baseDenom === 'string') {
    return trace.baseDenom;
  }
  return undefined;
}

/**
 * Fetches and parses an IBC denomination via API (client-side friendly)
 * @param denom The denomination to parse
 * @returns The parsed denomination if it's an IBC denom, or the original denom otherwise
 */
export async function fetchParseIbcDenom(denom: string): Promise<string> {
  if (!isIbcDenom(denom)) return denom;

  const response = await fetch(`/xrplevm/api/parse_denom?hash=${denom}`);
  const data = await response.json();

  if (response.ok && data.baseDenom) {
    return data.baseDenom;
  }

  console.error('Error fetching denom:', data.error);
  return denom;
}

/**
 * Query the Cosmos ERC20 module to find the corresponding Ethereum ERC20
 * contract address for a given Cosmos denom (including IBC denoms).
 * @param denom The Cosmos base denom or IBC denom (e.g. 'uosmo' or 'ibc/ED07A3...')
 * @returns The associated ERC20 contract address, or undefined if not registered
 */
export async function getErc20AddressForDenom(denom: string): Promise<string | undefined> {
  const rpc = getCurrentRpcEndpoint();

  let apiUrl: string;

  // Check if it's mainnet to use different domain architecture
  if (chainType === 'Mainnet') {
    // Mainnet: Use dedicated API domain
    apiUrl = rpc.replace('rpc', 'api');
  } else {
    // Testnet/Devnet: Use port-based architecture
    apiUrl = rpc.replace(/:26657$/, ':1317');
  }

  const url = `${apiUrl}/evmos/erc20/v1/token_pairs`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`ERC20 lookup failed: HTTP ${res.status}`);
      return undefined;
    }

    const json = await res.json();
    const tokenPairs = json.token_pairs || [];

    const pair = tokenPairs.find(
      (pair: any) => pair.denom === denom || (isIbcDenom(denom) && pair.denom === denom)
    );

    if (pair) {
      return pair.erc20_address;
    } else {
      console.warn(`No ERC20 mapping found for denom: ${denom}`);
      return undefined;
    }
  } catch (err) {
    console.warn(`Error fetching ERC20 address for ${denom}:`, err);
    return undefined;
  }
}

/**
 * Fetches the ERC20 contract address for an IBC denomination via API (client-side friendly)
 * @param denom The denomination to lookup (e.g., 'ibc/HASH123')
 * @returns The ERC20 address if found, or undefined otherwise
 */
export async function fetchErc20AddressForDenom(denom: string): Promise<string | undefined> {
  if (!isIbcDenom(denom)) {
    console.warn('Not an IBC denom, cannot fetch ERC20 address:', denom);
    return undefined;
  }

  const response = await fetch(`/xrplevm/api/erc20_for_denom?denom=${encodeURIComponent(denom)}`);
  const data = await response.json();

  if (response.ok && data.erc20Address) {
    return data.erc20Address;
  }

  console.error('Error fetching ERC20 address:', data.error);
  return undefined;
}
