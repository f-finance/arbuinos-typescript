import { BigNumber } from 'bignumber.js';

export interface QuipuSwapContractStorageAbstraction {
  storage: {
    tez_pool: BigNumber;
    token_address: string;
    token_id: BigNumber;
    token_pool: BigNumber;
  };
}
