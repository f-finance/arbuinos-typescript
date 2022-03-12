import BigNumber from "bignumber.js";

import {
  initArbuinosState,
  ArbuinosState,
  getRoutePairsWithDirectionFromState,
  arbitrageToOperationBatch,
  watch,
  Arbitrage,
  findArbitrageV2,
  RoutePairWithDirection
} from "./arbuinos";
import env from "./env";

(async () => {
  console.log("Bot is started...");

  const arbuinos: ArbuinosState = await initArbuinosState(env);
  console.log("Initialized");

  const onStorageChange = async ({ newContractStorage }) => {
    const pools: RoutePairWithDirection[] = await getRoutePairsWithDirectionFromState(
      {
        ...arbuinos,
        contractStorage: newContractStorage
      }
    );
    console.log(JSON.stringify(pools, null, " "));

    const rawArbitrages: Arbitrage[] = await findArbitrageV2(pools, new BigNumber("2000000"), 6);
    const arbitrages: Arbitrage[] = rawArbitrages.filter(
      (arbitrage: Arbitrage) => arbitrage.profit.gt(new BigNumber("20000"))
    );
    console.log(JSON.stringify(arbitrages, null, " "));

    // if (arbitrages.length > 0) {
    //   try {
    //     const batch = await arbitrageToOperationBatch(arbuinos, arbitrages[0])
    //     await batch.send()
    //   } catch (e) {
    //     console.log(`Arbitrage execution failed`, e)
    //   }
    // }
  };

  await watch(arbuinos.contractStorage, onStorageChange);
})();
