import BigNumber from "bignumber.js";

import ccxt from "ccxt";

import {
  Arbitrage,
  ArbuinosState,
  DexTypeEnum,
  findArbitrageV2,
  getArbitrageOpParams,
  getRoutePairsWithDirectionFromState,
  initArbuinosState,
  loadAssetContract,
  parseTransferParamsToParamsWithKind,
  RouteDirectionEnum,
  RoutePairWithDirection,
  watch
} from "./arbuinos";

import env from "./env";
import { findRouteProfit } from "./main/estimates";

(async (start) => {
  if (!start) {
    return;
  }
  console.log("Bot is started...");

  const arbuinos: ArbuinosState = await initArbuinosState(env);
  const binance = new ccxt.binance({
    "apiKey": env.BINANCE_API_KEY,
    "secret": env.BINANCE_SECRET
  });
  console.log("Initialized");

  const publicKeyHash = await arbuinos.tezos.wallet.pkh();
  console.log(`Public key hash ${publicKeyHash}`);

  const kUSDContract = (await loadAssetContract("KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV", arbuinos.tezos)).contract;

  const processCexArbitrage = async (arbitrage: Arbitrage) => {
    const binanceBalance = await binance.fetchBalance();
    const binanceXTZ = new BigNumber(binanceBalance["XTZ"].free).multipliedBy(new BigNumber(10).pow(6));
    const binanceUSDT = new BigNumber(binanceBalance["USDT"].free).multipliedBy(new BigNumber(10).pow(18));

    const tezosXTZ = await arbuinos.tezos.tz.getBalance(publicKeyHash);
    const tezoskUSD = await kUSDContract.views.getBalance("tz1SRSyv2TE4Kq6gBCc9v4idcXeZQf5xKtG5").read();

    let amountTez = arbitrage.bestAmountIn;
    if (arbitrage.route[0].dexType == DexTypeEnum.Binance) {
      amountTez = BigNumber.min(amountTez, binanceXTZ.multipliedBy(0.9)).integerValue(BigNumber.ROUND_DOWN);
    } else {
      amountTez = BigNumber.min(amountTez, tezosXTZ.multipliedBy(0.9)).integerValue(BigNumber.ROUND_DOWN);
    }
    arbitrage.bestAmountIn = amountTez;
    arbitrage.profit = findRouteProfit(arbitrage.bestAmountIn, arbitrage.route);
    if (arbitrage.profit.lt(0.1)) {
      return;
    }

    console.log("execute ", JSON.stringify(arbitrage, null, " "));
    console.log(`bXTZ: ${binanceXTZ.toString()} bUSDT: ${binanceUSDT.toString()}`);
    console.log(`tXTZ: ${tezosXTZ.toString()} tUSDT: ${tezoskUSD.toString()}`);
  };

  const getBinancePools = async (): Promise<RoutePairWithDirection[]> => {
    try {
      const XTZBTCOrderBook = await binance.fetchOrderBook("XTZ/BTC", 2);
      const XTZUSDTOrderBook = await binance.fetchOrderBook("XTZ/USDT", 2);

      // const XTZBUSDOrderBook = await binance.fetchOrderBook("XTZ/BUSD", 2);
      const binancePools: RoutePairWithDirection[] = [
        // {
        //   dexType: DexTypeEnum.Binance,
        //   dexAddress: "binance",
        //   aTokenSlug: "tez",
        //   aTokenPool: XTZBTCOrderBook.bids.reduce((prev, cur) => prev.plus(new BigNumber(cur[1])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(6 + 5)),
        //   bTokenSlug: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn",
        //   bTokenPool: XTZBTCOrderBook.bids.reduce((prev, cur) => prev.plus(new BigNumber(cur[1] * cur[0])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(8 + 5)),
        //   direction: RouteDirectionEnum.Direct
        // },
        // {
        //   dexType: DexTypeEnum.Binance,
        //   dexAddress: "binance",
        //   aTokenSlug: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn",
        //   aTokenPool: XTZBTCOrderBook.asks.reduce((prev, cur) => prev.plus(new BigNumber(cur[1] * cur[0])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(8 + 5)),
        //   bTokenSlug: "tez",
        //   bTokenPool: XTZBTCOrderBook.asks.reduce((prev, cur) => prev.plus(new BigNumber(cur[1])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(6 + 5)),
        //   direction: RouteDirectionEnum.Inverted
        // },
        {
          dexType: DexTypeEnum.Binance,
          dexAddress: "binance",
          aTokenSlug: "tez",
          aTokenPool: XTZUSDTOrderBook.bids.reduce((prev, cur) => prev.plus(new BigNumber(cur[1])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(6 + 5)),
          bTokenSlug: "KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV",
          bTokenPool: XTZUSDTOrderBook.bids.reduce((prev, cur) => prev.plus(new BigNumber(cur[1] * cur[0])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(18 + 5)),
          direction: RouteDirectionEnum.Direct
        },
        {
          dexType: DexTypeEnum.Binance,
          dexAddress: "binance",
          aTokenSlug: "KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV",
          aTokenPool: XTZUSDTOrderBook.asks.reduce((prev, cur) => prev.plus(new BigNumber(cur[1] * cur[0])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(18 + 5)),
          bTokenSlug: "tez",
          bTokenPool: XTZUSDTOrderBook.asks.reduce((prev, cur) => prev.plus(new BigNumber(cur[1])), new BigNumber("0")).multipliedBy(new BigNumber("10").pow(6 + 5)),
          direction: RouteDirectionEnum.Inverted
        }
      ];
      return binancePools;
    } catch (e) {
      return [];
    }
  };

  const onStorageChange = async ({ newContractStorage }) => {
    const binancePoolsPromise = getBinancePools();

    const pools: RoutePairWithDirection[] = await getRoutePairsWithDirectionFromState(
      {
        ...arbuinos,
        contractStorage: newContractStorage
      }
    );

    const rawArbitrages: Arbitrage[] = [
      ...await findArbitrageV2(pools, "tez", 6, new BigNumber("2000000")),
      ...await findArbitrageV2(pools, "tez", 6, new BigNumber("20000000"))
    ];

    const binancePools = await binancePoolsPromise;
    pools.push(...binancePools);

    rawArbitrages.push(
      ...await findArbitrageV2(pools, "tez", 2, new BigNumber("2000000")),
      ...await findArbitrageV2(pools, "tez", 2, new BigNumber("20000000"))
    );

    rawArbitrages.sort((a, b) => b.profit.minus(a.profit).toNumber());
    const arbitrages: Arbitrage[] = rawArbitrages.filter(
      (arbitrage: Arbitrage) => arbitrage.profit.gt(new BigNumber("1000000"))
    );
    console.log(JSON.stringify(arbitrages.slice(0, 1), null, " "));

    if (arbitrages.length > 0) {
      for (let i = 0; i < arbitrages.length; i += 1) {
        const arbitrage = arbitrages[i];
        const binanceIndex = arbitrage.route.findIndex(x => x.dexType == DexTypeEnum.Binance);
        if (binanceIndex == -1) {
          try {
            console.log("execute ", JSON.stringify(arbitrage, null, " "));

            const arbitrageTransferParams = await getArbitrageOpParams(arbitrages[0], publicKeyHash, arbuinos.tezos);
            const walletParamsWithKind = arbitrageTransferParams.map(transferParams => parseTransferParamsToParamsWithKind(transferParams));
            // walletParamsWithKind[walletParamsWithKind.length - 1].fee = 200000;
            // walletParamsWithKind[0]["mutez"] = true;
            const batch = arbuinos.tezos.wallet.batch(walletParamsWithKind);
            console.log("Batch = ", JSON.stringify((batch as unknown as { operations }).operations, null, 2));
            await batch.send();
          } catch (e) {
            console.log(`Arbitrage execution failed`, e);
          }
          break;
        }
        try {
          await processCexArbitrage(arbitrage);
        } catch (e) {
          console.log(e);
        }
        break;
      }
    }
  };

  await watch(arbuinos.contractStorage, onStorageChange);
})(true);


(async (start) => {
  if (!start) {
    return;
  }
})(true);