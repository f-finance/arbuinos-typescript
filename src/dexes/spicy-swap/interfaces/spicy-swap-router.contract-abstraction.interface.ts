import { ContractAbstraction, ContractProvider, ContractMethod, ContractMethodObject } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

interface Token {
  fa2_address: string;
  token_id?: BigNumber;
}

interface SwapExactForTokensInput {
  _to: string;
  amountIn: BigNumber;
  amountOutMin: BigNumber;
  deadline: string;
  tokenIn: Token;
  tokenOut: Token;
}

export interface SpicySwapRouterContractAbstractionInterface extends ContractAbstraction<ContractProvider> {
  methodsObject: {
    swap_exact_for_tokens: (_: SwapExactForTokensInput) => ContractMethodObject<ContractProvider>;
  };
}
