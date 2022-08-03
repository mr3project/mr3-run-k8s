import * as state from '../state';
import { expand } from '../util-fs';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.superset.secret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    stringData: {
      [env.consts.name.superset.configScript]: expand('./server/superset-resources/superset_config.py', s)
    }
  };
}

