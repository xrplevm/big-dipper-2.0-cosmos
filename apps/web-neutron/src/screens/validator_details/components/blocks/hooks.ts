import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  LastHundredBlocksSubscription,
  useLastHundredBlocksSubscription,
} from '@/graphql/types/provider_types';

const formatLastHundredBlocks = (data: LastHundredBlocksSubscription) =>
  data.block.map((x) => ({
    height: x.height,
    txs: x.transactions.length,
    proposer: x.ccv_validator?.validator?.validatorInfo?.operatorAddress ?? '',
    signed: x.precommits.length === 1,
  }));

type BlocksState = {
  height: number;
  txs: number;
  proposer: string;
  signed: boolean;
}[];

export const useBlocks = () => {
  const [state, setState] = useState<BlocksState>([]);

  const router = useRouter();

  const { loading } = useLastHundredBlocksSubscription({
    variables: {
      address: (router?.query?.address as string) ?? '',
    },
    onData: (data) => {
      if (!data.data.data) return;
      setState(formatLastHundredBlocks(data.data.data));
    },
  });

  return {
    state,
    loading,
  };
};
