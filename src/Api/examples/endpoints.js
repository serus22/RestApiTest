// @flow

import qs from 'qs';

import type { Query } from '../index';

// -----------------------------------------------------------------------------

const API = 'https://reqres.in/api';

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
};

// -----------------------------------------------------------------------------

function createHash (str: string): string {
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

// -----------------------------------------------------------------------------

const WrappedEndpoints: { [string]: any => Query } = {};

const endpoints: { [string]: (any) => Endpoint } = {

  'user.getList': (props: {
    per_page?: number,
    page?: number
  }): Endpoint => ({
    url: API + '/users' + (props ? '?' + qs.stringify(props || {}) : ''),
    decorator: (res: any) => ({
      offset: (res.page - 1) * res.per_page,
      count: res.data.length,
      total: res.total,
      list: res.data.map(it => ({
        id: it.id,
        fullName: it.first_name + ' ' + it.last_name
      }))
    })
  }),

  'user.getSingle': (props: { id: string | number }) => ({
    url: API + '/users/' + props.id + '?delay=1'
  }),

  'user.putUsername': (props: { id: string, name: string }) => ({
    url: API + '/users/' + props.id,
    method: 'PUT',
    body: {
      name: props.name
    },
    ttl: -1
  }),

  'resource.getList': () => ({
    url: API + '/unknown'
  }),

  'resource.getSingle': (props: { id: string | number }) => ({
    url: API + '/unknown/' + props.id + '?delay=3'
  })
};

// -----------------------------------------------------------------------------

Object.keys(endpoints).forEach(k => {

  WrappedEndpoints[k] = (props: any): Query => {
    let original = endpoints[k](props);
    return {
      ...original,
      uid: createHash(original.url)
    };
  };
});

// -----------------------------------------------------------------------------

export default WrappedEndpoints;

