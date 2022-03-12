import { RoutePairWithDirection } from '../interface/route-pair-with-direction.interface';
import { Arbitrage } from '../interface/arbitrage.interface';

import { findRouteBestInput, findRouteProfit } from "./estimates";
import { findAmmSwapOutput } from "../utils/amm-swap.utils";

import BigNumber from 'bignumber.js';

//
// export const findArbitrage = async pools => {
//   console.log('Start findArbitrage');
//
//   console.log(`Pools number: ${pools.length}`);
//
//   const profitableArbitrageCycles = [];
//   let checkedPath = 0;
//
//   const address1ToPools = {};
//   pools.forEach(pool => {
//     if (!(pool.address1 in address1ToPools)) {
//       address1ToPools[pool.address1] = [];
//     }
//     address1ToPools[pool.address1].push(pool);
//   });
//
//   const path = [];
//   const used = new Map();
//
//   let cnt = 0;
//   const brute = depth => {
//     cnt += 1;
//     if (
//       path.length > 1 &&
//       path[path.length - 1].address2 === path[0].address1
//     ) {
//       checkedPath += 1;
//       const bestAmountIn = estimateBestAmountIn(path);
//       const profit = findRouteProfit(path, bestAmountIn);
//       if (profit.gt(new BigNumber('0'))) {
//         const add = {
//           path: [...path],
//           bestAmountIn: bestAmountIn,
//           profit: profit,
//         };
//         profitableArbitrageCycles.push(add);
//       }
//     }
//     if (depth < 4) {
//       // max depth 3
//       const from = path.length > 0 ? path[path.length - 1].address2 : 'tez';
//       address1ToPools[from]
//         .filter(pool => used.get(pool.address1) !== 1)
//         .forEach(pool => {
//           path.push(pool);
//           used.set(pool.address1, 1);
//           brute(depth + 1);
//           used.set(pool.address1, 0);
//           path.pop();
//         });
//     }
//   };
//   console.log(cnt);
//
//   brute(0);
//
//   console.log(`Checked ${checkedPath} arbitrage paths`);
//
//   return profitableArbitrageCycles.sort((a, b) =>
//     b.profit.minus(a.profit).toNumber()
//   );
// };

export const findArbitrageV2 = async (
  pools: RoutePairWithDirection[],
  initialAmount = new BigNumber('10').pow(5),
  max_depth = 3,
): Promise<Arbitrage[]> => {
  console.log('Start findArbitrageV2');

  console.log(`Pools number: ${pools.length}`);

  const start = new Date().getTime();

  let profitableArbitrages: Arbitrage[] = [];
  let checkedPath = 0;

  const aTokenSlugToPools = {};
  // const address2ToBestAmountOut = {};
  pools.forEach(pool => {
    if (!(pool.aTokenSlug in aTokenSlugToPools)) {
      aTokenSlugToPools[pool.aTokenSlug] = [];
    }
    // if (!(pool.address2 in address2ToBestAmountOut)) {
    //   address2ToBestAmountOut[pool.address2] = new BigNumber("0");
    // }
    aTokenSlugToPools[pool.aTokenSlug].push(pool);
  });

  const path: RoutePairWithDirection[] = [];
  const amountPath = [initialAmount];
  const used = new Map();

  const brute = depth => {
    if (
      path.length > 1 &&
      path[path.length - 1].bTokenSlug === path[0].aTokenSlug
    ) {
      checkedPath += 1;
      const profit = amountPath[amountPath.length - 1].minus(initialAmount);
      if (profit.gt(new BigNumber('0'))) {
        const add = {
          route: [...path],
          bestAmountIn: initialAmount,
          profit,
        };
        profitableArbitrages.push(add);
      }
    }
    if (depth > 0) {
      const from = path.length > 0 ? path[path.length - 1].bTokenSlug : 'tez';
      (aTokenSlugToPools[from] as RoutePairWithDirection[])
        .filter(pool => used.get(pool.aTokenSlug) !== true)
        .forEach(pool => {
          if (amountPath[amountPath.length - 1].gt(pool.aTokenPool)) {
            return;
          }
          const amountOut = findAmmSwapOutput(amountPath[amountPath.length - 1], pool);
          if (amountOut.gt(pool.bTokenPool)) {
            return;
          }
          amountPath.push(amountOut);
          path.push(pool);
          used.set(pool.aTokenSlug, true);
          brute(depth - 1);
          used.set(pool.aTokenSlug, false);
          amountPath.pop();
          path.pop();
        });
    }
  };

  brute(max_depth);

  profitableArbitrages.sort((a, b) => b.profit.minus(a.profit).toNumber());
  if (profitableArbitrages.length > 100) {
    profitableArbitrages = profitableArbitrages.slice(0, 100);
  }

  profitableArbitrages = profitableArbitrages.map(arbitrage => {
    const bestAmountIn = findRouteBestInput(arbitrage.route);
    const profit = findRouteProfit(bestAmountIn, arbitrage.route);
    return {
      ...arbitrage,
      bestAmountIn: bestAmountIn,
      profit: profit,
    } as Arbitrage;
  });

  const end = new Date().getTime();
  const time = end - start;
  console.log(
    `Checked ${checkedPath} arbitrage paths in ${time / 1000} seconds`
  );

  return profitableArbitrages.sort((a, b) =>
    b.profit.minus(a.profit).toNumber()
  );
};
