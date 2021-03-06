import { assetToSlug } from '../../../utils/helpers';
import { TokenStandardEnum } from '../../../enum/token-standard.enum';
import { RoutePair } from '../../../interface/route-pair.interface';
import { DexTypeEnum } from '../../../enum/dex-type.enum';
import { QuipuSwapContractStorageAbstraction } from '../interfaces/quipu-swap.contract-storage-abstraction.interface';
import BigNumber from "bignumber.js";

export const getQuipuSwapPoolsFromStorage = async (contractAddress: string, storage: QuipuSwapContractStorageAbstraction): Promise<RoutePair[]> => {
  return [{
    dexType: DexTypeEnum.QuipuSwap,
    dexAddress: contractAddress,
    aTokenSlug: assetToSlug({ type: TokenStandardEnum.XTZ }),
    aTokenPool: new BigNumber(storage.storage.tez_pool),
    // aTokenMultiplier?: BigNumber,
    bTokenSlug: assetToSlug({
      type: storage.storage.token_id ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
      address: storage.storage.token_address,
      tokenId: storage.storage.token_id,
    }),
    bTokenPool: new BigNumber(storage.storage.token_pool),
    // bTokenMultiplier?: BigNumber,
  }];
};
