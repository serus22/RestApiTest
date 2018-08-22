// @flow

import * as React from 'react';

import Mutation from './Mutation';
import { Consumer } from './ApiProvider';

import type { MutationProps } from './Mutation';

// -----------------------------------------------------------------------------

export type ApiMutationProps = {|
  onSuccess?: $ElementType<MutationProps, 'onSuccess'>,
  children: $ElementType<MutationProps, 'children'>,
  query: $ElementType<MutationProps, 'query'>
|};

// -----------------------------------------------------------------------------

export default class ApiMutation extends React.PureComponent<ApiMutationProps> {

  render (): React.Node {
    return <Consumer>
      {({ store, endpoints }) => <Mutation
        endpoints={endpoints}
        store={store}
        {...this.props} />}
      </Consumer>;
    }
}

