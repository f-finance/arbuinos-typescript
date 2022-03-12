import BigNumber from "bignumber.js";

import {
  initArbuinosState,
  ArbuinosState,
  getRoutePairsWithDirectionFromState,
  arbitrageToOperationBatch,
  watch,
  Arbitrage,
  findArbitrageV2,
  RoutePairWithDirection, getArbitrageOpParams, parseTransferParamsToParamsWithKind
} from "./arbuinos";
import env from "./env";

(async () => {
  console.log("Bot is started...");

  const arbuinos: ArbuinosState = await initArbuinosState(env);
  console.log("Initialized");

  const publicKeyHash = await arbuinos.tezos.wallet.pkh();
  console.log(`Public key hash ${publicKeyHash}`);

  const onStorageChange = async ({ newContractStorage }) => {
    const pools: RoutePairWithDirection[] = await getRoutePairsWithDirectionFromState(
      {
        ...arbuinos,
        contractStorage: newContractStorage
      }
    );
    // console.log(JSON.stringify(pools, null, " "));

    const rawArbitrages: Arbitrage[] = await findArbitrageV2(pools, "tez", 6, new BigNumber("2000000"));
    const arbitrages: Arbitrage[] = rawArbitrages.filter(
      (arbitrage: Arbitrage) => arbitrage.profit.gt(new BigNumber("20000"))
    );
    console.log(JSON.stringify(arbitrages, null, " "));

    if (arbitrages.length > 0) {
      try {
        const arbitrageTransferParams = await getArbitrageOpParams(arbitrages[0], publicKeyHash, arbuinos.tezos);
        const walletParamsWithKind = arbitrageTransferParams.map(transferParams => parseTransferParamsToParamsWithKind(transferParams));
        const batch = arbuinos.tezos.wallet.batch(walletParamsWithKind);
        console.log("Batch = ", JSON.stringify((batch as unknown as {operations}).operations));
        // await batch.send();
      } catch (e) {
        console.log(`Arbitrage execution failed`, e);
      }
    }
  };

  await watch(arbuinos.contractStorage, onStorageChange);
})();
