// @flow

import { observable, action, decorate } from 'mobx';

// -----------------------------------------------------------------------------

export type ApiResult = {
  loading: boolean,
  ttl?: number,
  error?: any,
  data?: any
};

export type RequestResult = {
  error?: any,
  data?: any
};

// -----------------------------------------------------------------------------

export type ApiCacheGroups = { [string]: Array<string> };

export type ApiCache = {
  [string]: ApiResult
};

export type FetchAction = (name: string,  props: any) => Promise<RequestResult>;

// -----------------------------------------------------------------------------

class ApiStore {

  queryGroups: ApiCacheGroups = {};
  fetchAction: FetchAction;
  cache: ApiCache = {};

  constructor (fetchAction: FetchAction): void {
    this.fetchAction = fetchAction;
  }

  // // ------------------------------------------------------------------------

  get = (q: any): Promise<ApiResult> => {

    const { name, props, id} = q;



    return this.fetchAction(name, props)
      .then(res => {
        const result = {};

        if (res.error) {
          result.error = res.error;
        }
        if (res.data) {
          result.data = res.data;
        }
        return result;
      })
      .catch(error => ({
        error: error.message || error.code || error,
        loading: false,
        ttl: 0
      }))
      .then(res => {
        this.cache = {
          ...this.cache,
          [id]: res
        };
        return res;
      });
  };

  // // ------------------------------------------------------------------------

  __getCached (id: string): null | ApiResult {
    const cached = this.cache[id];
    // return cached
    if (cached &&
      (! cached.ttl || (cached.ttl || 0) > Date.now())) {
      return cached;
    }
    return null;
  }
}

export default ApiStore;
