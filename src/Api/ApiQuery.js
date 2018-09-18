// @flow

import * as React from 'react';

import { createHash } from './index';
import { Consumer } from './ApiProvider';

import type { ApiResult } from './index';

// -----------------------------------------------------------------------------

export type QueryDefinition = [string, any];

export type ApiResults = {
  [string]: ApiResult
};

export type ApiQueryProps = $Exact<{
  children?: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  queries: { [string]: QueryDefinition },
  id?: string
}>;

type ApiQueryState = {
  [string]: {
    name: string,
    id: number,
    props: any
  }
};

// -----------------------------------------------------------------------------

type RenderChildrenProps = {|
  children?: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  results: ApiResults,
  loading: boolean
|};

class RenderChildren extends React.PureComponent<RenderChildrenProps> {

  render (): React.Node {
    return this.props.children
      ? this.props.children(this.props.results, this.props.loading)
      : null;
  }

  componentDidUpdate (): void {
    this.props.onUpdate
      && this.props.onUpdate(this.props.results, this.props.loading);
  }
}

// -----------------------------------------------------------------------------

export default class ApiQuery extends React.PureComponent<
  ApiQueryProps,
  ApiQueryState
> {

  state = {};

  // // ------------------------------------------------------------------------

  static getDerivedStateFromProps (
    nextProps: ApiQueryProps,
    prevState: ApiQueryState
  ): null | $Shape<ApiQueryState> {

    const update = {};
    let skip = true;
    Object.keys(nextProps.queries).forEach(key => {
      const sum = createHash(nextProps.queries[key]);
      if (! prevState[key] || prevState[key] !== sum) {
        update[key] = {
          props: nextProps.queries[key][1],
          name: nextProps.queries[key][0],
          id: sum
        };
        skip = true;
      }
    });

    return skip ? null : update;
  }

  // // ------------------------------------------------------------------------

  render (): React.Node {

    return <Consumer>
      {({ store, endpoints }) => {

        const results = store.get(this.state);

        let loading = false;
        Object.keys(results).forEach(k => {
          loading = results[k].loading || loading;
        });

        return <RenderChildren
          children={this.props.children}
          results={results}
          loading={loading} />
      }}
    </Consumer>;
  }
}
