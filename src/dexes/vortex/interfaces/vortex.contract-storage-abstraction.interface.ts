import { BigNumber } from 'bignumber.js';

export interface VortexContractStorageAbstraction {
  xtzPool: BigNumber;
  tokenId?: BigNumber;
  tokenAddress: string;
  tokenPool: BigNumber;
}
