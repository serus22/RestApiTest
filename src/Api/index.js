// @flow

import Store from './Store';
import ApiQuery from './ApiQuery';
import ApiMutation from './ApiMutation';
import ApiSerialQuery from './ApiSerialQuery';
import ApiProvider, { defaultApiContext } from './ApiProvider';

export {
  defaultApiContext,
  ApiSerialQuery,
  ApiProvider,
  ApiMutation,
  ApiQuery,
  Store
};

export type { ApiAction } from './Mutation';
export type { ApiQueryProps, ApiResults } from './ApiQuery';
export type { ApiResult, Query, ApiCache, RequestResult } from './Store';

export default ApiProvider;

// -----------------------------------------------------------------------------

export function createHash (obj: any): string {
  let str: string;
  try {
    str = JSON.stringify(obj);
  } catch (e) {
    str = (Math.random() * Date.now()).toFixed(20);
  }

  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
  * integers. Since we want the results to be always positive, convert the
  * signed int to an unsigned by doing an unsigned bitshift. */
  return (hash >>> 0).toString();
};

