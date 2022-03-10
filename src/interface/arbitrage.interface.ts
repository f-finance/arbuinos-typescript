import { BigNumber } from 'bignumber.js';

import { RoutePairWithDirection } from './route-pair-with-direction.interface';

export interface Arbitrage {
  bestAmountIn: BigNumber;
  profit: BigNumber;
  route: RoutePairWithDirection[];
}
