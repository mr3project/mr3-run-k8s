import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.amConfigMapSpark,
      namespace: env.basics.namespace
    },
    data: env.randoms.amConfigSpark
  };
}
