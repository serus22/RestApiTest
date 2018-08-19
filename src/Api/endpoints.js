// @flow

import qs from 'qs';

const API = 'https://reqres.in/api';

// -----------------------------------------------------------------------------

export default {

  'user.getList': (props?: {| page?: number, per_page?: number |}) => ({
    url: API + '/users' + (props ? '?' + qs.stringify(props || {}) : ''),
    // decorator: (res: any) => res.data
  }),

  'user.getDetail': (props: { id: string }) => ({
    url: API + '/api/users/' + props.id
  })

};
