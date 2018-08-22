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

  getId (endpoint: any): string {
    return endpoint.url + (endpoint.uid || '');
  }

  // ---------------------------------------------------------------------------

  get = (endpoint: any): ApiResult => {
    // unique request id
    const id = this.getId(endpoint);
    // tmp
    const cached = this.getCached(endpoint);
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

  getCached(endpoint): null | ApiResult {
    const id = this.getId(endpoint);
    console.log(id);
    return this.cache[id] || null;
  }

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
  get: action
});

export default MobxApiStore;
