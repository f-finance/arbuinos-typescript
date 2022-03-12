import { MichelCodecPacker, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { ArbuinosState } from '../interface/arbuinos-state.interface';
import { ALLOWED_DEX_CONTRACTS_WHITELIST } from '../data/allowed-dex-contracts.whitelist';
import { DexTypeEnum } from '../enum/dex-type.enum';
import { initStorageBuilder } from './storage';

export const initArbuinosState = async (env): Promise<ArbuinosState> => {
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