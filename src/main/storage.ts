import { ContractAbstraction, ContractProvider, ContractStorageType, TezosToolkit } from '@taquito/taquito';

const batchRequest = require('batch-request-js');

const contractStorageRequest = (tezos) => (contract) =>
  tezos.contract
    .at(contract)
    .then((dexStorage) => dexStorage.storage())
    .then((storage) => [contract, storage]);

export const initStorageBuilder = (contract_list) => {
  return async (tezos: TezosToolkit) => {
    const { data, error } = await batchRequest(
      contract_list,
      contractStorageRequest(tezos),
      {
        batchSize: 10, // TODO move to config
        delay: 100, // TODO move to config
      },
    );
    if (error.length > 0) {
      console.log(`There are ${error.length} problems in initStorage`);
    }
    return new Map(data) as Map<string, ContractStorageType<ContractAbstraction<ContractProvider>>>;
  };
};
