import { TezosToolkit, TransferParams } from "@taquito/taquito";

import { DexTypeEnum } from "../enum/dex-type.enum";
import { Trade, TradeOperation } from "../interface/trade.interface";
import { Arbitrage } from "../interface/arbitrage.interface";

import { getLiquidityBakingTransferParams } from "../dexes/liquidity-baking/utils/transfer-params.utils";
import { getPermissionsTransferParams } from "./permissions-transfer-params.utils";
import { getPlentyTransferParams } from "../dexes/plenty/utils/transfer-params.utils";
import { getQuipuSwapTransferParams } from "../dexes/quipu-swap/utils/transfer-params.utils";
import { getSpicySwapTransferParams } from "../dexes/spicy-swap/utils/transfer-params.utils";
import { getVortexTransferParams } from "../dexes/vortex/utils/transfer-params.utils";
import { getYouvesTransferParams } from "../dexes/youves/utils/transfer-params.utils";
import { findAmmSwapOutput } from "./amm-swap.utils";
import BigNumber from "bignumber.js";

const getTradeOperaitonTransferParams = async (
  tradeOperation: TradeOperation,
  senderPublicKeyHash: string,
  tezos: TezosToolkit
) => {
  switch (tradeOperation.dexType) {
    case DexTypeEnum.QuipuSwap:
      return [
        await getQuipuSwapTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
    case DexTypeEnum.Plenty:
      return [
        await getPlentyTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
    case DexTypeEnum.LiquidityBaking:
      return [
        await getLiquidityBakingTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
    case DexTypeEnum.Youves:
      return [
        await getYouvesTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
    case DexTypeEnum.Vortex:
      return [
        await getVortexTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
    case DexTypeEnum.SpicySwap:
      return [
        await getSpicySwapTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        )
      ];
  }
};

export const getTradeOpParams = (
  trade: Trade,
  senderPublicKeyHash: string,
  tezos: TezosToolkit
) =>
  Promise.all(
    trade.map(
      async (tradeOperation): Promise<TransferParams[]> => {
        const tradeTransferParams = await getTradeOperaitonTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        );
        const permissions = await getPermissionsTransferParams(
          tradeOperation,
          senderPublicKeyHash,
          tezos
        );

        return [
          ...permissions.approve,
          ...tradeTransferParams,
          ...permissions.revoke
        ];
      }
    )
  ).then(result => result.flat());

export const getArbitrageOpParams = async (
  arbitrage: Arbitrage,
  senderPublicKeyHash: string,
  tezos: TezosToolkit
) => {
  const trade: Trade = [];
  let amount = arbitrage.bestAmountIn;
  amount = BigNumber.min(amount, (await tezos.tz.getBalance(senderPublicKeyHash)).multipliedBy(0.9))
    .integerValue(BigNumber.ROUND_DOWN);
  for (let i = 0; i < arbitrage.route.length; i += 1) {
    const routePair = arbitrage.route[i];
    const newAmount = findAmmSwapOutput(amount, routePair);
    trade.push({
      ...routePair,
      aTokenAmount: amount,
      bTokenAmount: newAmount
    });
    amount = newAmount;
  }
  return getTradeOpParams(trade, senderPublicKeyHash, tezos);
};