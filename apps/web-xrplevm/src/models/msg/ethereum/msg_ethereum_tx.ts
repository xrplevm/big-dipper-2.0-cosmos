import chainConfig from '@/chainConfig';
import { Categories } from '@/models/types';
import { hexToBech32 } from '@/utils/hex_to_bech32';
import { ethers } from 'ethers';

const { prefix } = chainConfig();

class MsgEthereumTx {
  public category: Categories;

  public type: string;

  public hash: string;

  public from: string;

  public to: string;

  public cosmosFrom: string;

  public cosmosTo: string;

  public value: string;

  public nonce: number;

  public gasLimit: string;

  public chainId: string;

  public raw: string;

  public json: object;

  constructor(payload: {
    type: string;
    hash: string;
    from: string;
    to: string;
    cosmosFrom: string;
    cosmosTo: string;
    value: string;
    nonce: number;
    gasLimit: string;
    chainId: string;
    raw: string;
    json: object;
  }) {
    this.category = 'ethereum';
    this.type = payload.type;
    this.hash = payload.hash;
    this.from = payload.from;
    this.to = payload.to;
    this.cosmosFrom = payload.cosmosFrom;
    this.cosmosTo = payload.cosmosTo;
    this.value = payload.value;
    this.nonce = payload.nonce;
    this.gasLimit = payload.gasLimit;
    this.chainId = payload.chainId;
    this.raw = payload.raw;
    this.json = payload.json;
  }

  private static hexToCosmosAddress(hex: string): string {
    try {
      return hex ? hexToBech32(hex.replace('0x', '').toLowerCase(), prefix.account) : '';
    } catch {
      return '';
    }
  }

  static fromJson(object: any): MsgEthereumTx {
    const raw: string = object.raw ?? '';
    let hash = object.hash ?? '';
    let from = object.from ?? '';
    let to = '';
    let value = '0';
    let nonce = 0;
    let gasLimit = '0';
    let chainId = '';

    if (raw) {
      try {
        const tx = ethers.Transaction.from(raw);
        hash = tx.hash ?? hash;
        from = tx.from ?? from;
        to = tx.to ?? '';
        value = tx.value.toString();
        nonce = tx.nonce;
        gasLimit = tx.gasLimit.toString();
        chainId = tx.chainId.toString();
      } catch {
        // fallback to raw fields if decoding fails
      }
    }

    return new MsgEthereumTx({
      type: object['@type'],
      hash,
      from,
      to,
      cosmosFrom: MsgEthereumTx.hexToCosmosAddress(from),
      cosmosTo: MsgEthereumTx.hexToCosmosAddress(to),
      value,
      nonce,
      gasLimit,
      chainId,
      raw,
      json: object,
    });
  }
}

export default MsgEthereumTx;
