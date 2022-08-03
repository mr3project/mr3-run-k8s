import * as state from '../state';
import { expand } from '../util-fs';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.envSecretSpark,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    stringData: {
      [env.consts.name.envSecretScript]: expand('./server/spark-resources/env-secret.sh', s)
    }
  };
}
