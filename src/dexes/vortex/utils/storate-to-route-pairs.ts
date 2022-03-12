import { assetToSlug } from '../../../utils/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { VortexContractStorageAbstraction } from '../interfaces/vortex.contract-storage-abstraction.interface';
import BigNumber from "bignumber.js";

export const getVortexPoolsFromStorage = async (contractAddress: string, storage: VortexContractStorageAbstraction): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.Vortex,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({ type: TokenStandardEnum.XTZ }),
    aTokenPool: new BigNumber(storage.xtzPool),
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: storage.tokenId !== undefined ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.tokenAddress,
      tokenId: storage.tokenId,
    }),
    bTokenPool: new BigNumber(storage.tokenPool),
    // bTokenMultiplier?: BigNumber,
  }];
};
