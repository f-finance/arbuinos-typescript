import {
  ContractAbstraction,
  ContractProvider,
  TezosToolkit,
} from '@taquito/taquito'

export const getContract = <T extends ContractAbstraction<ContractProvider>>(
  address: string,
  tezos: TezosToolkit
) => tezos.contract.at<T>(address)
