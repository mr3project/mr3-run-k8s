import * as state from '../../../server/state';

export function build(s: state.T) {
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name: env.basics.namespace
    }
  };
}
