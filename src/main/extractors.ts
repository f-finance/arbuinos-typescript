import { ArbuinosState } from '../interface/arbuinos-state.interface'
import { DexTypeEnum } from '../enum/dex-type.enum'
import { RoutePair } from '../interface/route-pair.interface'
import { RoutePairWithDirection } from '../interface/route-pair-with-direction.interface'
import { getRoutePairsWithDirection } from '../utils/route-pairs-with-direction.utils'

import { getLiquidityBakingPoolsFromStorage } from '../dexes/liquidity-baking/utils/storate-to-route-pairs'
import { getPlentyPoolsFromStorage } from '../dexes/plenty/utils/storate-to-route-pairs'
import { getQuipuSwapPoolsFromStorage } from '../dexes/quipu-swap/utils/storate-to-route-pairs'
import { getSpicySwapPoolsFromStorage } from '../dexes/spicy-swap/utils/storate-to-route-pairs'
import { getVortexPoolsFromStorage } from '../dexes/vortex/utils/storate-to-route-pairs'

export const contractStorageToPoolsExtractors = {
  [DexTypeEnum.QuipuSwap]: getQuipuSwapPoolsFromStorage,
  [DexTypeEnum.Plenty]: getPlentyPoolsFromStorage,
  [DexTypeEnum.Vortex]: getVortexPoolsFromStorage,
  // [DEX.FLAME]: flameStateToPoolsInfo,
  [DexTypeEnum.LiquidityBaking]: getLiquidityBakingPoolsFromStorage,
  [DexTypeEnum.SpicySwap]: getSpicySwapPoolsFromStorage,
}

export const getRoutePairsWithDirectionFromState = async (
  arbuinos: ArbuinosState
): Promise<RoutePairWithDirection[]> => {
  const { contractStorage, contractAddressToDex } = arbuinos
  const regularPools: RoutePair[] = []
  for (const [address, storage] of contractStorage.entries()) {
    const dex = contractAddressToDex.get(address)
    const poolsExtractor = contractStorageToPoolsExtractors[dex]
    const new_pools = await poolsExtractor(address, storage)

    regularPools.push(...new_pools)
  }
  return getRoutePairsWithDirection(regularPools)
}
