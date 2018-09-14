// @flow

import * as React from 'react';

import MobxApiStore from './Store';

import type { Endpoints } from './ApiProvider';
import type { Query, ApiResult, ApiCache, QueryDefinition } from './index';

// -----------------------------------------------------------------------------

export type ApiAction = (props: any) => Promise<ApiResult>;

export type MutationProps = {|
  update?: (ApiResult, storeApi: {
    get: (endpoint: any, query?: QueryDefinition) => Promise<ApiResult>,
    searchQuery: string => null | ApiCache,
    endpoints: Endpoints
  }) => null | ApiCache,
  children: (ApiAction, null | ApiResult) => React.Node,
  endpoints: { [string]: any => Query },
  store: MobxApiStore,
  query: string
|};


type MutationState = {|
  result: null | ApiResult,
  called: null | string,
|};

// -----------------------------------------------------------------------------

export default class Mutation extends React.PureComponent<
  MutationProps,
  MutationState
> {

  constructor (props: MutationProps): void {
    super (props);

    if (! props.endpoints || ! props.endpoints[props.query]) {
      throw new Error(`Invalid mutation query name: "${props.query}"`);
    }
  }

  state = {
    called: null,
    result: null
  };

  action = (data: any): Promise<ApiResult> => {

    const searchQuery = this.props.store.searchQuery.bind(this.props.store);

    return new Promise((resolve, reject) => {
      const { endpoints, update } = this.props;

      const query = this.props.endpoints[this.props.query](data);

      this.props.store.get(query, [this.props.query, data])
        .then(res => {

          if (update) {
            // TODO: Make this more blackbox
            const changes = update(res, { searchQuery, endpoints, get: this.props.store.get });

            if (changes && Object.keys(changes).length > 0) {
              this.props.store.update(changes);
            }
          }

          resolve(res);
        })
        .catch(error => {
          reject({
            loading: false,
            error
          });
        });
    });
  };

  render (): React.Node {
    return this.props.children(this.action, this.state.result);
  }
}
