import { assetToSlug } from '../../../main/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { SpicySwapContractStorageAbstraction } from '../interfaces/spicy-swap.contract-storage-abstraction.interface';

export const getSpicySwapPoolsFromStorage = async (contractAddress: string, storage: SpicySwapContractStorageAbstraction): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.SpicySwap,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({
      type: storage.token0.token_id !== undefined ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.token0.fa2_address,
      tokenId: storage.token0.token_id,
    }),
    aTokenPool: storage.reserve0,
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: storage.token1.token_id !== undefined ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.token1.fa2_address,
      tokenId: storage.token1.token_id,
    }),
    bTokenPool: storage.reserve1,
    // bTokenMultiplier?: BigNumber,
  }];
};
