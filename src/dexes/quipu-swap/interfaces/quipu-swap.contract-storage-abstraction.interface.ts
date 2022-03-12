import { BigNumber } from 'bignumber.js';

export interface QuipuSwapContractStorageAbstraction {
  storage: {
    tez_pool: BigNumber | string;
    token_address: string;
    token_id: BigNumber | string;
    token_pool: BigNumber | string;
  };
}
