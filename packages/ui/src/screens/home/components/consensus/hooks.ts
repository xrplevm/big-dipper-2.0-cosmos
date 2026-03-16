import numeral from 'numeral';
import * as R from 'ramda';
import { useEffect, useState } from 'react';
import chainConfig from '@/chainConfig';
import useShallowMemo from '@/hooks/useShallowMemo';
import { hexToBech32 } from '@/utils/hex_to_bech32';
import { ConsensusClient } from './consensus';

const { prefix, endpoints } = chainConfig();

const ssrMode = typeof window === 'undefined';

const RPC_URL = '/xrplevm/api/rpc-proxy';

type NewRoundResult = {
  result: {
    data: {
      value: {
        height: string;
        round: number;
        step: string;
        proposer: { address: string; index: number };
      };
    };
  };
};

type NewStepResult = {
  result: {
    data: {
      value: {
        height: string;
        round: number;
        step: string;
      };
    };
  };
};

const stepReference: Record<string, number> = {
  RoundStepNewHeight: 1,
  RoundStepPropose: 2,
  RoundStepPrevote: 3,
  RoundStepPrecommit: 4,
  RoundStepCommit: 5,
};

const TOTAL_STEPS = 5;

const formatNewRound = (data: unknown) => {
  const result = R.pathOr<NewRoundResult['result'] | null>(null, ['result'], data);
  const height = numeral(result?.data.value.height).value() ?? 0;
  const proposerHex = result?.data.value.proposer.address ?? '';
  return { height, proposer: hexToBech32(proposerHex, prefix.consensus) };
};

const formatNewStep = (data: unknown) => {
  const result = R.pathOr<NewStepResult['result'] | null>(null, ['result'], data);
  const round = result?.data.value.round ?? 0;
  const step = stepReference[result?.data.value.step ?? ''] ?? 0;
  return { round, step, roundCompletion: (step / TOTAL_STEPS) * 100 };
};

export const useConsensus = () => {
  const [loadingNewRound, setLoadingNewRound] = useState(true);
  const [loadingNewStep, setLoadingNewStep] = useState(true);
  const [newRound, setNewRound] = useState<unknown>(null);
  const [newStep, setNewStep] = useState<unknown>(null);

  useEffect(() => {
    if (ssrMode) return;

    const consensus = new ConsensusClient({
      wsUrl: endpoints.publicRpcWebsocket,
      rpcUrl: RPC_URL,
      mode: 'mixed',
    });

    consensus.on('newRound', (data) => {
      setNewRound((prev: unknown) => (R.equals(prev, data) ? prev : data));
      setLoadingNewRound(false);
    });

    consensus.on('newStep', (data) => {
      setNewStep((prev: unknown) => (R.equals(prev, data) ? prev : data));
      setLoadingNewStep(false);
    });

    // Initialize the WS proxy upgrade handler first, then start
    fetch('/xrplevm/api/ws-proxy')
      .catch(() => {})
      .finally(() => consensus.start());

    return () => consensus.stop();
  }, []);

  const stateMemo = useShallowMemo({
    loadingNewRound,
    loadingNewStep,
    ...formatNewRound(newRound),
    ...formatNewStep(newStep),
    totalSteps: TOTAL_STEPS,
  });

  return { state: stateMemo };
};
