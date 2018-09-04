// @flow

import type { Query } from '../index';
import type { Endpoint } from './endpoints';
import type { RequestResult } from '../index';

export default (context?: {}) => (
  endpoint: Endpoint & Query
): Promise<RequestResult> => {

  const { method, headers, url, options } = endpoint;

  return fetch(url, { method, headers, ...options })
    .then(res => {
      if (res.ok) {
        return res.json()
          .then(res => ({
            data: endpoint.decorator
              ? endpoint.decorator(res, { ...context, ...endpoint })
              : res
          }));
      }
      // $FlowFixMe
      return { error: res.message || res.status || res.code };
    })
    .catch(error => ({
      error: error.message || error.code || error
    }));
};
