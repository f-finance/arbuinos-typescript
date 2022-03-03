import { useEffect, useRef, useState } from 'react';

import { BigNumber } from 'bignumber.js';

import { RoutePair } from '../interface/route-pair.interface';
import { ResponseInterface } from '../interface/response.interface';
import { BlockInterface, EMPTY_BLOCK } from '../interface/block.interface';

export const useAllRoutePairs = (webSocketUrl: string) => {
  const webSocketRef = useRef<WebSocket>();

  const [data, setData] = useState<RoutePair[]>([]);
  const [block, setBlock] = useState<BlockInterface>(EMPTY_BLOCK);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    webSocketRef.current = new WebSocket(webSocketUrl);

    webSocketRef.current.onerror = (errorEvent: Event) => {
      console.log(errorEvent);
      setHasFailed(true);
    };

    webSocketRef.current.onmessage = event => {
      const rawResponse: ResponseInterface = JSON.parse(event.data);

      const allPairs = rawResponse.routePairs.map<RoutePair>(rawPair => ({
        ...rawPair,
        aTokenPool: new BigNumber(rawPair.aTokenPool),
        aTokenMultiplier: rawPair.aTokenMultiplier ? new BigNumber(rawPair.aTokenMultiplier) : undefined,
        bTokenPool: new BigNumber(rawPair.bTokenPool),
        bTokenMultiplier: rawPair.bTokenMultiplier ? new BigNumber(rawPair.bTokenMultiplier) : undefined
      }));

      const filteredPairs = allPairs.filter(pair => !pair.aTokenPool.isEqualTo(0) && !pair.bTokenPool.isEqualTo(0));

      setData(filteredPairs);
      setBlock(rawResponse.block);
    };
    return () => webSocketRef.current?.close();
  }, [webSocketUrl]);

  return { data, block, hasFailed };
};
