import { BigNumber } from 'bignumber.js';

export interface VortexContractStorageAbstraction {
  xtzPool: BigNumber | string;
  tokenId?: BigNumber | string;
  tokenAddress: string;
  tokenPool: BigNumber | string;
}
