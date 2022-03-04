import { DexTypeEnum } from '../enum/dex-type.enum';
import { TokenStandardEnum } from '../enum/token-standard.enum';
import { assetToSlug } from './helpers';

import BigNumber from 'bignumber.js';
import { getQuipuSwapPoolsFromStorage } from '../dexes/quipu-swap/utils/storate-to-route-pairs';
import { RoutePair } from '../interface/route-pair.interface';
import { getRoutePairsWithDirection } from '../utils/route-pairs-with-direction.utils';
import { RoutePairWithDirection } from '../interface/route-pair-with-direction.interface';
import { ArbuinosState } from '../interface/contract-storage.interface';
import { getPlentyPoolsFromStorage } from '../dexes/plenty/utils/storate-to-route-pairs';
import { getLiquidityBakingPoolsFromStorage } from '../dexes/liquidity-baking/utils/storate-to-route-pairs';
import { getVortexPoolsFromStorage } from '../dexes/vortex/utils/storate-to-route-pairs';

// const flameStateToPoolsInfo = async (state) => {
//   return (
//     await Promise.all(
//       Array.from(state).flatMap(async ([contractAddress, storage]) => {
//         const result = [];
//         for (let i = 1; i <= storage.buckets_count.toNumber(); i += 1) {
//           const bucket = await storage.buckets.get(i);
//
//           const tokenInfoToAddress = (tokenInfo) => {
//             if ("tz" in tokenInfo) {
//               return "tez";
//             }
//             if ("fa12" in tokenInfo) {
//               return JSON.stringify({
//                 address: `${tokenInfo.fa12}`,
//                 id: "0",
//               });
//             }
//             if ("fa2" in tokenInfo) {
//               return JSON.stringify({
//                 address: `${tokenInfo.fa2[5] ?? tokenInfo.fa2[7]}`,
//                 id: `${tokenInfo.fa2[6] ?? tokenInfo.fa2[8]}`,
//               });
//             }
//           };
//           const address1 = tokenInfoToAddress(bucket.token_a);
//           const address2 = tokenInfoToAddress(bucket.token_b);
//           const liquidity1 = bucket.token_a_res;
//           const liquidity2 = bucket.token_b_res;
//           const fee1 = new BigNumber("0.997"); // TODO validate fee1 and fee2
//           const fee2 = new BigNumber("1");
//
//           result.push(
//             ...[
//               {
//                 dex: "FLAME",
//                 contractAddress: contractAddress,
//                 address1,
//                 address2,
//                 liquidity1,
//                 liquidity2,
//                 fee1,
//                 fee2,
//               },
//               {
//                 dex: "FLAME",
//                 contractAddress: contractAddress,
//                 address1: address2,
//                 address2: address1,
//                 liquidity1: liquidity2,
//                 liquidity2: liquidity1,
//                 fee1: fee1,
//                 fee2: fee2,
//               },
//             ]
//           );
//         }
//         return result;
//       })
//     )
//   ).flat();
// };

// const spicyswapStateToPoolsInfo = async (storage) => {
//   return [
//     {
//       address1: assetToSlug({
//         type: storage.token0.token_id ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
//         address: storage.token0.fa2_address,
//         tokenId: storage.token0.token_id,
//       }),
//       address2: assetToSlug({
//         type: storage.token1.token_id ? TokenStandardEnum.FA2 : TokenStandardEnum.FA1_2,
//         address: storage.token1.fa2_address,
//         tokenId: storage.token1.token_id,
//       }),
//       liquidity1: new BigNumber(storage.reserve0),
//       liquidity2: new BigNumber(storage.reserve1),
//       fee1: new BigNumber('0.997'),
//       fee2: new BigNumber('1'),
//     },
//   ];
// };

export const contractStorageToPoolsExtractors = {
  [DexTypeEnum.QuipuSwap]: getQuipuSwapPoolsFromStorage,
  [DexTypeEnum.Plenty]: getPlentyPoolsFromStorage,
  [DexTypeEnum.Vortex]: getVortexPoolsFromStorage,
  // [DEX.FLAME]: flameStateToPoolsInfo,
  [DexTypeEnum.LiquidityBaking]: getLiquidityBakingPoolsFromStorage,
  // [DexTypeEnum.SpicySwap]: spicyswapStateToPoolsInfo,
};

export const extractRoutePairsFromState = async (arbuinos: ArbuinosState): Promise<RoutePairWithDirection[]> => {
  const { contractStorage, contractAddressToDex } = arbuinos;
  const regularPools: RoutePair[] = [];
  for (const [address, storage] of contractStorage.entries()) {
    const dex = contractAddressToDex.get(address);
    const poolsExtractor = contractStorageToPoolsExtractors[dex];
    const new_pools = await poolsExtractor(address, storage);

    regularPools.push(...new_pools);
  }
  return getRoutePairsWithDirection(regularPools);
};
