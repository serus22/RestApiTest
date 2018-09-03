// @flow

// import { observable, action, decorate } from 'mobx';

import pubsub from './pubsub';

import type { WithPubSub } from './pubsub';
import type { QueryDefinition } from './index';

// -----------------------------------------------------------------------------

export type ApiResult = {|
  query: QueryDefinition,
  loading: boolean,
  ttl?: number,
  error?: any,
  data?: any
|};

export type RequestResult = {
  error?: any,
  data?: any
};

// -----------------------------------------------------------------------------

export type Endpoint = {
  headers?: { [string]: string },
  options?: { [string]: string },
  decorator?: (any, any) => any,
  params?: { [string]: any },
  props?: { [string]: any },
  body?: { [string]: any },
  method?: string,
  uid?: string,
  url: string
}

export type ApiCacheGroups = { [string]: Array<string> };

export type ApiCache = {
  [string]: ApiResult
};

// -----------------------------------------------------------------------------

class ApiStore {

  fetchAction: Endpoint => Promise<RequestResult>;
  queryGroups: ApiCacheGroups = {};
  cache: WithPubSub<ApiCache>;

  constructor (fetchAction: Endpoint => Promise<RequestResult>): void {
    this.fetchAction = fetchAction;
    this.cache = pubsub({});
  }

  // ---------------------------------------------------------------------------

  getId (endpoint: any): string {
    return endpoint.url + (endpoint.uid || '');
  }

  // ---------------------------------------------------------------------------

  get = (endpoint: any, query: QueryDefinition): ApiResult => {
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
    this.cache = { ...this.cache, [id]: { loading: true, query }};
    this.queryGroups = {
      ...this.queryGroups,
      [query[0]]: [
        ...(this.queryGroups[query[0]] || []),
        id
      ]
    };

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
              loading: false
            }
          };
          this.cache.publish('cache', this.cache);
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
          this.cache.publish('cache', this.cache);
        });
    }, 1);

    return this.cache[id];
  };

  // ---------------------------------------------------------------------------

  getCached (endpoint: any): null | ApiResult {
    const id = this.getId(endpoint);
    return this.getCachedById(id);
  }

  getCachedById (id: string): null | ApiResult {
    return this.cache[id] || null; // TODO: invalidate by TTL
  }

  // ---------------------------------------------------------------------------

  update = (update: ApiCache): void => {
    this.cache = { ...this.cache, ...update };
    this.cache.publish('cache', this.cache);
  }

  subscribe = (listener: any => void): string => {
    // $FlowFixMe
    return this.cache.subscribe('cache', listener);
  }

  unsubscribe = (token: string): boolean => {
    return this.cache.unsubscribe(token);
  }

  // ---------------------------------------------------------------------------

  searchQuery (queryName: string): ApiCache | null {
    return ((this.queryGroups && this.queryGroups[queryName]) || []).reduce((prev, it) => {
      const val = this.getCachedById(it);
      if (val) {
        return { ...(prev || {}), [it]: this.getCachedById(it) };
      }
      return prev;
    }, null);
  };
}

export default ApiStore;
