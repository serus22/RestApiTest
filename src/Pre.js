// @flow


import * as React from 'react';

// -----------------------------------------------------------------------------

export type PreProps = {|
  loading?: boolean,
  value: any
|};

// -----------------------------------------------------------------------------

export default class Pre extends React.PureComponent<PreProps> {

  render (): React.Node {
    const { value, loading } = this.props;
    return <pre className={loading ? 'loading' : ''}>
      {JSON.stringify(value, null, 2)}
    </pre>;
  }
}
