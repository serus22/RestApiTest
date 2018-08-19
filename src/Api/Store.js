// @flow

import { observable, action, decorate } from 'mobx';

// -----------------------------------------------------------------------------

export type ApiResult = {|
  loading: boolean,
  ttl?: number,
  error?: any,
  data?: any
|};

export type RequestResult = {
  error?: any,
  data?: any
};

export type Endpoint = {
  headers?: { [string]: string },
  options?: { [string]: string },
  decorator: (any, any) => any,
  method: string,
  uid?: string,
  url: string
}

export type ApiCache = { [string]: ApiResult };

// -----------------------------------------------------------------------------

class ApiStore {

  fetchAction: Endpoint => Promise<RequestResult>;
  cache: ApiCache = {};

  constructor (fetchAction: Endpoint => Promise<RequestResult>): void {
    this.fetchAction = fetchAction;
  }

  // ---------------------------------------------------------------------------

  get = (endpoint: any): ApiResult => {
    // unique request id
    const id = endpoint.url + (endpoint.uid || '');
    // tmp
    const cached = this.cache[id];
    // return cached
    if (cached &&
      (cached.loading || cached.ttl === 0 || (cached.ttl || 0) > Date.now())) {
      return this.cache[id];
    }

    // create new
    this.cache = { ...this.cache, [id]: { loading: true } };

    // fork fetch request
    setTimeout(() => {
      this.fetchAction(endpoint)
        .then(res => {
          this.cache = { ...this.cache,
            [id]: {
              ...this.cache[id],
              ...res,
              ttl: endpoint.ttl !== 0
                ? Date.now() + (endpoint.ttl || 60) * 60 * 1000
                : 0,
              loading: false,
            }
          };
        })
        .catch(error => {
          this.cache = { ...this.cache,
            [id]: {
              ...this.cache[id],
              error: error.message || error.code || error,
              loading: false,
              ttl: 0
            }
          };
        });
    }, 1);

    return this.cache[id];
  };

  // ---------------------------------------------------------------------------

  update = (cb: (cache: ApiCache) => ApiCache): void => {
    let update = cb(this.cache);

    if (update) {
      this.cache = { ...update };
    }
  }
}

const MobxApiStore = decorate(ApiStore, {
  cache: observable,
  update: action,
  get: action,
});

export default MobxApiStore;
