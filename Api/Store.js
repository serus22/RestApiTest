// @flow

import { observable, action, decorate } from 'mobx';

import type { QueryDefinition } from './index';

// -----------------------------------------------------------------------------

export type ApiResult = {
  query?: QueryDefinition,
  loading: boolean,
  ttl?: number,
  error?: any,
  data?: any
};

export type RequestResult = {
  error?: any,
  data?: any
};

export type Query = {
  ttl?: number, // minutes
  uid: string
};

// -----------------------------------------------------------------------------

export type ApiCacheGroups = { [string]: Array<string> };

export type ApiCache = {
  [string]: ApiResult
};

// -----------------------------------------------------------------------------

class ApiStore {

  fetchAction: Query => Promise<RequestResult>;
  queryGroups: ApiCacheGroups = {};
  cache: ApiCache = {};

  constructor (fetchAction: Query => Promise<RequestResult>): void {
    this.fetchAction = fetchAction;
  }

  // // ------------------------------------------------------------------------

  getId (endpoint: any): string {
    return endpoint.uid || endpoint.url || Math.random().toString();
  }

  // // ------------------------------------------------------------------------

  get = (endpoint: any, query?: QueryDefinition): Promise<ApiResult> => {
    const id = this.getId(endpoint);
    return this.fetchAction(endpoint)
      .then(res => {
        const result = {};

        if (res.error) {
          result.error = res.error;
        }
        if (res.data) {
          result.data = res.data;
        }

        result.loading = false;
        result.ttl = endpoint.ttl !== 0
          ? Date.now() + (endpoint.ttl || 60) * 60 * 1000
          : 0;

        result.query = query;
        return result;
      })
      .catch(error => ({
        error: error.message || error.code || error,
        loading: false,
        ttl: 0
      }))
      .then(res => {
        if (res.ttl && query) {
          if (! this.queryGroups[query[0]]) {
            this.queryGroups[query[0]] = [];
          }
          this.queryGroups[query[0]].push(id);
        }
        this.cache = {
          ...this.cache,
          [id]: res
        };
        return res;
      });
  };

  // // ------------------------------------------------------------------------

  getCachedById (id: string): null | ApiResult {
    const cached = this.cache[id];
    // return cached
    if (cached &&
      (cached.loading || cached.ttl === 0 || (cached.ttl || 0) > Date.now())) {
      return cached;
    }
    return null;
  }

  // // ------------------------------------------------------------------------

  update = (update: ApiCache): void => {
    this.cache = { ...this.cache, ...update };
  }

  // // ------------------------------------------------------------------------

  searchQuery (queryName: string): ApiCache | null {
    return ((this.queryGroups && this.queryGroups[queryName]) || [])
      .reduce((prev, it) => {
        const val = this.getCachedById(it);
        if (val) {
          return { ...(prev || {}), [it]: this.getCachedById(it) };
        }
        return prev;
      }, null);
  };
}

const MobxApiStore = decorate(ApiStore, {
  cache: observable,
  update: action,
  get: action
});

export default MobxApiStore;
