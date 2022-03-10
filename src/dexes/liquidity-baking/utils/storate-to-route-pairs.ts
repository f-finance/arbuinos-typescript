import { assetToSlug } from '../../../utils/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { LiquidityBakingContractStorageAbstractionInterface } from '../interfaces/liquidity-baking.contract-storage-abstraction.interface';

export const getLiquidityBakingPoolsFromStorage = async (contractAddress: string, storage: LiquidityBakingContractStorageAbstractionInterface): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.LiquidityBaking,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({ type: TokenStandardEnum.XTZ }),
    aTokenPool: storage.xtzPool,
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: TokenStandardEnum.FA1_2,
      address: storage.tokenAddress,
    }),
    bTokenPool: storage.tokenPool,
    // bTokenMultiplier?: BigNumber,
  }];
};
