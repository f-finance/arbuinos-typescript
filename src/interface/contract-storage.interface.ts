import {
  ContractAbstraction,
  ContractProvider,
  TezosToolkit,
  ContractStorageType,
} from '@taquito/taquito';
import { DexTypeEnum } from '../enum/dex-type.enum';

export interface ArbuinosState {
  tezos: TezosToolkit,
  contractStorage: Map<string, any>,
  contractAddressToDex: Map<string, DexTypeEnum>,
}
