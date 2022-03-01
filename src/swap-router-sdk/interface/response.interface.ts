import { RoutePair } from './route-pair.interface';
import { BlockInterface } from './block.interface';

export interface ResponseInterface {
  block: BlockInterface;
  routePairs: RoutePair[];
}
