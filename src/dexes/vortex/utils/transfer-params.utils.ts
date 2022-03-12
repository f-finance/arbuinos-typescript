import { TezosToolkit } from '@taquito/taquito';

import { RouteDirectionEnum } from '../../../enum/route-direction.enum';
import { TradeOperation } from '../../../interface/trade.interface';
import { getContract } from '../../../utils/contract.utils';
import { VortexContractAbstraction } from '../interfaces/vortex.contract-abstraction.interface';

const TRANSACTION_LIFE_MINUTES = 20;

const getTransactionTimeoutDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + TRANSACTION_LIFE_MINUTES);

  return now.toISOString();
};

export const getVortexTransferParams = async (
  tradeOperation: TradeOperation,
  senderPublicKeyHash: string,
  tezos: TezosToolkit,
) => {
  const contract = await getContract<VortexContractAbstraction>(tradeOperation.dexAddress, tezos);

  if (tradeOperation.direction === RouteDirectionEnum.Direct) {
    return contract.methods
      .xtzToToken(senderPublicKeyHash, tradeOperation.bTokenAmount, getTransactionTimeoutDate())
      .toTransferParams({ amount: tradeOperation.aTokenAmount.toNumber(), mutez: true });
  } else {
    return contract.methods
      .tokenToXtz(senderPublicKeyHash, tradeOperation.aTokenAmount, tradeOperation.bTokenAmount, getTransactionTimeoutDate())
      .toTransferParams({ mutez: true });
  }
};
