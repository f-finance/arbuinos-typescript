import { BigNumber } from 'bignumber.js';

interface Token {
  fa2_address: string;
  token_id?: BigNumber;
}

export interface SpicySwapContractStorageAbstraction {
  token0: Token;
  token1: Token;
  reserve0: BigNumber;
  reserve1: BigNumber;
}
