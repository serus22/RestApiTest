// @flow

import * as React from 'react';

import MobxApiStore from './Store';

import type { Query, ApiResult, ApiCache } from './index';

// -----------------------------------------------------------------------------

export type ApiAction = (props: any) => Promise<ApiResult>;

export type MutationProps = {|
  update?: (ApiResult, storeApi: { searchQuery: string => null | ApiCache }) => null | ApiCache,
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
    return new Promise(resolve => {
      const update = this.props.update;
      if (update) {
        const changes = update(
          {
            query: [this.props.query, null],
            loading: false,
            data
          },
          {
            searchQuery: this.props.store.searchQuery.bind(this.props.store)
          }
        );

        if (changes && Object.keys(changes).length > 0) {
          this.props.store.update(changes); // TODO: Diff needs to be applied smartly (new instance required now)
        }
      }
    });
  };

  render (): React.Node {
    return this.props.children(this.action, this.state.result);
  }
}
