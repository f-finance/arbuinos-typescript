import { BigNumber } from 'bignumber.js';

import { DexTypeEnum } from '../enum/dex-type.enum';
import { RoutePairWithDirection } from '../interface/route-pair-with-direction.interface';
import { RoutePair } from '../interface/route-pair.interface';

const PAIR_FEE_PERCENT_RECORD: Record<DexTypeEnum, number> = {
  [DexTypeEnum.QuipuSwap]: 0.3,
  [DexTypeEnum.Plenty]: 0.35,
  [DexTypeEnum.LiquidityBaking]: 0.21,
  [DexTypeEnum.Youves]: 0.15,
  [DexTypeEnum.Vortex]: 0.28,
  [DexTypeEnum.Flame]: 0.3, // TODO
  [DexTypeEnum.SpicySwap]: 0.3,
  [DexTypeEnum.Binance]: 0.1,
};

export const getPairFeeRatio = (pair: RoutePairWithDirection | RoutePair) => {
  const feePercent = PAIR_FEE_PERCENT_RECORD[pair.dexType];

  return new BigNumber(100).minus(feePercent).dividedBy(100);
};
