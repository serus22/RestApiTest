// @flow

import * as React from 'react';
import { observe } from 'mobx';

import ApiStore from './Store';
import type { ApiResult, Endpoint } from './index';

// -----------------------------------------------------------------------------

export type QueryDefinition = [string, {}];

export type ApiResults = {
  [string]: ApiResult
};

type QueryState = {|
  endpoints: { [string]: any },
  results: ApiResults,
  loading: boolean
|};

export type QueryProps = {|
  children: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  queries: { [string]: QueryDefinition },
  endpoints: { [string]: Endpoint },
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
  disposer: any;

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
    const endpoints = Object.keys(props.queries).reduce((obj, key) => {
      const template = props.endpoints[props.queries[key][0]];

      if (! template || typeof template !== 'function') {
        throw new Error('Invalid enpoint name "' + props.queries[key][0] + '"');
      }

      const query = template(props.queries[key][1]);

      if (! prevState.endpoints[key]
        || (prevState.endpoints[key] && prevState.endpoints[key].url !== query.url)) {
        obj[key] = query;
        update = true;
      } else {
        obj[key] = prevState.endpoints[key];
      }
      return obj;
    }, {});

    if (! update) {
      return null;
    }

    const results: ApiResults = Object.keys(endpoints).reduce((obj, key) => {
      obj[key] = props.store.get(endpoints[key]);
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
      const id = this.state.endpoints[key].url;
      if (change.newValue[id] !== change.oldValue[id]) {
        results[key] = change.newValue[id]
          ? { ...change.newValue[id] }
          : this.props.store.get(this.state.endpoints[key]);
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
    this.disposer = observe(this.props.store, 'cache', this.listener);
  }

  // ---------------------------------------------------------------------------

  componentWillUnmount (): void {
    this.disposer();
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

  componentDidUpdate (): void {
    this.props.onUpdate && this.props.onUpdate(
      this.state.results,
      this.state.loading
    );
  }
}
