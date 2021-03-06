import { assetToSlug } from '../../../utils/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { PlentyContractStorageAbstraction } from '../interfaces/plenty.contract-storage-abstraction.interface';
import BigNumber from "bignumber.js";

export const getPlentyPoolsFromStorage = async (contractAddress: string, storage: PlentyContractStorageAbstraction): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.Plenty,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({
      type: storage.token1Check ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.token1Address,
      tokenId: storage.token1Id,
    }),
    aTokenPool: new BigNumber(storage.token1_pool),
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: storage.token2Check ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.token2Address,
      tokenId: storage.token2Id,
    }),
    bTokenPool: new BigNumber(storage.token2_pool),
    // bTokenMultiplier?: BigNumber,
  }];
};
