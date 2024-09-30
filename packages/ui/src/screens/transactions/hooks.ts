import * as R from 'ramda';
import { useState, useEffect, useCallback } from 'react';
import { convertMsgsToModels } from '@/components/msg/utils';
import {
  useTransactionsQuery,
  useTransactionsListenerSubscription,
  TransactionsListenerSubscription,
} from '@/graphql/types/general_types';
import type { TransactionsState } from '@/screens/transactions/types';
import { convertMsgType } from '@/utils/convert_msg_type';
import { useRecoilValue } from 'recoil';
import { readFilter } from '@/recoil/transactions_filter';

// This is a bandaid as it can get extremely
// expensive if there is too much data
/**
 * Helps remove any possible duplication
 * and sorts by height in case it bugs out
 */
const uniqueAndSort = R.pipe(
  R.uniqBy((r: Transactions) => r?.hash),
  R.sort(R.descend((r) => r?.height))
);

const formatTransactions = (data: TransactionsListenerSubscription): TransactionsState['items'] => {
  if (!data?.transactions) return [];

  let formattedData = data.transactions;
  if (data.transactions.length === 51) {
    formattedData = data.transactions.slice(0, 51);
  }

  return formattedData.map((x) => {
    const messages = convertMsgsToModels(x);
    const msgType =
      x.messages?.map((eachMsg: any) => {
        const eachMsgType = R.pathOr('none type', ['@type'], eachMsg);
        return eachMsgType ?? '';
      }) ?? [];
    const convertedMsgType = convertMsgType(msgType);
    return {
      height: x.height ?? 0,
      hash: x.hash ?? '',
      type: convertedMsgType,
      messages: {
        count: x.messages?.length ?? 0,
        items: messages,
      },
      success: x.success ?? false,
      timestamp: x.block?.timestamp ?? '',
    };
  });
};

export const useTransactions = () => {
  const [state, setState] = useState<TransactionsState>({
    loading: true,
    exists: true,
    hasNextPage: false,
    isNextPageLoading: true,
    items: [],
  });
  const msgTypes = useRecoilValue(readFilter);
  const handleSetState = useCallback(
    (stateChange: (prevState: TransactionsState) => TransactionsState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  useEffect(() => {
    handleSetState((prevState) => ({
      ...prevState,
      loading: true,
      items: [],
      hasNextPage: false,
      isNextPageLoading: false,
    }));
  }, [handleSetState, msgTypes]);
  // ================================
  // tx subscription
  // ================================
  useTransactionsListenerSubscription({
    onData: (data) => {
      const newItems = uniqueAndSort([
        ...(data?.data?.data ? formatTransactions(data.data.data) : []),
        ...state.items,
      ]);
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: newItems,
      }));
    },
  });

  // ================================
  // tx query
  // ================================
  const LIMIT = 51;
  const transactionQuery = useTransactionsQuery({
    variables: {
      limit: LIMIT,
      offset: 1,
    },
    onError: () => {
      handleSetState((prevState) => ({ ...prevState, loading: false }));
    },
    onCompleted: (data) => {
      const itemsLength = data.transactions.length;
      const newItems = uniqueAndSort([...state.items, ...(formatTransactions(data) ?? [])]);
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: newItems,
        hasNextPage: itemsLength === 51,
        isNextPageLoading: false,
      }));
    },
  });

  const loadNextPage = async () => {
    handleSetState((prevState) => ({ ...prevState, isNextPageLoading: true }));
    // refetch query
    await transactionQuery
      .fetchMore({
        variables: {
          offset: state.items.length,
          limit: LIMIT,
        },
      })
      .then(({ data }) => {
        const itemsLength = data?.transactions.length;
        const newItems = uniqueAndSort([...state.items, ...(formatTransactions(data) ?? [])]);
        handleSetState((prevState) => ({
          ...prevState,
          items: newItems,
          isNextPageLoading: false,
          hasNextPage: itemsLength === 51,
        }));
      });
  };

  return {
    state,
    loadNextPage,
  };
};
