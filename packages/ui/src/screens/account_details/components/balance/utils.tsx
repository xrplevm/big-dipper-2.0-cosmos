import Big from 'big.js';
import { formatNumber } from '@/utils/format_token';
import chainConfig from '@/chainConfig';

const { extra } = chainConfig();

export const formatBalanceData = (data: {
  available: TokenUnit;
  delegate: TokenUnit;
  unbonding: TokenUnit;
  reward: TokenUnit;
  commission?: TokenUnit;
  total?: TokenUnit;
}) => {
  const balanceChart = [
    {
      key: 'balanceAvailable',
      display: `${formatNumber(
        data.available.value,
        extra.decimals
      )} ${data.available.displayDenom.toUpperCase()}`,
      value: data.available.value,
    },
    {
      key: 'balanceDelegate',
      display: `${formatNumber(
        data.delegate.value,
        extra.decimals
      )} ${data.delegate.displayDenom.toUpperCase()}`,
      value: data.delegate.value,
    },
    {
      key: 'balanceUnbonding',
      display: `${formatNumber(
        data.unbonding.value,
        extra.decimals
      )} ${data.unbonding.displayDenom.toUpperCase()}`,
      value: data.unbonding.value,
    },
    {
      key: 'balanceReward',
      display: data.reward
        ? `${formatNumber(
            data.reward.value,
            extra.decimals
          )} ${data.reward.displayDenom.toUpperCase()}`
        : '',
      value: data.reward?.value,
    },
  ];

  if (data.commission && Big(data.commission.value).gt(0)) {
    balanceChart.push({
      key: 'balanceCommission',
      display: `${formatNumber(
        data.commission.value,
        extra.decimals
      )} ${data.commission.displayDenom.toUpperCase()}`,
      value: data.commission.value,
    });
  }

  return balanceChart;
};
