import { assetToSlug } from '../../../utils/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { VortexContractStorageAbstraction } from '../interfaces/vortex.contract-storage-abstraction.interface';

export const getVortexPoolsFromStorage = async (contractAddress: string, storage: VortexContractStorageAbstraction): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.Vortex,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({ type: TokenStandardEnum.XTZ }),
    aTokenPool: storage.xtzPool,
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: storage.tokenId !== undefined ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.tokenAddress,
      tokenId: storage.tokenId,
    }),
    bTokenPool: storage.tokenPool,
    // bTokenMultiplier?: BigNumber,
  }];
};
