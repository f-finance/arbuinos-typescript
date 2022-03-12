import { BigNumber } from 'bignumber.js';

import { RoutePairWithDirection } from '../interface/route-pair-with-direction.interface';
import { Trade, TradeOperation } from '../interface/trade.interface';
import { calculateTradeExactInput, calculateTradeExactOutput } from './trade.utils';

export const getTradeOutputOperation = (trade: Trade): TradeOperation | undefined => trade[trade.length - 1];

export const getTradeOutputAmount = (trade: Trade): BigNumber | undefined => getTradeOutputOperation(trade)?.bTokenAmount;

export const getTradeInputOperation = (trade: Trade): TradeOperation | undefined => trade[0];

export const getTradeInputAmount = (trade: Trade): BigNumber | undefined => getTradeInputOperation(trade)?.aTokenAmount;

const isTradeOutputBetter = (firstTrade: Trade, secondTrade: Trade) => {
  const firstTradeOutput = getTradeOutputAmount(firstTrade);

  const secondTradeOutput = getTradeOutputAmount(secondTrade);

  if (firstTradeOutput && secondTradeOutput) {
    return firstTradeOutput.isGreaterThan(secondTradeOutput);
  }

  if (firstTradeOutput) {
    return true;
  }

  return false;
};

const isTradeInputBetter = (firstTrade: Trade, secondTrade: Trade) => {
  const firstTradeInput = getTradeInputAmount(firstTrade);

  const secondTradeInput = getTradeInputAmount(secondTrade);

  if (firstTradeInput && secondTradeInput) {
    return firstTradeInput.isLessThan(secondTradeInput);
  }

  if (firstTradeInput) {
    return true;
  }

  return false;
};

export const getBestTradeExactInput = (
  inputAssetAmount: BigNumber,
  routePairsCombinations: Array<RoutePairWithDirection[]>,
) => {
  let bestTradeExactInput: Trade = [];

  for (const routePairs of routePairsCombinations) {
    const trade = calculateTradeExactInput(inputAssetAmount, routePairs);

    if (isTradeOutputBetter(trade, bestTradeExactInput)) {
      bestTradeExactInput = trade;
    }
  }

  return bestTradeExactInput;
};

export const getBestTradeExactOutput = (
  outputAssetAmount: BigNumber,
  routePairsCombinations: Array<RoutePairWithDirection[]>,
) => {
  let bestTradeExactOutput: Trade = [];

  for (const routePairs of routePairsCombinations) {
    const trade = calculateTradeExactOutput(outputAssetAmount, routePairs);

    if (isTradeInputBetter(trade, bestTradeExactOutput)) {
      bestTradeExactOutput = trade;
    }
  }

  return bestTradeExactOutput;
};
