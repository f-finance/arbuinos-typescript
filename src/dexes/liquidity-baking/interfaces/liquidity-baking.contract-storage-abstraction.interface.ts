import { BigNumber } from 'bignumber.js';

export interface LiquidityBakingContractStorageAbstractionInterface {
  xtzPool: BigNumber | string;
  tokenAddress: string;
  tokenPool: BigNumber | string;
}
