// @flow

import qs from 'qs';

const API = 'https://reqres.in/api';

// -----------------------------------------------------------------------------

export default {

  'user.getList': (props?: {| page?: number, per_page?: number |}) => ({
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

  'resource.getList': () => ({
    url: API + '/unknown'
  }),

  'resource.getSingle': (props: { id: string | number }) => ({
    url: API + '/unknown/' + props.id + '?delay=3'
  }),

};
