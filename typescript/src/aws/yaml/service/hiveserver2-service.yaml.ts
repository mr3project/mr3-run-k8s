import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.consts !== undefined);
  assert(env.service !== undefined);

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.hive.service,
      namespace: env.service.namespace
    },
    spec: {
      type: "LoadBalancer",
      selector: {
        hivemr3_app: env.consts.name.hive.service
      },
      ports: [
        { protocol: "TCP",
          port: env.consts.hive.port,
          targetPort: env.consts.hive.port,
          name: "thrift" },
        { protocol: "TCP",
          port: env.consts.hive.httpport,
          targetPort: env.consts.hive.httpport,
          name: "http" }
      ]
    }
  };
}
