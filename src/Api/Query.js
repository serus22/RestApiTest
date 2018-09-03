// @flow

import * as React from 'react';

import ApiStore from './Store';
import type { ApiResult, Endpoint } from './index';

// -----------------------------------------------------------------------------

export type QueryDefinition = [string, any];

export type ApiResults = {
  [string]: ApiResult
};

type QueryState = {|
  endpoints: { [string]: any => Endpoint },
  results: ApiResults,
  loading: boolean
|};

export type QueryProps = {|
  children: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  queries: { [string]: QueryDefinition },
  endpoints: { [string]: any => Endpoint },
  store: ApiStore
|};

const InitialState: QueryState = {
  loading: false,
  endpoints: {},
  results: {}
};

// -----------------------------------------------------------------------------

export default class Query extends React.PureComponent<QueryProps, QueryState> {

  mounted: boolean;
  disposer: string;

  // ---------------------------------------------------------------------------

  constructor (props: QueryProps): void {
    super(props);

    if (! props.store) {
      throw new Error('Migging store instance');
    }

    if (! props.endpoints) {
      throw new Error('Missing endpoints definition');
    }

    this.state = {
      ...(Query.getDerivedStateFromProps(props, InitialState) || InitialState)
    };
  }

  // ---------------------------------------------------------------------------

  static getDerivedStateFromProps (
    props: QueryProps,
    prevState: QueryState
  ): null | $Shape<QueryState> {

    let update = false;
    const queryIds = Object.keys(props.queries);
    const endpoints = queryIds.reduce((obj, key) => {
      const template = props.endpoints[props.queries[key][0]];

      if (! template || typeof template !== 'function') {
        throw new Error('Invalid enpoint name "' + props.queries[key][0] + '"');
      }

      const query = template(props.queries[key][1]);

      // TODO: use ID instead url for example because of POST, PATCH could have same url
      if (! prevState.endpoints[key]
        || (prevState.endpoints[key] && prevState.endpoints[key].url !== query.url)) {
        obj[key] = query;
        update = true;
      } else {
        obj[key] = prevState.endpoints[key];
      }
      return obj;
    }, {});

    if (! update && queryIds.length === Object.keys(prevState.endpoints).length) {
      return null;
    }

    const results: ApiResults = Object.keys(endpoints).reduce((obj, key) => {
      obj[key] = props.store.get(endpoints[key], props.queries[key]);
      return obj;
    }, {});

    return {
      loading: Object.keys(results).some(key => results[key].loading),
      endpoints,
      results
    };
  }

  // ---------------------------------------------------------------------------

  listener = (change: any) => {

    const results = { ...this.state.results };

    let update = false;

    Object.keys(this.state.endpoints).forEach(key => {
      const val = this.props.store.getCached(this.state.endpoints[key]);
      if (val !== this.state.endpoints[key]) {
        results[key] = val;
        update = true;
      }
    });

    update && this.setState({
      loading: Object.keys(results).some(key => results[key].loading),
      results
    });
  };

  // ---------------------------------------------------------------------------

  componentDidMount (): void {
    this.mounted = true;
    this.disposer = this.props.store.subscribe(this.listener);
  }

  // ---------------------------------------------------------------------------

  componentWillUnmount (): void {
    this.props.store.unsubscribe(this.disposer);
    this.mounted = false;
  }

  // ---------------------------------------------------------------------------

  render (): React.Node {

    const { results, loading } = this.state;

    return this.props.children(
      results,
      loading
    );
  }

  // ---------------------------------------------------------------------------

  componentDidUpdate (prevProps: QueryProps, prevState: QueryState): void {
    // if (this.state.loading !== prevState.loading) {
    this.props.onUpdate && this.props.onUpdate(
      this.state.results,
      this.state.loading
    );
    // }
  }
}
