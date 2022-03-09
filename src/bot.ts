import { MichelCodecPacker, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import BigNumber from 'bignumber.js';

import {
  DexTypeEnum,
  initStorageBuilder,
  extractRoutePairsFromState,
  findArbitrageV2,
  arbitrageToOperationBatch,
  watch,
} from './arbuinos';
import env from './env';
import { ArbuinosState } from './interface/contract-storage.interface';
import { ALLOWED_DEX_CONTRACTS_WHITELIST } from './data/allowed-dex-contracts.whitelist';


const initArbuinosState = async () => {
  const tezos = new TezosToolkit(env.TEZOS_RPC_HOST);
  tezos.setPackerProvider(new MichelCodecPacker());

  try {
    const signer = await InMemorySigner.fromSecretKey(env.PRIVATE_KEY);
    tezos.setProvider({ signer });
    console.log('Key has succesfully signed');
  } catch (err) {
    console.error('Signing issues. Please check your key!', err);
  }

  const state: ArbuinosState = {
    tezos,
    contractStorage: new Map(),
    contractAddressToDex: new Map(
      Object.entries(ALLOWED_DEX_CONTRACTS_WHITELIST).flatMap(([dex, addresses]) =>
        addresses.map((address) => [address, dex as DexTypeEnum]),
      ),
    ),
  };

  try {
    console.log('Start storage calculation');
    state.contractStorage = await initStorageBuilder(
      Array.from(state.contractAddressToDex.keys()),
    )(state.tezos);
  } catch (err) {
    console.error('Error in store calculation', err);
  }

  return state;
};

const tryExecuteArbitrages = async (state, arbitrages) => {
  for (let i = 0; i < arbitrages.length; i += 1) {
    try {
      const batch = await arbitrageToOperationBatch(state, arbitrages[i]);
      await batch.send();
    } catch (e) {
      console.log(`Failed ${i}`, e);
      break;
    }
    break;
  }
};

(async () => {
  console.log('Bot is started...');

  const arbuinos: ArbuinosState = await initArbuinosState();

  await watch(arbuinos.contractStorage, ({ newContractStorage }) => {
    extractRoutePairsFromState({ ...arbuinos, contractStorage: newContractStorage })
      .then(async (pools) => {
        console.log(JSON.stringify(pools, null, ' '));
        return [];
      })
      .then((arbitrages) =>
        arbitrages.filter((item: any) => item.profit.gt(new BigNumber('50000'))),
      )
      .then((arbitrages) => {
        tryExecuteArbitrages(arbuinos, arbitrages);

        console.log('Existed arbitrages are:', {
          arbitrages: arbitrages.map((item: any) => ({
            path: item.path.map(
              ({ dex, contractAddress, address1, address2 }) => ({
                dex,
                contractAddress,
                address1,
                address2,
              }),
            ),
            bestAmountIn: item.bestAmountIn.toString(),
            profit: item.profit.toString(),
          })),
        });
        /* logger.info("Existed arbitrages calculation is done"); */
      });
  });
})();
