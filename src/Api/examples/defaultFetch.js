// @flow

import type { Endpoint, RequestResult } from '../Store';

export default (context?: {}) => (
  endpoint: Endpoint
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
