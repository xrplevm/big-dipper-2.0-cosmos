import chainConfig from '@/chainConfig';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import type { IbcExtension } from '@cosmjs/stargate';
import { QueryClient, setupIbcExtension } from '@cosmjs/stargate';

/**
 * Gets the current RPC endpoint for Cosmos from chain configuration
 * @returns The URL of the Cosmos RPC endpoint
 */
export function getCurrentRpcEndpoint() {
  const { endpoints } = chainConfig();
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
  console.log('Fetching denom:');

  const hash = extractIbcHash(denom);
  const response = await fetch(`/xrplevm/api/parse_denom?hash=${hash}`);
  const data = await response.json();

  if (response.ok && data.baseDenom) {
    return data.baseDenom;
  }

  console.error('Error fetching denom:', data.error);
  return denom;
}
