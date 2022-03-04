import { BigNumber } from 'bignumber.js';

export interface LiquidityBakingContractStorageAbstractionInterface {
  xtzPool: BigNumber;
  tokenAddress: string;
  tokenPool: BigNumber;
}
