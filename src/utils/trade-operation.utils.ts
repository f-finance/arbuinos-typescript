import { DexTypeEnum } from '../enum/dex-type.enum';

export const getDexName = (dexType: DexTypeEnum) => {
  switch (dexType) {
    case DexTypeEnum.QuipuSwap:
      return 'QuipuSwap';
    case DexTypeEnum.Plenty:
      return 'Plenty';
    case DexTypeEnum.LiquidityBaking:
      return 'Liquidity Backing';
    case DexTypeEnum.Youves:
      return 'Youves'
  }
};
