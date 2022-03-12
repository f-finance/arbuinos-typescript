import { BigNumber } from 'bignumber.js';

export interface PlentyContractStorageAbstraction {
  token1Check: boolean;
  token1Address: string;
  token1Id: BigNumber | string;
  token1_pool: BigNumber | string;
  token2Check: boolean;
  token2Address: string;
  token2Id: BigNumber | string;
  token2_pool: BigNumber | string;
}
