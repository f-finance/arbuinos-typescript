import * as dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';
import { cwd } from 'process';
import { resolve } from 'path';

dotenv.config({ path: resolve(cwd(), '.env') });

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  PRIVATE_KEY: str(),
  TEZOS_RPC_HOST: str(),
  BINANCE_API_KEY: str(),
  BINANCE_SECRET: str(),
});