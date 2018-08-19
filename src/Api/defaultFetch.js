// @flow

import type { Endpoint, RequestResult } from './Store';

export default (context?: {}) => (
  endpoint: Endpoint
): Promise<RequestResult> => {

  const { method, headers, url, options } = endpoint;

  return fetch(url, { method, headers, ...options })
    .then(res => res.json())
    .then(res => {
      return {
        data: endpoint.decorator
          ? endpoint.decorator(res, { ...context, ...endpoint })
          : res
      };
    })
    .catch(error => ({
      error: error.message || error.code || error
    }));
}
