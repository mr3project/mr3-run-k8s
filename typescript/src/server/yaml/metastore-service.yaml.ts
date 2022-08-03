import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.metastore.kind === "internal");
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.metastore.service,
      namespace: env.basics.namespace
    },
    spec: {
      clusterIP: "None",
      selector: {
        hivemr3_app: env.consts.name.metastore.service
      },
      ports: [
        { name: "tcp",
          port: env.consts.metastore.port,
          targetPort: env.consts.metastore.port }
      ]
    }
  };
}
