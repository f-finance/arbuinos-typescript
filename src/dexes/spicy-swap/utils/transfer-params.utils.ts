import { TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

import { TradeOperation } from '../../../interface/trade.interface';
import { getContract } from '../../../utils/contract.utils';
import {
  SpicySwapRouterContractAbstractionInterface,
} from '../interfaces/spicy-swap-router.contract-abstraction.interface';

const TRANSACTION_LIFE_MINUTES = 20;

const getTransactionTimeoutDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + TRANSACTION_LIFE_MINUTES);

  return now.toISOString();
};

export const getSpicySwapTransferParams = async (
    tradeOperation: TradeOperation,
    senderPublicKeyHash: string,
    tezos: TezosToolkit,
  ) => {
    const spicySwapRouterAddress: string = 'KT1PwoZxyv4XkPEGnTqWYvjA1UYiPTgAGyqL';
    const contract = await getContract<SpicySwapRouterContractAbstractionInterface>(spicySwapRouterAddress, tezos);

    const [aTokenAddress, aTokenId = undefined] = tradeOperation.aTokenSlug.split('_');
    const [bTokenAddress, bTokenId = undefined] = tradeOperation.bTokenSlug.split('_');

    return contract.methodsObject
      .swap_exact_for_tokens({
        _to: senderPublicKeyHash,
        amountIn: tradeOperation.aTokenAmount,
        amountOutMin: tradeOperation.bTokenAmount,
        deadline: getTransactionTimeoutDate(),
        tokenIn: {
          fa2_address: aTokenAddress, ...(aTokenId === undefined ? {} : { token_id: new BigNumber(aTokenId) }),
        },
        tokenOut: {
          fa2_address: bTokenAddress, ...(bTokenId === undefined ? {} : { token_id: new BigNumber(bTokenId) }),
        },
      })
      .toTransferParams({ mutez: true });
  }
;
;
