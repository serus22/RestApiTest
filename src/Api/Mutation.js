// @flow

import * as React from 'react';

import MobxApiStore from './Store';

import type { Endpoint, ApiResult } from './index';

// -----------------------------------------------------------------------------

export type ApiAction = (props: any) => Promise<ApiResult>;

export type MutationProps = {|
  children: (ApiAction, null | ApiResult) => React.Node,
  endpoints: { [string]: any => Endpoint },
  onSuccess?: () => void,
  store: MobxApiStore,
  query: string
|};


type MutationState = {|
  result: null | ApiResult,
  called: null | string,
|}

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

  action = (): Promise<ApiResult> => {
    return new Promise(resolve => {

    });
  };

  render (): React.Node {
    return this.props.children(this.action, this.state.result);
  }
}
