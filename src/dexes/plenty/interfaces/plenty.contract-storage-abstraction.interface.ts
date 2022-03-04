import { BigNumber } from 'bignumber.js';

export interface PlentyContractStorageAbstraction {
  token1Check: boolean;
  token1Address: string;
  token1Id: BigNumber;
  token1_pool: BigNumber;
  token2Check: boolean;
  token2Address: string;
  token2Id: BigNumber;
  token2_pool: BigNumber;
}
