import { ContractAbstraction, ContractProvider, ContractMethod } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

export interface VortexContractAbstraction extends ContractAbstraction<ContractProvider> {
  methods: {
    xtzToToken: (
      to: string,
      minTokensBought: BigNumber,
      deadline: string,
    ) => ContractMethod<ContractProvider>;
    tokenToXtz: (
      to: string,
      tokensSold: BigNumber,
      minXtzBought: BigNumber,
      deadline: string,
    ) => ContractMethod<ContractProvider>;
  };
}
