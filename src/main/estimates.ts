import BigNumber from 'bignumber.js';
import { RoutePairWithDirection } from "../interface/route-pair-with-direction.interface";
import { findAmmSwapOutput } from "../utils/amm-swap.utils";

export const estimateAmountOut = (
  amount,
  pool_liquidity_1,
  pool_liquidity_2,
  pool_fee_1,
  pool_fee_2,
) => {
  const a = new BigNumber(pool_liquidity_1);
  const b = new BigNumber(pool_liquidity_2);
  const r1 = new BigNumber(pool_fee_1);
  const r2 = new BigNumber(pool_fee_2);
  const delta_a = new BigNumber(amount);

  return r1
    .multipliedBy(r2).multipliedBy(b)
    .multipliedBy(delta_a)
    .div(a.plus(r1.multipliedBy(delta_a))).integerValue(BigNumber.ROUND_DOWN);
};


export const findRouteProfit = (initial = new BigNumber('1'), route: RoutePairWithDirection[]): BigNumber => {
  let amount = initial;
  let overflow = false;
  for (let i = 0; i < route.length; i += 1) {
    const pool = route[i];
    if (amount.gt(pool.aTokenPool)) {
      overflow = true;
      break;
    }
    amount = findAmmSwapOutput(
      amount,
      pool,
    );
    if (amount.gt(pool.bTokenPool)) {
      overflow = true;
      break;
    }
  }
  if (overflow) {
    return new BigNumber('-10000000000000000000'); // some very small number
  }
  return amount.minus(initial);
};

export const findRouteBestInput = (path: RoutePairWithDirection[]): BigNumber => {
  let l = new BigNumber('1'), r = path[0].aTokenPool;
  while (r.minus(l).gt(new BigNumber('1000'))) {
    const diff = r.minus(l).idiv(9);
    const mid1 = l.plus(diff.multipliedBy(4));
    const mid2 = mid1.plus(diff);
    const profit1 = findRouteProfit(mid1, path);
    const profit2 = findRouteProfit(mid2, path);
    if (profit1.gt(profit2) || profit2.lt(new BigNumber('0'))) {
      r = mid2;
    } else {
      l = mid1;
    }
  }
  return r.plus(l).idiv(2);
};